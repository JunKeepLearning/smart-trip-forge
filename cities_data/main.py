#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Dify 数据处理主程序
提供统一的命令行接口来执行各种数据处理任务
"""

import sys
import os
import argparse
import traceback

# 添加项目根目录到 Python 路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# 导入日志配置
from cities_data.utils.logger_config import get_logger

logger = get_logger(__name__)


def fetch_data():
    """从 Dify API 获取数据"""
    try:
        logger.info("开始从 Dify API 获取数据...")
        # 导入 dify_api 模块
        import dify_api
        # 执行数据获取
        dify_api.fetch_all_cities_data()
        logger.info("数据获取完成")
        return True
    except Exception as e:
        logger.error(f"获取数据时发生错误: {e}")
        logger.error(traceback.format_exc())
        return False


def extract_json():
    """从 CSV 提取纯净 JSON 数据"""
    try:
        logger.info("开始从 CSV 提取纯净 JSON 数据...")
        # 导入 extract_pure_json 模块
        from extract_pure_json import extract_pure_json_content
        # 执行数据提取
        results = extract_pure_json_content()
        logger.info(f"数据提取完成，共处理 {len(results)} 条记录")
        return True
    except Exception as e:
        logger.error(f"提取 JSON 数据时发生错误: {e}")
        logger.error(traceback.format_exc())
        return False


def import_cities():
    """导入城市数据到数据库"""
    try:
        logger.info("开始导入城市数据到数据库...")
        # 导入 import_cities 模块
        from import_cities import main as import_cities_main
        # 执行数据导入
        import_cities_main(insert_data=True)
        logger.info("城市数据导入完成")
        return True
    except Exception as e:
        logger.error(f"导入城市数据时发生错误: {e}")
        logger.error(traceback.format_exc())
        return False


def full_process():
    """执行完整流程"""
    logger.info("开始执行完整数据处理流程...")
    
    # 步骤1: 从 Dify API 获取数据
    if not fetch_data():
        logger.error("从 Dify API 获取数据失败，流程终止")
        return False
    
    # 步骤2: 从 CSV 提取纯净 JSON 数据
    if not extract_json():
        logger.error("从 CSV 提取 JSON 数据失败，流程终止")
        return False
    
    # 步骤3: 导入城市数据到数据库
    if not import_cities():
        logger.error("导入城市数据到数据库失败，流程终止")
        return False
    
    logger.info("完整数据处理流程执行完成")
    return True


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="Dify 数据处理工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
可用命令:
  fetch-data     从 Dify API 获取数据并保存到 CSV
  extract-json   从 CSV 提取纯净 JSON 数据
  import-cities  导入城市数据到数据库
  full-process   执行完整流程：fetch-data -> extract-json -> import-cities

使用示例:
  python main.py fetch-data
  python main.py extract-json
  python main.py import-cities
  python main.py full-process
  python main.py full-process --debug
        """
    )
    parser.add_argument(
        "command",
        choices=["fetch-data", "extract-json", "import-cities", "full-process"],
        help="要执行的命令"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="启用调试模式"
    )
    
    args = parser.parse_args()
    
    # 设置调试模式
    if args.debug:
        import logging
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("调试模式已启用")
    
    # 执行相应命令
    try:
        if args.command == "fetch-data":
            success = fetch_data()
        elif args.command == "extract-json":
            success = extract_json()
        elif args.command == "import-cities":
            success = import_cities()
        elif args.command == "full-process":
            success = full_process()
        else:
            logger.error(f"未知命令: {args.command}")
            success = False
        
        # 根据执行结果退出程序
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("用户中断程序执行")
        sys.exit(1)
    except Exception as e:
        logger.error(f"程序执行过程中发生未预期的错误: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)


if __name__ == "__main__":
    main()