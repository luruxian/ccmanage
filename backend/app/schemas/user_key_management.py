from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserKeyRelationCreate(BaseModel):
    """创建用户密钥关联请求"""
    user_id: str = Field(..., description="用户ID")
    api_key_id: int = Field(..., description="API密钥ID")
    notes: Optional[str] = Field(None, description="备注信息")


class UserKeyRelationUpdate(BaseModel):
    """更新用户密钥关联请求"""
    status: str = Field(..., description="状态: active/inactive/expired")
    notes: Optional[str] = Field(None, description="备注信息")


class UserKeyRelationResponse(BaseModel):
    """用户密钥关联响应"""
    id: int
    user_id: Optional[str]  # 可能为空（未激活）
    api_key_id: int
    api_key: str
    real_api_key: Optional[str]  # 添加real_api_key字段
    key_name: Optional[str]
    description: Optional[str]
    user_email: str  # 添加用户邮箱字段
    activation_date: Optional[datetime]  # 可能为空（未激活）
    expire_date: Optional[datetime]  # 添加过期时间字段
    status: str
    remaining_days: Optional[int]  # 添加剩余天数
    remaining_credits: Optional[int]  # 添加剩余积分
    total_credits: Optional[int]  # 添加总积分
    notes: Optional[str]
    last_used_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class KeyUserResponse(BaseModel):
    """密钥用户关联响应"""
    id: int
    user_id: str
    email: str
    activation_date: datetime
    status: str
    notes: Optional[str]
    user_is_active: bool
    user_is_banned: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserKeysListResponse(BaseModel):
    """用户密钥列表响应"""
    user_keys: List[UserKeyRelationResponse]
    total: int


class KeyUsersListResponse(BaseModel):
    """密钥用户列表响应"""
    key_users: List[KeyUserResponse]
    total: int


class UserKeyStatisticsResponse(BaseModel):
    """用户密钥统计响应"""
    total_relations: int
    active_relations: int
    inactive_relations: int
    expired_relations: int


class BulkUserKeyOperation(BaseModel):
    """批量用户密钥操作"""
    user_ids: List[str] = Field(..., description="用户ID列表")
    api_key_id: int = Field(..., description="API密钥ID")
    operation: str = Field(..., description="操作类型: activate/deactivate/delete")
    notes: Optional[str] = Field(None, description="操作备注")