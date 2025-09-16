import json
import os
import re
import sys
from typing import Dict, Any, List
import logging
from datetime import datetime
from pypinyin import lazy_pinyin, Style
import psycopg2
from cities_data.utils.supabase_db import create_db_connection, close_db_connection
# 使用新的日志配置模块
from cities_data.utils.logger_config import get_logger

logger = get_logger(__name__)

def _handle_insert_error(batch: List[Dict], batch_index: int, error: Exception) -> None:
    """处理插入数据库时的错误"""
    # 记录批次信息
    city_names = [city.get("name", "Unknown") for city in batch]
    logger.error(f"插入第 {batch_index} 批数据时发生错误: {str(error)}")
    logger.error(f"错误批次包含城市: {', '.join(city_names)}")

def _validate_city_data(city_data: Dict) -> bool:
    """验证单个城市数据的完整性"""
    try:
        name = city_data.get("destination", "")
        if not name:
            logger.warning("发现城市数据缺少名称字段")
            return False
        return True
    except Exception as e:
        logger.error(f"验证城市数据时发生错误: {str(e)}")
        return False

def read_pure_data(file_path: str) -> list:
    """读取pure_data.json文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"成功读取 {len(data)} 个城市的数据")
        return data
    except FileNotFoundError:
        logger.error(f"文件 {file_path} 未找到")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"JSON解析错误: {e}")
        raise
    except Exception as e:
        logger.error(f"读取文件时发生错误: {e}")
        raise

def generate_slug(name: str) -> str:
    """根据城市名生成slug，支持中英文"""
    if not name:
        return ""
    
    # 检查是否包含中文字符
    if re.search(r'[\u4e00-\u9fff]', name):
        # 对于中文，使用拼音（不加连字符）
        pinyin_list = lazy_pinyin(name, style=Style.NORMAL)
        slug = ''.join(pinyin_list)
    else:
        # 对于英文，保持原有逻辑
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
    
    # 清理和限制长度
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    return slug[:50].strip('-')

def map_to_cities_schema(city_data: dict) -> dict:
    """将城市数据映射到cities表结构"""
    # 提取基本信息
    name = city_data.get("destination", "")
    country = city_data.get("country", "")
    province = city_data.get("province", "")
    description = city_data.get("intro", {}).get("description", "")
    
    # 生成slug
    slug = generate_slug(name)
    
    # 获取当前时间
    now = datetime.now().isoformat()
    
    # 创建info字段，包含除基本字段外的所有信息
    info = {
        "intro": city_data.get("intro"),
        "food": city_data.get("food"),
        "accommodation": city_data.get("accommodation"),
        "transport": city_data.get("transport"),
        "experiences": city_data.get("experiences"),
        "local_culture": city_data.get("local_culture"),
        "tips": city_data.get("tips"),
        "routes": city_data.get("routes"),
        "nearby_cities": city_data.get("nearby_cities"),
        "nearby_spots": city_data.get("nearby_spots", [])
    }
    
    # 移除sights字段（如果存在）
    info.pop("sights", None)
    
    # 构建符合cities表结构的数据
    mapped_city = {
        "name": name,
        "slug": slug,
        "country": country,
        "province": province,
        "description": description,
        "created_at": now,
        "updated_at": now,
        "info": info
    }
    
    return mapped_city

def process_city_data(cities_data: list) -> list:
    """处理城市数据，移除sights字段并映射到cities表结构"""
    processed_cities = []
    valid_count = 0
    invalid_count = 0
    
    for city in cities_data:
        # 验证城市数据
        if not _validate_city_data(city):
            invalid_count += 1
            continue
            
        # 映射到cities表结构
        mapped_city = map_to_cities_schema(city)
        processed_cities.append(mapped_city)
        valid_count += 1
    
    logger.info(f"数据处理完成: {valid_count} 个有效城市, {invalid_count} 个无效城市")
    logger.info(f"映射完成 {len(processed_cities)} 个城市的数据到cities表结构")
    return processed_cities



def insert_cities_data(cities_data: list, batch_size: int = 10) -> int:
    """将城市数据分批插入到数据库的cities表中"""
    total_inserted = 0
    total_failed = 0
    
    # 创建数据库连接
    connection = create_db_connection()
    if not connection:
        logger.error("无法创建数据库连接")
        raise ConnectionError("无法连接到数据库")
    
    try:
        cursor = connection.cursor()
        
        # 准备插入语句
        insert_query = """
        INSERT INTO cities (name, slug, country, province, description, created_at, updated_at, info)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # 分批插入数据
        for i in range(0, len(cities_data), batch_size):
            batch = cities_data[i:i + batch_size]
            batch_index = i//batch_size + 1
            logger.info(f"正在插入第 {batch_index} 批数据，共 {len(batch)} 个城市")
            
            try:
                # 批量插入
                for city in batch:
                    cursor.execute(insert_query, (
                        city["name"],
                        city["slug"],
                        city["country"],
                        city["province"],
                        city["description"],
                        city["created_at"],
                        city["updated_at"],
                        json.dumps(city["info"]) if city["info"] else None
                    ))
                
                connection.commit()
                inserted_count = len(batch)
                total_inserted += inserted_count
                logger.info(f"成功插入第 {batch_index} 批数据，共 {inserted_count} 个城市")
                
            except Exception as batch_error:
                connection.rollback()
                total_failed += len(batch)
                _handle_insert_error(batch, batch_index, batch_error)
                continue
        
        cursor.close()
        logger.info(f"数据插入完成: 成功 {total_inserted} 个城市, 失败 {total_failed} 个城市")
        return total_inserted
        
    except Exception as e:
        logger.error(f"数据库插入数据时发生错误: {e}")
        raise
    finally:
        close_db_connection(connection)



def main(insert_data: bool = False):
    """主函数"""
    try:
        # 文件路径
        file_path = os.path.join(os.path.dirname(__file__), 'pure_data.json')
        logger.info(f"正在读取数据文件: {file_path}")
        
        # 读取数据
        cities_data = read_pure_data(file_path)
        logger.info(f"成功读取 {len(cities_data)} 个城市的数据")
        
        # 处理数据
        processed_data = process_city_data(cities_data)
        logger.info(f"数据处理完成，共处理 {len(processed_data)} 个有效城市")
        
        # 打印第一个城市的示例数据以验证
        if processed_data:
            logger.info("示例数据（第一个城市）:")
            logger.info(json.dumps(processed_data[0], ensure_ascii=False, indent=2)[:500] + "...")
        
        # 如果需要插入数据
        if insert_data:
            logger.info("开始插入数据到数据库")
            # 插入数据
            inserted_count = insert_cities_data(processed_data)
            logger.info(f"数据导入完成，共插入 {inserted_count} 个城市的数据")
        else:
            logger.info("数据处理完成。如需导入数据到数据库，请使用 --insert 参数运行脚本")
            
    except Exception as e:
        logger.error(f"程序执行过程中发生错误: {e}")
        logger.error(f"错误类型: {type(e).__name__}")
        sys.exit(1)

if __name__ == "__main__":
    # 检查命令行参数
    insert_data = "--insert" in sys.argv
    main(insert_data)