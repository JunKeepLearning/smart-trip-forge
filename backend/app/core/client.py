# client.py
from supabase import create_client, Client
from app.core.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# -----------Supabase 客户端初始化----------------
def get_supabase_client() -> Client:
    try:
        return create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_KEY
        )
    except Exception as e:
        logger.error(f"Supabase连接失败: {str(e)}")
        raise e

# -------- 测试 --------
def register_user(email, password):
    try:
        response = supabase.auth.sign_up({
            'email': email,
            'password': password
        })
        print("注册成功:", response)
        return response
    except Exception as e:
        print(f"注册失败: {str(e)}")
        return None
    
supabase = get_supabase_client()

if __name__ == "__main__":
    try:
        query = supabase.table("todo_items").select("*")
        response = query.execute()
        print(response.data)
    except Exception as e:
        print(f"获取待办事项失败: {str(e)}")
    
    register_user("test@example.com", "qwer1234")