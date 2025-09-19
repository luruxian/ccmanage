from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegisterRequest(BaseModel):
    """用户注册请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, max_length=128, description="密码")


class UserLoginRequest(BaseModel):
    """用户登录请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., description="密码")


class EmailVerificationRequest(BaseModel):
    """邮箱验证请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    verification_code: str = Field(..., min_length=6, max_length=6, description="验证码")


class ResendVerificationRequest(BaseModel):
    """重发验证码请求"""
    email: EmailStr = Field(..., description="邮箱地址")


class PasswordResetRequest(BaseModel):
    """密码重置请求"""
    email: EmailStr = Field(..., description="邮箱地址")


class PasswordResetConfirmRequest(BaseModel):
    """密码重置确认请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    verification_code: str = Field(..., min_length=6, max_length=6, description="验证码")
    new_password: str = Field(..., min_length=6, max_length=128, description="新密码")


class RefreshTokenRequest(BaseModel):
    """刷新令牌请求"""
    refresh_token: str = Field(..., description="刷新令牌")


class UserResponse(BaseModel):
    """用户信息响应"""
    user_id: str
    email: str
    phone: Optional[str] = None
    is_active: bool
    is_email_verified: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # 秒


class AuthResponse(BaseModel):
    """认证响应"""
    user: UserResponse
    tokens: TokenResponse


class RegisterResponse(BaseModel):
    """注册响应"""
    message: str
    user_id: str
    email: str


class EmailVerificationResponse(BaseModel):
    """邮箱验证响应"""
    message: str
    user: UserResponse
    tokens: TokenResponse


class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str


class ErrorResponse(BaseModel):
    """错误响应"""
    detail: str
    code: Optional[str] = None