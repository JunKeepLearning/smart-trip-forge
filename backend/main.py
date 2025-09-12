from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.data_api import router as data_router
from app.api.checklist_api import router as checklist_router
from app.api.favorites_api import router as favorites_router
from app.core.client import init_supabase_for_startup
import time
from app.utils.logger import setup_logger
from app.utils.timing import init_request_state, cleanup_request_state, get_db_time, get_total_time

from fastapi import FastAPI, Depends
from app.core.auth import require_user

logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 在应用启动时初始化 Supabase 客户端
    init_supabase_for_startup()
    logger.info("Application startup complete.")
    yield
    # 在应用关闭时可以添加清理代码 (如果需要)
    logger.info("Application shutdown.")

# 创建 FastAPI 应用实例
app = FastAPI(
    title="Travel App API",
    description="API for the Travel App, providing data for points of interest and regions.",
    version="1.0.0",
    lifespan=lifespan
)

# ----------------配置CORS中间件------------
# 在生产环境中，应该将 allow_origins 设置为你的前端应用的实际域名
# 例如: allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],  # 警告: 在生产环境中不安全
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

# ---------------- 路由注册 ----------------

app.include_router(data_router, prefix="/data", tags=["data"])
app.include_router(favorites_router, prefix="/favorites", tags=["Favorites"])
app.include_router(checklist_router, prefix="/checklists", tags=["Checklists"])

# 根路由
@app.get("/", summary="Root Endpoint", description="A simple root endpoint to check if the API is running.")
def read_root():
    """
    根路由，返回一个欢迎信息。
    这可以用来简单地检查 API 是否正在运行。
    """
    return {"message": "Welcome to the Travel App API!"}

@app.get("/me")
def read_me(user_id: str = Depends(require_user)):
    return {"user_id": user_id}

# ---------------- 请求耗时分析中间件 ----------------
@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    """
    一个中间件，用于分析请求耗时，区分后端逻辑耗时和数据库耗时。
    """
    client_ip = request.client.host if request.client else "Unknown"
    
    # 记录请求开始时间
    start_time = time.time()
    logger.info(f"Request: {request.method} {request.url} - From: {client_ip}")
    
    # 初始化请求状态
    init_request_state(request)
    
    try:
        response = await call_next(request)
    finally:
        # 清理请求状态
        cleanup_request_state(request)
    
    # 计算总耗时
    total_time = get_total_time(request) * 1000  # 转换为毫秒
    db_time = get_db_time(request) * 1000  # 转换为毫秒
    logic_time = total_time - db_time
    
    logger.info(
        f"Response: {response.status_code} - "
        f"Total: {total_time:.2f}ms | "
        f"Logic: {logic_time:.2f}ms | "
        f"DB: {db_time:.2f}ms"
    )
    
    return response
