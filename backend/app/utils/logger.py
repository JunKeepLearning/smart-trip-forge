# utils/logger.py
# uvicorn app.main:app --log-level info
import logging
import coloredlogs
from typing import Optional
import os

def setup_logger(name: Optional[str] = None) -> logging.Logger:
    """配置并返回预定义格式的logger"""
    logger = logging.getLogger(name)
    logger.info("这是一个日志消息")
    # 动态设置日志级别，默认 INFO
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger.setLevel(log_level)

    if not logger.handlers:  # 避免重复添加handler
        # 控制台日志
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

        # 文件日志（可选）
        log_file = os.getenv("LOG_FILE")
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

    # 避免重复安装 coloredlogs
    if not any(isinstance(h, coloredlogs.ColoredFormatter) for h in logger.handlers):
        coloredlogs.install(level=log_level, logger=logger)

    return logger
