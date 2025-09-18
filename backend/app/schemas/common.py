from pydantic import BaseModel
from typing import Optional, Any, Dict


class ErrorCodes:
    """错误代码常量"""
    # API密钥相关错误
    PLAN_EXPIRED = 1001
    CREDITS_EXHAUSTED = 1002
    INVALID_API_KEY = 1003
    ACCOUNT_BANNED = 1004
    RATE_LIMIT_EXCEEDED = 1005
    VALIDATION_TIMEOUT = 1006
    VALIDATION_SERVICE_UNAVAILABLE = 1007
    INTERNAL_VALIDATION_ERROR = 1008

    # 用户相关错误
    USER_NOT_FOUND = 2001
    USER_ALREADY_EXISTS = 2002
    INVALID_USER_DATA = 2003

    # 套餐相关错误
    PLAN_NOT_FOUND = 3001
    INSUFFICIENT_CREDITS = 3002
    PLAN_EXPIRED_ERROR = 3003


class BaseResponse(BaseModel):
    """基础响应模型"""
    status: str
    code: int
    message: str
    data: Optional[Any] = None


class SuccessResponse(BaseResponse):
    """成功响应模型"""
    status: str = "success"
    code: int = 200


class ErrorResponse(BaseResponse):
    """错误响应模型"""
    status: str = "error"


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 20
    skip: Optional[int] = None

    def __post_init__(self):
        if self.skip is None:
            self.skip = (self.page - 1) * self.page_size


class HealthCheckResponse(BaseModel):
    """健康检查响应模型"""
    status: str
    message: str
    database: str
    version: str