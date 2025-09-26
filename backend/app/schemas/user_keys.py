from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class KeyActivationRequest(BaseModel):
    """激活自定义API密钥请求"""
    custom_api_key: str = Field(..., min_length=10, max_length=255, description="自定义API密钥")
    real_api_key: str = Field(..., min_length=10, max_length=255, description="真实API密钥")
    key_name: Optional[str] = Field(None, max_length=100, description="密钥名称")
    description: Optional[str] = Field(None, max_length=500, description="密钥描述")


class KeyActivationResponse(BaseModel):
    """激活API密钥响应"""
    message: str
    key_id: int
    custom_api_key: str
    key_name: str
    is_active: bool


class UserKeyResponse(BaseModel):
    """用户API密钥响应"""
    id: int
    api_key: str
    key_name: Optional[str]
    package_name: Optional[str]
    description: Optional[str]
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime
    activation_date: Optional[datetime]
    expire_date: Optional[datetime]
    remaining_days: Optional[int]
    status: Optional[str]
    total_credits: Optional[int]
    remaining_credits: Optional[int]

    class Config:
        from_attributes = True


class UserKeysListResponse(BaseModel):
    """用户API密钥列表响应"""
    keys: List[UserKeyResponse]
    total: int


class UserPlanStatusResponse(BaseModel):
    """用户套餐状态响应"""
    has_active_plan: bool
    plan_type: str
    credits_remaining: int
    total_credits: int
    usage_percentage: float