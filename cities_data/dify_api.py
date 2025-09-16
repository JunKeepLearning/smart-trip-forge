import os
import requests
from dotenv import load_dotenv
import json
import traceback
# 导入日志配置
from cities_data.utils.logger_config import get_logger

# 获取日志记录器
logger = get_logger(__name__)

# 全局变量
API_KEY = None
API_URL = None  
headers = {}
tourism_cities = ["汕头"]
text_format = "json"

def init_api():
    """初始化 API 配置"""
    global API_KEY, API_URL, headers

    # 验证环境变量
    API_KEY = os.getenv("API_KEY")
    API_URL = os.getenv("API_URL")

    if not API_KEY or not API_URL:
        raise ValueError("请在 .env 文件中设置 API_KEY 和 API_URL 环境变量")
    logger.info(f"API_KEY: {API_KEY[:5]}...{API_KEY[-5:] if API_KEY else 'None'}")
    logger.info(f"API_URL: {API_URL}")

    # 请求头
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

def request_destination_info(city):
    """请求目的地信息（Blocking 模式）"""
    try:
        # 确保 API 已初始化
        if not API_KEY or not API_URL:
            init_api()
            
        payload = {
            "inputs": {
                "destination": city,
                "format": text_format
            },
            "response_mode": "blocking",  # 非流式输出 blocking
            "user": "test-user"
        }
        logger.info(f"请求中... 目的地: {city}")
        # 增加超时设置
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=100)

        logger.info(f"响应状态码: {resp.status_code}")
        logger.info(f"响应头: {dict(resp.headers)}")
        
        if resp.status_code != 200:
            logger.error(f"❌ 请求失败: {resp.status_code} {resp.text}")
            return None
        else:
            try:
                data = resp.json()
                logger.info("✅ 返回结果:")
                logger.info(json.dumps(data, ensure_ascii=False, indent=2))
                return data
            except json.JSONDecodeError:
                logger.warning(f"⚠️ 返回的不是 JSON: {resp.text}")
                return None
    except requests.exceptions.Timeout:
        logger.error(f"❌ 请求 {city} 超时")
        logger.error(traceback.format_exc())
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ 请求 {city} 失败: {e}")
        logger.error(traceback.format_exc())
        return None
    except Exception as e:
        logger.error(f"❌ 未知错误 {city}: {e}")
        logger.error(traceback.format_exc())
        return None

def fetch_all_cities_data(cities_list=None):
    """批量请求城市信息"""
    # 确保 API 已初始化
    if not API_KEY or not API_URL:
        init_api()
    
    # 使用传入的城市列表或默认列表
    cities = cities_list if cities_list is not None else tourism_cities
    
    results = {}
    for city in cities:
        result = request_destination_info(city)
        if result:
            results[city] = result
    
    # 记录所有结果
    logger.info("\n=== 所有请求结果 ===")
    for city, data in results.items():
        logger.info(f"{city}: {data.get('answer', '无结果') if data else '请求失败'}")
    
    return results

# 批量请求城市信息
if __name__ == "__main__":
    fetch_all_cities_data()
