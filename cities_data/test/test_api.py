import os
import time
import traceback
from google import genai
from google.genai import types
from utils.logger_config import get_logger

# ================== 日志工具 ==================
logger = get_logger(__name__)

# 初始化客户端（只用 api_key，不加其他参数）
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 配置参数（保持最小化）
generation_config = types.GenerateContentConfig(
    temperature=0.5,
    response_mime_type="application/json"
)

def test_gemini():
    """最小化测试：验证 Gemini API 是否可用"""
    try:
        start_time = time.time()

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="请简要介绍一下澳门",
            config=generation_config
        )

        elapsed_time = time.time() - start_time
        print("✅ API 调用成功！")
        print(f"⏱️  调用耗时: {elapsed_time:.2f} 秒")
        print("输出内容：\n", response.text)

    except Exception as e:
        print("❌ API 调用失败：", repr(e))
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
