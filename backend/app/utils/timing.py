# utils/timing.py
import time
from contextlib import contextmanager
from fastapi import Request
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# 存储请求状态的全局字典（在实际应用中可能需要使用更可靠的存储方式）
request_state = {}

@contextmanager
def db_timer(request: Request, operation: str = "db_operation"):
    """
    数据库操作耗时记录上下文管理器
    
    Args:
        request: FastAPI请求对象
        operation: 数据库操作描述
    """
    request_id = f"{id(request)}"
    start_time = time.time()
    
    try:
        logger.debug(f"开始数据库操作: {operation}")
        yield
    finally:
        duration = time.time() - start_time
        logger.debug(f"数据库操作完成: {operation}, 耗时: {duration*1000:.2f}ms")
        
        # 记录到请求状态中
        if request_id in request_state:
            request_state[request_id]["db_time"] += duration

def record_db_time(request: Request, duration: float):
    """
    记录数据库操作耗时的辅助函数
    
    Args:
        request: FastAPI请求对象
        duration: 数据库操作耗时（秒）
    """
    request_id = f"{id(request)}"
    if request_id in request_state:
        request_state[request_id]["db_time"] += duration

def get_db_time(request: Request) -> float:
    """
    获取请求的数据库总耗时
    
    Args:
        request: FastAPI请求对象
        
    Returns:
        float: 数据库总耗时（秒）
    """
    request_id = f"{id(request)}"
    return request_state.get(request_id, {}).get("db_time", 0)

def init_request_state(request: Request):
    """
    初始化请求状态
    
    Args:
        request: FastAPI请求对象
    """
    request_id = f"{id(request)}"
    request_state[request_id] = {
        "start_time": time.time(),
        "db_time": 0,
        "logic_time": 0
    }

def cleanup_request_state(request: Request):
    """
    清理请求状态
    
    Args:
        request: FastAPI请求对象
    """
    request_id = f"{id(request)}"
    if request_id in request_state:
        del request_state[request_id]

def get_total_time(request: Request) -> float:
    """
    获取请求总耗时
    
    Args:
        request: FastAPI请求对象
        
    Returns:
        float: 请求总耗时（秒）
    """
    request_id = f"{id(request)}"
    if request_id in request_state:
        return time.time() - request_state[request_id]["start_time"]
    return 0