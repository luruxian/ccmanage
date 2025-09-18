from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """创建用户请求模型"""
    user_id: str
    username: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    """更新用户请求模型"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class UserStatusUpdate(BaseModel):
    """更新用户状态请求模型"""
    is_active: Optional[bool] = None
    is_banned: Optional[bool] = None


class UserResponse(BaseModel):
    """用户响应模型"""
    id: int
    user_id: str
    username: str
    email: Optional[str]
    phone: Optional[str]
    is_active: bool
    is_banned: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """用户列表响应模型"""
    users: list[UserResponse]
    total: int
    page: int
    page_size: int