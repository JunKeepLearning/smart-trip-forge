# 用户登录注册的逻辑都放在前端
# 这里只是做接受token获取用户信息
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
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
# OAuth2PasswordBearer 会从请求的 Authorization Header 中提取 Bearer Token
# auto_error=False 让我们可以在 token 不存在时自定义错误
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

# --- Core Logic ---
def get_user_id_from_token(token: str) -> str:
    """
    核心的 Token 验证逻辑，验证一个 JWT 并返回 user_id。
    """
    try:
        payload_dict = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
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

    def __call__(self, token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
        """
        使得类的实例可以像函数一样被调用。
        FastAPI 会调用这个方法来执行依赖注入的逻辑。
        """
        if settings.AUTH_DISABLED:
            logger.warning("认证已禁用! 返回虚拟用户ID: %s", DEV_USER_ID)
            return DEV_USER_ID

        if token is None:
            if self.required:
                # 严格模式：如果需要认证但 token 不存在，则抛出异常
                logger.warning("请求需要认证，但未提供 Token")
                raise HTTPException(
                    status_code=401,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                # 灵活模式：如果认证是可选的，则返回 None，表示匿名用户
                logger.info("请求未提供 Token，视为匿名用户访问")
                return None
        
        try:
            # 如果 token 存在，则尝试验证并返回 user_id
            return get_user_id_from_token(token)
        except HTTPException as e:
            # 如果 token 验证失败 (例如，过期或格式错误)
            if self.required:
                # 严格模式：重新抛出异常
                raise e
            else:
                # 灵活模式：将无效 token 视为匿名用户，返回 None
                logger.warning("提供了无效 Token，视为匿名用户访问")
                return None

# --- Dependency Instances ---
# 创建两个实例以在应用中方便地使用
require_user = UserAuthenticator(required=True)
optional_user = UserAuthenticator(required=False)