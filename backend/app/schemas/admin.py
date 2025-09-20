from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class UserRoleEnum(str, Enum):
    """用户角色枚举"""
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class AdminLoginRequest(BaseModel):
    """管理员登录请求"""
    username: str = Field(..., min_length=3, max_length=50, description="管理员用户名")
    password: str = Field(..., min_length=6, description="密码")


class AdminUserCreate(BaseModel):
    """创建管理员用户请求"""
    email: str = Field(..., description="邮箱")
    password: str = Field(..., min_length=6, description="密码")
    role: UserRoleEnum = Field(..., description="用户角色")
    phone: Optional[str] = Field(None, description="手机号")

    @validator('email')
    def validate_email(cls, v):
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('邮箱格式不正确')
        return v.lower()


class AdminUserUpdate(BaseModel):
    """更新用户请求"""
    email: Optional[str] = Field(None, description="邮箱")
    phone: Optional[str] = Field(None, description="手机号")
    role: Optional[UserRoleEnum] = Field(None, description="用户角色")
    is_active: Optional[bool] = Field(None, description="账户是否激活")
    is_banned: Optional[bool] = Field(None, description="账户是否被封禁")

    @validator('email')
    def validate_email(cls, v):
        if v is not None:
            import re
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(pattern, v):
                raise ValueError('邮箱格式不正确')
            return v.lower()
        return v


class AdminUserResponse(BaseModel):
    """管理员用户响应"""
    id: int
    user_id: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    is_email_verified: bool
    is_banned: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserManagementResponse(BaseModel):
    """用户管理响应（包含更多信息）"""
    id: int
    user_id: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    is_email_verified: bool
    is_banned: bool
    last_login_at: Optional[datetime]
    total_api_keys: int
    active_api_keys: int
    total_plans: int
    active_plans: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """用户列表响应"""
    users: List[UserManagementResponse]
    total: int
    page: int
    page_size: int


class LoginHistoryResponse(BaseModel):
    """登录历史响应"""
    id: int
    user_id: str
    user_email: str
    user_role: str
    login_time: datetime
    logout_time: Optional[datetime]
    ip_address: Optional[str]
    user_agent: Optional[str]
    device_info: Optional[str]
    login_status: str
    session_duration: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class LoginHistoryListResponse(BaseModel):
    """登录历史列表响应"""
    login_history: List[LoginHistoryResponse]
    total: int


class AdminOperationResponse(BaseModel):
    """管理员操作记录响应"""
    id: int
    admin_user_id: str
    admin_email: str
    admin_role: str
    operation_type: str
    target_resource: Optional[str]
    target_id: Optional[str]
    operation_description: Optional[str]
    operation_data: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AdminOperationListResponse(BaseModel):
    """管理员操作列表响应"""
    operations: List[AdminOperationResponse]
    total: int


class AdminStatisticsResponse(BaseModel):
    """管理员统计响应"""
    total_users: int
    active_users: int
    banned_users: int
    admin_users: int
    total_api_keys: int
    active_api_keys: int
    total_packages: int
    active_packages: int
    login_statistics: Dict[str, Any]
    operation_statistics: Dict[str, Any]


class BulkUserOperation(BaseModel):
    """批量用户操作"""
    user_ids: List[str] = Field(..., description="用户ID列表")
    operation: str = Field(..., description="操作类型: activate/deactivate/ban/unban")
    reason: Optional[str] = Field(None, description="操作原因")


class SystemConfigUpdate(BaseModel):
    """系统配置更新"""
    config_key: str = Field(..., description="配置键")
    config_value: str = Field(..., description="配置值")
    description: Optional[str] = Field(None, description="配置描述")


class AdminCreateRequest(BaseModel):
    """创建管理员请求"""
    username: str = Field(..., min_length=3, max_length=50, description="管理员用户名")
    password: str = Field(..., min_length=6, description="密码")
    display_name: Optional[str] = Field(None, max_length=100, description="显示名称")
    role: UserRoleEnum = Field(UserRoleEnum.ADMIN, description="角色")

    @validator('username')
    def validate_username(cls, v):
        import re
        pattern = r'^[a-zA-Z0-9_-]{3,50}$'
        if not re.match(pattern, v):
            raise ValueError('用户名只能包含字母、数字、下划线和连字符，长度3-50位')
        return v.lower()


class AdminUpdateRequest(BaseModel):
    """更新管理员请求"""
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="管理员用户名")
    password: Optional[str] = Field(None, min_length=6, description="新密码")
    display_name: Optional[str] = Field(None, max_length=100, description="显示名称")
    role: Optional[UserRoleEnum] = Field(None, description="角色")
    is_active: Optional[bool] = Field(None, description="是否激活")

    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            import re
            pattern = r'^[a-zA-Z0-9_-]{3,50}$'
            if not re.match(pattern, v):
                raise ValueError('用户名只能包含字母、数字、下划线和连字符，长度3-50位')
            return v.lower()
        return v


class AdminInfoResponse(BaseModel):
    """管理员信息响应"""
    id: int
    username: str
    display_name: Optional[str]
    role: str
    is_active: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminListResponse(BaseModel):
    """管理员列表响应"""
    admins: List[AdminInfoResponse]
    total: int
    page: int
    page_size: int


class AdminLoginResponse(BaseModel):
    """管理员登录响应"""
    admin: AdminInfoResponse
    tokens: Dict[str, Any]


class AdminOperationNewResponse(BaseModel):
    """新管理员操作记录响应"""
    id: int
    admin_id: int
    admin_username: str
    operation_type: str
    target_resource: Optional[str]
    target_id: Optional[str]
    operation_description: Optional[str]
    operation_data: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True