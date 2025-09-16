import os
import json
import traceback
import datetime
from cities_data.utils.logger_config import get_logger

# 获取日志记录器
logger = get_logger(__name__)


def safe_file_operation(operation_func, *args, **kwargs):
    """安全的文件操作包装器"""
    try:
        return operation_func(*args, **kwargs)
    except Exception as e:
        logger.error(f"❌ 文件操作失败: {e}")
        logger.error(traceback.format_exc())
        return False


def get_output_dir():
    """获取输出目录路径"""
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(output_dir, exist_ok=True)
    return output_dir


def get_city_data_file_path(city):
    """获取城市数据文件路径"""
    return os.path.join(get_output_dir(), f"{city}_tourism_data.json")


def get_tourism_data_file_path():
    """获取汇总数据文件路径"""
    return os.path.join(get_output_dir(), "tourism_data.json")


def get_failed_responses_dir():
    """获取失败响应目录路径"""
    failed_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "failed_responses")
    os.makedirs(failed_dir, exist_ok=True)
    return failed_dir


def _save_failed_response_impl(city, response_text):
    """保存失败响应的实际实现"""
    # 创建失败响应目录
    failed_dir = get_failed_responses_dir()
    
    # 保存响应到文件
    filename = f"{city}_failed_response.txt"
    file_path = os.path.join(failed_dir, filename)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(f"城市: {city}\n")
        f.write(f"时间: {datetime.datetime.now().isoformat()}\n")
        f.write("=" * 50 + "\n")
        f.write(response_text)
    
    logger.info(f"💾 {city} 的失败响应已保存到: {file_path}")
    return True


def _save_results_to_file_impl(results, file_path):
    """保存结果到文件的实际实现"""
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    logger.info(f"✅ 已生成并保存到 {file_path}")
    return True


def save_individual_city_files(results, output_dir=None):
    """为每个城市保存独立的 JSON 文件"""
    try:
        # 如果没有指定输出目录，使用默认目录
        if output_dir is None:
            output_dir = get_output_dir()
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
        
        saved_count = 0
        for city, data in results.items():
            # 使用统一的文件路径
            file_path = get_city_data_file_path(city)
            
            # 保存单个城市的数据
            city_data = {city: data}
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(city_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"✅ {city} 的数据已保存到 {file_path}")
            saved_count += 1
        
        logger.info(f"✅ 共保存了 {saved_count} 个城市的独立 JSON 文件")
        return True
    except Exception as e:
        logger.error(f"❌ 保存独立城市文件时出错: {e}")
        logger.error(traceback.format_exc())
        return False


def save_results_to_file(results, filename=None):
    """保存结果到文件"""
    # 使用统一的文件路径
    if filename is None:
        file_path = get_tourism_data_file_path()
    else:
        file_path = os.path.join(get_output_dir(), filename)
    return safe_file_operation(_save_results_to_file_impl, results, file_path)


def save_failed_response(city, response_text):
    """保存失败的响应以便调试"""
    return safe_file_operation(_save_failed_response_impl, city, response_text)