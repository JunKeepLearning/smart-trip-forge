import os
import json
import traceback
import datetime
import time
import argparse
from dotenv import load_dotenv
from google import genai
from cities_data.utils.logger_config import get_logger
from cities_data.utils.file_utils import (
    get_city_data_file_path,
    get_tourism_data_file_path,
    get_failed_responses_dir,
    save_individual_city_files,
    save_results_to_file,
    save_failed_response
)

# 获取日志记录器
logger = get_logger(__name__)

# 全局变量
API_KEY = None
model = None
tourism_cities = ["北京", "上海", "成都"]
default_model_name = "gemini-1.5-flash"

# Prompt 模板
PROMPT_TEMPLATE = None

def load_prompt_template():
    """从 source 文件夹加载 prompt 模板"""
    global PROMPT_TEMPLATE
    if PROMPT_TEMPLATE is None:
        prompt_file_path = os.path.join(os.path.dirname(__file__), "source", "prompt")
        with open(prompt_file_path, "r", encoding="utf-8") as f:
            PROMPT_TEMPLATE = f.read()
        logger.info("✅ 成功加载 prompt 模板")


def init_api(model_name=None):
    """初始化 Gemini API 配置"""
    global API_KEY, model

    # 验证环境变量
    API_KEY = os.getenv("GEMINI_API_KEY")

    if not API_KEY:
        raise ValueError("请在 .env 文件中设置 GEMINI_API_KEY 环境变量")
    logger.info(f"GEMINI_API_KEY: {API_KEY[:5]}...{API_KEY[-5:] if API_KEY else 'None'}")

    # 使用指定的模型名称或默认名称
    model_name = model_name if model_name else default_model_name

    # 初始化 Gemini
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel(model_name)
        logger.info(f"Gemini API 初始化成功，使用模型: {model_name}")
    except Exception as e:
        logger.error(f"❌ Gemini API 初始化失败: {e}")
        logger.error(traceback.format_exc())
        raise


def ensure_api_initialized(model_name=None):
    """确保 API 已初始化"""
    if not API_KEY or not model: 
        init_api(model_name)


