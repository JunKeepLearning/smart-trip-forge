import logging
import sys
import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# 从环境变量获取日志级别，默认为 INFO
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
if log_level == "DEBUG":
    level = logging.DEBUG
elif log_level == "WARNING":
    level = logging.WARNING
elif log_level == "ERROR":
    level = logging.ERROR
else:
    level = logging.INFO

# 配置基本日志输出
logging.basicConfig(
    stream=sys.stdout,
    level=level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True  # 强制重新配置日志（Python 3.8+）
)

# 强制刷新 stdout 以确保日志立即显示
sys.stdout.flush()

def get_logger(name: str) -> logging.Logger:
    """获取配置好的日志记录器"""
    logger = logging.getLogger(name)
    return logger