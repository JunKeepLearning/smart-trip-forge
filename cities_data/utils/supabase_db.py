import psycopg2
import logging
import os
from typing import Optional
# 使用新的日志配置模块
from cities_data.utils.logger_config import get_logger

logger = get_logger(__name__)
def create_db_connection() -> Optional[psycopg2.extensions.connection]:
    """创建直接的 PostgreSQL 数据库连接"""
    try:
        # 从环境变量获取数据库连接信息
        db_host = os.getenv("DB_HOST")
        db_port = os.getenv("DB_PORT")
        db_name = os.getenv("DB_NAME")
        db_user = os.getenv("DB_USER")
        db_password = os.getenv("DB_PASSWORD")
        
        if not all([db_host, db_port, db_name, db_user, db_password]):
            raise ValueError("请设置完整的数据库连接参数: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD")
        
        # 创建数据库连接
        connection = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        
        logger.info("成功创建数据库连接")
        return connection
        
    except Exception as e:
        logger.error(f"创建数据库连接时发生错误: {e}")
        return None

def close_db_connection(connection: psycopg2.extensions.connection) -> None:
    """关闭数据库连接"""
    try:
        if connection:
            connection.close()
            logger.info("数据库连接已关闭")
    except Exception as e:
        logger.error(f"关闭数据库连接时发生错误: {e}")

def test_db_connection() -> bool:
    """测试数据库连接"""
    try:
        connection = create_db_connection()
        if connection:
            cursor = connection.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            logger.info(f"数据库连接测试成功: {version[0]}")
            cursor.close()
            close_db_connection(connection)
            return True
        else:
            logger.error("无法创建数据库连接")
            return False
    except Exception as e:
        logger.error(f"数据库连接测试失败: {e}")
        return False

if __name__=="__main__":
    test_db_connection()