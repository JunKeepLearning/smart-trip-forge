# 用户登录注册的逻辑都放在前端
# 这里只是做接受token获取用户信息
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.utils.logger import setup_logger

# 初始化 logger
logger = setup_logger(__name__)

SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET

# OAuth2PasswordBearer 会从请求的 Authorization Header 中提取 Bearer Token
# auto_error=False 让我们可以在 token 不存在时自定义错误，而不是直接抛出 FastAPI 的默认错误
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_user_id_from_token(token: str) -> str:
    """
    核心的 Token 验证逻辑，验证一个 JWT 并返回 user_id。
    """
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("Token 中缺少用户信息 (sub): %s", token)
            raise HTTPException(status_code=401, detail="Token 中缺少用户信息")
        logger.info("成功解析 Token, 用户 ID: %s", user_id)
        return user_id
    except JWTError as e:
        logger.error("Token 解码失败或无效: %s", str(e), exc_info=True)
        raise HTTPException(status_code=401, detail="Token 无效或过期")

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """
    作为一个 FastAPI 依赖项，从请求中获取并验证 token，最终返回用户ID。
    如果配置中 AUTH_DISABLED=True，则跳过验证并返回一个虚拟ID用于开发调试。
    """
    if settings.AUTH_DISABLED:
        logger.warning("认证已禁用! 返回虚拟用户ID: dev-user-id")
        return "dev-user-id"

    if token is None:
        # 如果请求头中完全没有 Authorization bearer token
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return get_user_id_from_token(token)