def generate_city_info(city, model_name=None, max_retries=3):
    """生成城市旅游信息，包含重试机制"""
    # 使用指定的模型名称或默认名称
    model_name = model_name if model_name else default_model_name
    
    # 确保 API 已初始化
    ensure_api_initialized(model_name)
    
    # 确保 prompt 模板已加载
    try:
        load_prompt_template()
    except Exception as e:
        logger.error(f"❌ 加载 prompt 模板失败: {e}")
        logger.error(traceback.format_exc())
        return None
    
    for attempt in range(max_retries):
        try:
            prompt = PROMPT_TEMPLATE.format(destination=city)
            logger.info(f"请求中... 城市: {city} (尝试 {attempt + 1}/{max_retries})")
            
            # 生成内容
            response = model.generate_content(prompt)
            
            logger.info(f"✅ {city} 请求成功")
            return response
        except Exception as e:
            logger.warning(f"⚠️ 请求 {city} 失败 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                # 等待一段时间再重试
                time.sleep(2 ** attempt)  # 指数退避
            else:
                logger.error(f"❌ 请求 {city} 最终失败: {e}")
                logger.error(traceback.format_exc())
                return None


def process_city_data(city, response, results, failed_cities):
    """处理单个城市的数据"""
    if response:
        try:
            data = json.loads(response.text)
            # 验证数据完整性
            if validate_city_data(data, city):
                results[city] = data
                logger.info(f"✅ {city} 数据解析成功")
            else:
                logger.warning(f"⚠️ {city} 数据不完整")
                failed_cities.append(city)
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ {city} 的结果不是合法 JSON")
            logger.warning(f"原始响应: {response.text[:200]}...")
            # 保存原始响应以便调试
            save_failed_response(city, response.text)
            failed_cities.append(city)
        except Exception as e:
            logger.warning(f"⚠️ {city} 数据处理异常: {e}")
            failed_cities.append(city)
    else:
        logger.error(f"❌ {city} 数据获取失败")
        failed_cities.append(city)


def fetch_all_cities_data(cities_list=None, skip_existing=True):
    """批量生成城市旅游信息
    
    Args:
        cities_list: 城市列表，默认使用内置列表
        skip_existing: 是否跳过已存在的有效数据文件
    """
    # 确保 API 已初始化
    ensure_api_initialized()
    
    # 使用传入的城市列表或默认列表
    cities = cities_list if cities_list is not None else tourism_cities
    
    results = {}
    failed_cities = []
    
    for city in cities:
        # 检查是否跳过已存在的有效数据
        if skip_existing:
            existing_data = load_existing_city_data(city)
            if existing_data:
                results[city] = existing_data[city]
                continue
        
        # 生成新数据
        response = generate_city_info(city)
        process_city_data(city, response, results, failed_cities)
    
    # 记录所有结果
    logger.info(f"\n=== 批量处理结果 ===")
    logger.info(f"成功: {len(results)} 个城市")
    logger.info(f"失败: {len(failed_cities)} 个城市")
    if failed_cities:
        logger.info(f"失败城市列表: {', '.join(failed_cities)}")
    
    return results

def validate_city_data(data, city, data_type="new"):
    """验证城市数据的完整性
    
    Args:
        data: 城市数据
        city: 城市名称
        data_type: 数据类型，"new" 表示新生成的数据，"existing" 表示已存在的数据
    """
    # 检查数据是否为空
    if not data:
        return False
    
    # 对于已存在的数据，需要检查是否包含城市键
    if data_type == "existing":
        if city not in data:
            return False
        city_data = data[city]
    else:
        city_data = data
    
    # 新的 JSON 结构字段
    required_fields = [
        "destination", "country", "province", "intro", "sights", "food", 
        "accommodation", "transport", "experiences", "local_culture", 
        "tips", "routes", "nearby_cities"
    ]
    
    # 检查必需字段是否存在
    for field in required_fields:
        if field not in city_data:
            logger.warning(f"⚠️ {city} 数据缺少字段: {field}")
            return False
    
    # 检查字段类型
    if not isinstance(city_data["sights"], list):
        logger.warning(f"⚠️ {city} sights 应该是数组")
        return False
        
    if not isinstance(city_data["food"], list):
        logger.warning(f"⚠️ {city} food 应该是数组")
        return False
        
    if not isinstance(city_data["accommodation"], list):
        logger.warning(f"⚠️ {city} accommodation 应该是数组")
        return False
        
    if not isinstance(city_data["routes"], list):
        logger.warning(f"⚠️ {city} routes 应该是数组")
        return False
        
    if not isinstance(city_data["nearby_cities"], list):
        logger.warning(f"⚠️ {city} nearby_cities 应该是数组")
        return False
    
    # 检查 intro 字段
    if not isinstance(city_data["intro"], dict):
        logger.warning(f"⚠️ {city} intro 应该是对象")
        return False
    
    # 检查 transport 字段
    if not isinstance(city_data["transport"], dict):
        logger.warning(f"⚠️ {city} transport 应该是对象")
        return False
    
    # 检查 experiences 字段
    if not isinstance(city_data["experiences"], dict):
        logger.warning(f"⚠️ {city} experiences 应该是对象")
        return False
    
    # 检查 local_culture 字段
    if not isinstance(city_data["local_culture"], dict):
        logger.warning(f"⚠️ {city} local_culture 应该是对象")
        return False
    
    # 检查 tips 字段
    if not isinstance(city_data["tips"], dict):
        logger.warning(f"⚠️ {city} tips 应该是对象")
        return False
    
    # 对于新生成的数据，额外检查数组元素结构
    if data_type == "new":
        # 检查数组元素结构（简单检查前几个元素）
        if city_data["sights"]:
            sight = city_data["sights"][0]
            if not isinstance(sight, dict) or "name" not in sight:
                logger.warning(f"⚠️ {city} sights 元素结构不正确")
                return False
        
        if city_data["food"]:
            food = city_data["food"][0]
            if not isinstance(food, dict) or "name" not in food:
                logger.warning(f"⚠️ {city} food 元素结构不正确")
                return False
        
        if city_data["accommodation"]:
            accommodation = city_data["accommodation"][0]
            if not isinstance(accommodation, dict) or "area" not in accommodation:
                logger.warning(f"⚠️ {city} accommodation 元素结构不正确")
                return False
    
    return True


def load_existing_city_data(city):
    """加载已存在的城市数据"""
    try:
        file_path = get_city_data_file_path(city)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if validate_city_data(data, city, data_type="existing"):
                    logger.info(f"✅ 加载已存在的 {city} 数据")
                    return data
                else:
                    logger.warning(f"⚠️ {city} 现有数据无效，将重新生成")
                    return None
        else:
            return None
    except Exception as e:
        logger.warning(f"⚠️ 加载 {city} 现有数据时出错: {e}")
        return None




def main(cities_list=None, save_mode="individual"):
    """主函数
    
    Args:
        cities_list: 城市列表，默认使用内置列表
        save_mode: 保存模式，"individual" 为每个城市独立文件，"single" 为单个文件
    """
    try:
        logger.info("开始生成城市旅游数据...")
        
        # 获取所有城市数据
        results = fetch_all_cities_data(cities_list)
        
        # 保存结果
        if results:
            if save_mode == "individual":
                # 为每个城市保存独立的 JSON 文件
                success = save_individual_city_files(results)
                if success:
                    logger.info(f"✅ 共处理 {len(results)} 个城市的数据，并保存为独立文件")
                else:
                    logger.error("❌ 保存独立城市文件失败")
            else:
                # 保存到单个文件
                success = save_results_to_file(results)
                if success:
                    logger.info(f"✅ 共处理 {len(results)} 个城市的数据，并保存到单个文件")
                else:
                    logger.error("❌ 保存结果文件失败")
        else:
            logger.warning("⚠️ 没有成功获取任何城市数据")
            
    except Exception as e:
        logger.error(f"❌ 程序执行过程中发生错误: {e}")
        logger.error(traceback.format_exc())


# 批量生成城市旅游信息
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="生成城市旅游数据")
    parser.add_argument(
        "--save-mode",
        choices=["individual", "single"],
        default="individual",
        help="保存模式：individual（每个城市独立文件）或 single（单个文件）"
    )
    
    args = parser.parse_args()
    main(save_mode=args.save_mode)
