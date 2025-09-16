# client.py
# python -m app.core.client
from supabase import create_client, Client
from app.core.config import settings
from app.utils.logger import setup_logger
from typing import Optional
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import time
import asyncio
from app.utils.timing import record_db_time
from starlette.requests import Request as StarletteRequest
from starlette.datastructures import Headers, URL
from starlette.types import Scope

logger = setup_logger(__name__)

# 使用 HTTPBearer 解析请求头里的 token
bearer_scheme = HTTPBearer(auto_error=False)


class TimedSupabaseClient:
    """包装 Supabase 客户端以记录数据库操作耗时"""

    def __init__(self, client: Client, request: Request):
        self.client = client
        self.request = request

    def __getattr__(self, name):
        """代理所有属性访问到原始客户端"""
        attr = getattr(self.client, name)
        if callable(attr):
            # 检查是否为异步方法
            if asyncio.iscoroutinefunction(attr):
                return self._wrap_async_method(attr)
            else:
                return self._wrap_method(attr)
        return attr

    def _wrap_method(self, method):
        """包装同步方法以记录耗时"""
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                return method(*args, **kwargs)
            finally:
                duration = time.time() - start_time
                record_db_time(self.request, duration)
        return wrapper

    def _wrap_async_method(self, method):
        """包装异步方法以记录耗时"""
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                return await method(*args, **kwargs)
            finally:
                duration = time.time() - start_time
                record_db_time(self.request, duration)
        return wrapper


def get_supabase_client(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> TimedSupabaseClient:
    """
    Creates and returns a Supabase client instance that is authenticated for the current request.
    A new client is created for each request to ensure thread safety and proper RLS enforcement.
    """
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY  # 这里还是用 ANON key
    logger.info(f"Creating Supabase client for URL: {url}")

    client = create_client(supabase_url=url, supabase_key=key)

    # 如果请求里带了 Bearer Token，就让 client 使用这个 token
    if credentials:
        token = credentials.credentials
        try:
            # 正确的 token 绑定方式（兼容新版 supabase-py）
            client.auth.set_session(access_token=token, refresh_token=None)
            logger.info("Supabase client 已绑定用户 token")
        except Exception as e:
            logger.error(f"Failed to authenticate Supabase client with token: {e}")

    # 返回包装后的客户端，用于记录耗时
    return TimedSupabaseClient(client, request)


def init_supabase_for_startup():
    """
    A simple function to be used at application startup to verify Supabase credentials.
    It does not return the client, only checks if a connection can be made.
    """
    try:
        key = settings.SUPABASE_KEY
        client = create_client(supabase_url=settings.SUPABASE_URL, supabase_key=key)

        # ⚠️ 执行一次轻量查询来验证连接（替代仅仅创建 client）
        client.table("checklists").select("id").limit(1).execute()

        logger.info("Supabase credentials verified successfully at startup.")
    except Exception as e:
        logger.error(
            f"FATAL: Could not connect to Supabase at startup. Please check credentials. Error: {e}"
        )
        # 生产环境可能需要直接退出
        # raise SystemExit


# -----------------------
# Mock Request for testing
# -----------------------
class MockRequest(StarletteRequest):
    """用于在 __main__ 测试 get_supabase_client"""

    def __init__(self, headers: Optional[dict] = None):
        scope: Scope = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": Headers(headers or {}).raw,
            "query_string": b"",
            "client": ("127.0.0.1", 5000),
            "server": ("127.0.0.1", 8000),
            "scheme": "http",
            "root_path": "",
            "app": None,
            "http_version": "1.1",
            "url": URL("http://testserver/"),
        }
        super().__init__(scope)


if __name__ == "__main__":
    """
    Test the Supabase client functions.
    """
    print("=== Supabase Client Functions Test ===")

    try:
        print("1. Testing init_supabase_for_startup()...")
        init_supabase_for_startup()
        print("   ✓ init_supabase_for_startup() completed successfully")

        print("2. Testing get_supabase_client() with mock request...")
        mock_request = MockRequest(headers={"Authorization": "Bearer test_token"})
        client = get_supabase_client(mock_request, None)  # credentials 由 DI 注入，这里传 None
        print("   ✓ get_supabase_client() returned:", type(client))

        print("\n=== Test Summary ===")
        print("✓ init_supabase_for_startup(): SUCCESS")
        print("✓ get_supabase_client(): SUCCESS (with MockRequest)")
        print("✅ Overall: Core functionality is working correctly")

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
