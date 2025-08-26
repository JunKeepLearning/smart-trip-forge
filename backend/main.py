from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.data_api import router as data_router

from app.api.favorites_api import router as favorites_router
import time
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# 创建 FastAPI 应用实例
app = FastAPI(
    title="Travel App API",
    description="API for the Travel App, providing data for points of interest and regions.",
    version="1.0.0",
)

# ----------------配置CORS中间件------------
# 在生产环境中，应该将 allow_origins 设置为你的前端应用的实际域名
# 例如: allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 警告: 在生产环境中不安全
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

# ---------------- 路由注册 ----------------

app.include_router(data_router, prefix="/data", tags=["data"])
app.include_router(favorites_router, prefix="/api", tags=["Favorites"])
app.include_router(checklist_router, prefix="/checklists", tags=["Checklists"])

# 根路由
@app.get("/", summary="Root Endpoint", description="A simple root endpoint to check if the API is running.")
def read_root():
    """
    根路由，返回一个欢迎信息。
    这可以用来简单地检查 API 是否正在运行。
    """
    return {"message": "Welcome to the Travel App API!"}

# ---------------- 请求日志中间件 ----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    一个中间件，用于记录每个传入请求的详细信息以及响应。
    它会记录请求的方法、URL、客户端 IP、响应状态码和处理时长。
    """
    client_ip = request.client.host if request.client else "Unknown"
    start_time = time.time()
    
    logger.info(f"Request: {request.method} {request.url} - From: {client_ip}")

    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000  # 转换为毫秒
    logger.info(
        f"Response: {response.status_code} - "
        f"Duration: {process_time:.2f}ms"
    )
    
    return response
