import os
from typing import List
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Settings:
    """应用配置"""

    # 项目信息
    PROJECT_NAME: str = "agnets.app API"
    PROJECT_DESCRIPTION: str = "agnets.app系统的后端API服务"
    VERSION: str = "1.0.0"

    # 服务器配置
    SERVER_HOST: str = os.getenv("SERVER_HOST", "127.0.0.1")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8001"))
    DEBUG: bool = os.getenv("ENVIRONMENT") == "development"

    # 数据库配置
    MYSQL_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    MYSQL_PORT: int = int(os.getenv("DB_PORT", "3306"))
    MYSQL_USER: str = os.getenv("DB_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    MYSQL_DATABASE: str = os.getenv("DB_NAME", "ccmanage")

    @property
    def DATABASE_URL(self) -> str:
        """构建数据库连接URL"""
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"

    # 日志配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "logs/app.log")

    # 安全配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")

    # CORS配置
    ALLOWED_HOSTS: List[str] = ["*"]  # 生产环境应限制来源

    # 数据库连接池配置
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "20"))

    # 邮件配置
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "agnets.app系统")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"

    # JWT配置
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # 前端配置
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # 后端配置
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8001")

# 创建设置实例
settings = Settings()