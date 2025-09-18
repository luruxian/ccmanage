from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class APIKeyValidationRequest(BaseModel):
    """API密钥校验请求模型"""
    api_key: str
    timestamp: str
    service: str = "llm_proxy"


class APIKeyValidationSuccessData(BaseModel):
    """成功响应的数据部分"""
    valid: bool = True
    real_api_key: str
    user_id: str
    plan_type: str


class APIKeyValidationErrorData(BaseModel):
    """错误响应的数据部分"""
    valid: bool = False
    error_type: str
    expire_date: Optional[str] = None


class APIKeyValidationSuccessResponse(BaseModel):
    """成功响应模型"""
    status: str = "success"
    code: int = 200
    data: APIKeyValidationSuccessData


class APIKeyValidationErrorResponse(BaseModel):
    """错误响应模型"""
    status: str = "error"
    code: int
    message: str
    data: APIKeyValidationErrorData


class ErrorCodes:
    """错误代码常量"""
    PLAN_EXPIRED = 1001
    CREDITS_EXHAUSTED = 1002
    INVALID_API_KEY = 1003
    ACCOUNT_BANNED = 1004
    RATE_LIMIT_EXCEEDED = 1005
    VALIDATION_TIMEOUT = 1006
    VALIDATION_SERVICE_UNAVAILABLE = 1007
    INTERNAL_VALIDATION_ERROR = 1008