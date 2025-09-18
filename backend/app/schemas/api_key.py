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


class APIKeyCreate(BaseModel):
    """创建API密钥请求模型"""
    api_key: str
    real_api_key: str
    key_name: Optional[str] = None
    description: Optional[str] = None


class APIKeyUpdate(BaseModel):
    """更新API密钥请求模型"""
    key_name: Optional[str] = None
    description: Optional[str] = None
    real_api_key: Optional[str] = None
    is_active: Optional[bool] = None


class APIKeyResponse(BaseModel):
    """API密钥响应模型"""
    id: int
    user_id: str
    api_key: str
    key_name: Optional[str]
    description: Optional[str]
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True