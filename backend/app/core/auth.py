# 用户登录注册的逻辑都放在前端
# 这里只是做接受 token 获取用户信息
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional

from app.core.config import settings
from app.utils.logger import setup_logger

# 初始化 logger
logger = setup_logger(__name__)

# --- Constants ---
SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET
DEV_USER_ID = "dev-user-id"

# --- Pydantic Models ---
class TokenPayload(BaseModel):
    sub: str  # Subject (the user ID)
    aud: str  # Audience
    # 可以根据需要添加其他声明，例如 exp (expiration time)

# --- Security Schemes ---
# 用 HTTPBearer 替代 OAuth2PasswordBearer
# auto_error=False 允许我们自定义未提供 Token 时的行为
bearer_scheme = HTTPBearer(auto_error=False)

# --- Core Logic ---
def get_user_id_from_token(token: str) -> str:
    """
    核心的 Token 验证逻辑，验证一个 JWT 并返回 user_id。
    """
    try:
        payload_dict = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        payload = TokenPayload(**payload_dict)
        logger.info("成功解析 Token, 用户 ID: %s", payload.sub)
        return payload.sub
    except JWTError as e:
        logger.error("Token 解码失败或无效: %s", str(e), exc_info=True)
        raise HTTPException(status_code=401, detail="Token 无效或过期")
    except Exception as e:
        logger.error("解析 Token Payload 失败: %s", str(e), exc_info=True)
        raise HTTPException(status_code=401, detail="Token 格式不正确")

# --- FastAPI Dependency Class ---
class UserAuthenticator:
    """
    一个可配置的 FastAPI 依赖类，用于处理用户认证。
    通过 `required` 参数控制认证是否是强制性的。
    """
    def __init__(self, required: bool = True):
        self.required = required

    def __call__(self, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> Optional[str]:
        if settings.AUTH_DISABLED:
            logger.warning("认证已禁用! 返回虚拟用户ID: %s", DEV_USER_ID)
            return DEV_USER_ID

        if credentials is None:
            if self.required:
                logger.warning("请求需要认证，但未提供 Token")
                raise HTTPException(
                    status_code=401,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                logger.info("请求未提供 Token，视为匿名用户访问")
                return None

        token = credentials.credentials  # 提取 Bearer Token
        try:
            return get_user_id_from_token(token)
        except HTTPException as e:
            if self.required:
                raise e
            else:
                logger.warning("提供了无效 Token，视为匿名用户访问")
                return None

# --- Dependency Instances ---
require_user = UserAuthenticator(required=True)
optional_user = UserAuthenticator(required=False)
