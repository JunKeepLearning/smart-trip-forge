from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(..., min_length=20)
    DEBUG: bool = Field(False, env="DEBUG")
    SUPABASE_JWT_SECRET: str = Field(..., env="SUPABASE_JWT_SECRET")
    ALLOW_ALL_USERS: bool = Field(False, env="ALLOW_ALL_USERS")
    TIANDITU_KEY: str = Field(..., env="TIANDITU_KEY")
    GAODE_KEY: str = Field(..., env="GAODE_KEY")
    class Config:
        env_file = ".env"
        extra = "ignore"  # 忽略额外环境变量

settings = Settings()

if __name__ == "__main__":
    print(settings.SUPABASE_URL)
    print(settings.SUPABASE_KEY)
    # print(settings.DATABASE_URL)
    print(settings.DEBUG)
    # print(settings.PROJECT_NAME)
    print(settings.SUPABASE_JWT_SECRET)
