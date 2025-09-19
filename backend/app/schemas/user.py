from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
from .auth import UserResponse


class UserCreate(BaseModel):
    """创建用户请求模型"""
    user_id: str
    username: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class UserUpdateRequest(BaseModel):
    """更新用户个人信息请求"""
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="用户名")
    email: Optional[EmailStr] = Field(None, description="邮箱")
    phone: Optional[str] = Field(None, max_length=20, description="手机号")


class UserUpdate(BaseModel):
    """更新用户请求模型"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class UserStatusUpdate(BaseModel):
    """更新用户状态请求模型"""
    is_active: Optional[bool] = None
    is_banned: Optional[bool] = None


class UserProfileResponse(BaseModel):
    """用户个人信息响应"""
    user: UserResponse
    plan_info: Dict[str, Any]


class UserListResponse(BaseModel):
    """用户列表响应模型"""
    users: list[UserResponse]
    total: int
    page: int
    page_size: int