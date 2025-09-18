import os
import json
import httpx
import time, random, traceback
from datetime import datetime
from pathlib import Path
from google import genai
from google.genai import types
from utils.logger_config import get_logger

# ================== 日志工具 ==================
logger = get_logger(__name__)

# ================== 路径定义 ==================
BASE_DIR = Path(__file__).resolve().parent
SOURCE_DIR = BASE_DIR / "source"
RESULTS_DIR = BASE_DIR / "results"
CITIES_FILE = SOURCE_DIR / "china_cities.json"
PROMPT_FILE = SOURCE_DIR / "prompt.txt"

# ================== Gemini 客户端 ==================
api_key = os.getenv("GEMINI_API_KEY")
logger.info(f"GEMINI_API_KEY: {api_key[:5]}...{api_key[-5:] if api_key else '未设置'}")
if not api_key:
    raise ValueError("请设置环境变量 GEMINI_API_KEY")

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(timeout=300)  # 总超时 300 秒
)

# ================== 参数配置 ==================
generation_config = types.GenerateContentConfig(
    temperature=0.5,
    top_p=0.9,
    response_mime_type="application/json"
)

models_to_try = ["gemini-2.5-flash"]

# ================== 限速器 ==================
MAX_CALLS_PER_MINUTE = 1
_interval = 60 / MAX_CALLS_PER_MINUTE
_last_call_time = 0

def rate_limit():
    """确保调用频率不超过限制"""
    global _last_call_time
    now = time.time()
    if now - _last_call_time < _interval:
        sleep_time = _interval - (now - _last_call_time)
        logger.info(f"限流中，等待 {sleep_time:.2f} 秒...")
        time.sleep(sleep_time)
    _last_call_time = time.time()

# ================== 核心函数 ==================
def load_cities():
    with open(CITIES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_prompt():
    with open(PROMPT_FILE, "r", encoding="utf-8") as f:
        return f.read()

def get_pending_cities(cities):
    existing = {f.stem for f in RESULTS_DIR.glob("*.json")}
    return [c for c in cities if c not in existing]

def safe_parse_json(text: str, city: str):
    """尝试解析 JSON，失败时保存原始输出"""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.error(f"⚠️ JSON 解析失败（城市: {city}），原始输出已保存")
        debug_file = RESULTS_DIR / f"{city}_raw.txt"
        with open(debug_file, "w", encoding="utf-8") as f:
            f.write(text)
        return None

def call_gemini(prompt, city, retries=3, delay=2):
    for model in models_to_try:
        for attempt in range(1, retries + 1):
            try:
                rate_limit()  # ⭐ 调用前限速
                start_time = time.time()
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=generation_config
                )
                elapsed_time = time.time() - start_time
                logger.info(f"✅ 模型 {model} 成功生成结果，用时 {elapsed_time:.2f} 秒")

                text = response.text.strip()
                data = safe_parse_json(text, city)
                if data:
                    return data, model

            except httpx.ReadTimeout as e:
                logger.warning(f"⚠️ [ReadTimeout] 模型 {model} 第 {attempt} 次失败")
            except httpx.ConnectTimeout as e:
                logger.warning(f"⚠️ [ConnectTimeout] 模型 {model} 第 {attempt} 次失败")
            except httpx.TransportError as e:
                logger.warning(f"⚠️ [TransportError] 模型 {model} 第 {attempt} 次失败")
            except Exception as e:
                logger.error(
                    f"❌ [其他异常] 模型 {model} 第 {attempt} 次失败: {repr(e)}\n{traceback.format_exc()}"
                )

            if attempt < retries:
                wait = delay * (2 ** attempt) + random.random()
                logger.info(f"{wait:.2f} 秒后重试...")
                time.sleep(wait)
            else:
                logger.warning(f"模型 {model} 超过最大重试次数，切换下一个模型。")
                break

    return None, None

def main():
    RESULTS_DIR.mkdir(exist_ok=True)

    cities = load_cities()
    prompt_template = load_prompt()
    pending_cities = get_pending_cities(cities)[:5]  # 仅处理前 5 个待处理城市

    total = len(pending_cities)
    logger.info(f"总城市数: {len(cities)}，待处理: {total}")

    success_count = 0
    fail_count = 0

    for idx, city in enumerate(pending_cities, start=1):
        logger.info(f"开始处理城市: {city}")

        prompt = prompt_template.replace("{destination}", city)

        result, model_used = call_gemini(prompt, city)

        if result:
            output_file = RESULTS_DIR / f"{city}.json"
            wrapped_result = {
                "model": model_used,
                "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "content": result
            }
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(wrapped_result, f, ensure_ascii=False, indent=2)
            logger.info(f"✅ 成功保存: {output_file} (model={model_used})")
            success_count += 1
        else:
            logger.warning(f"未能生成结果: {city}")
            fail_count += 1

        progress = f"{idx}/{total} ({(idx/total)*100:.1f}%)"
        logger.info(f"进度: {progress}")

    logger.info("全部任务完成 ✅")
    logger.info(f"成功: {success_count}，失败: {fail_count}，总计: {total}")

if __name__ == "__main__":
    main()
