from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# =============================================================================
# API密钥验证相关模型
# =============================================================================

class APIKeyValidationRequest(BaseModel):
    """
    API密钥验证请求模型

    Attributes:
        api_key (str): 要验证的API密钥
    """
    api_key: str = Field(..., description="要验证的API密钥")

    class Config:
        from_attributes = True


class APIKeyValidationSuccessData(BaseModel):
    """
    API密钥验证成功响应数据

    Attributes:
        valid (bool): 验证结果，始终为True
        real_api_key (str): 真实的API密钥
        user_id (str): 用户ID
        last_reset_credits_at (Optional[datetime]): 最后重置积分时间
        activation_date (Optional[datetime]): 激活时间
        expire_date (Optional[datetime]): 过期时间
        remaining_credits (Optional[int]): 剩余积分
        package_type (Optional[str]): 订阅种类
    """
    valid: bool = Field(True, description="验证结果，始终为True")
    real_api_key: str = Field(..., description="真实的API密钥")
    user_id: str = Field(..., description="用户ID")
    last_reset_credits_at: Optional[datetime] = Field(None, description="最后重置积分时间")
    activation_date: Optional[datetime] = Field(None, description="激活时间")
    expire_date: Optional[datetime] = Field(None, description="过期时间")
    remaining_credits: Optional[int] = Field(None, description="剩余积分")
    package_type: Optional[str] = Field(None, description="订阅种类")

    class Config:
        from_attributes = True


class APIKeyValidationErrorData(BaseModel):
    """
    API密钥验证错误响应数据

    Attributes:
        valid (bool): 验证结果，始终为False
        error_type (str): 错误类型
        expire_date (Optional[str]): 过期时间（字符串格式）
    """
    valid: bool = Field(False, description="验证结果，始终为False")
    error_type: str = Field(..., description="错误类型")
    expire_date: Optional[str] = Field(None, description="过期时间（字符串格式）")

    class Config:
        from_attributes = True


class APIKeyValidationSuccessResponse(BaseModel):
    """
    API密钥验证成功响应

    Attributes:
        status (str): 响应状态，始终为"success"
        code (int): 响应代码，始终为200
        data (APIKeyValidationSuccessData): 成功响应数据
    """
    status: str = Field("success", description="响应状态")
    code: int = Field(200, description="响应代码")
    data: APIKeyValidationSuccessData = Field(..., description="成功响应数据")

    class Config:
        from_attributes = True


class APIKeyValidationErrorResponse(BaseModel):
    """
    API密钥验证错误响应

    Attributes:
        status (str): 响应状态，始终为"error"
        code (int): 错误代码
        message (str): 错误消息
        data (APIKeyValidationErrorData): 错误响应数据
    """
    status: str = Field("error", description="响应状态")
    code: int = Field(..., description="错误代码")
    message: str = Field(..., description="错误消息")
    data: APIKeyValidationErrorData = Field(..., description="错误响应数据")

    class Config:
        from_attributes = True


# =============================================================================
# API密钥管理相关模型
# =============================================================================


class APIKeyCreate(BaseModel):
    """
    创建API密钥请求模型

    Attributes:
        api_key (str): API密钥
        real_api_key (str): 真实的API密钥
        key_name (Optional[str]): 密钥名称
        description (Optional[str]): 密钥描述
    """
    api_key: str = Field(..., description="API密钥")
    real_api_key: str = Field(..., description="真实的API密钥")
    key_name: Optional[str] = Field(None, description="密钥名称")
    description: Optional[str] = Field(None, description="密钥描述")


class APIKeyUpdate(BaseModel):
    """
    更新API密钥请求模型

    Attributes:
        key_name (Optional[str]): 密钥名称
        description (Optional[str]): 密钥描述
        real_api_key (Optional[str]): 真实的API密钥
        is_active (Optional[bool]): 是否激活
    """
    key_name: Optional[str] = Field(None, description="密钥名称")
    description: Optional[str] = Field(None, description="密钥描述")
    real_api_key: Optional[str] = Field(None, description="真实的API密钥")
    is_active: Optional[bool] = Field(None, description="是否激活")


class APIKeyResponse(BaseModel):
    """
    API密钥响应模型

    Attributes:
        id (int): 密钥ID
        user_id (str): 用户ID
        api_key (str): API密钥
        key_name (Optional[str]): 密钥名称
        description (Optional[str]): 密钥描述
        is_active (bool): 是否激活
        last_used_at (Optional[datetime]): 最后使用时间
        created_at (datetime): 创建时间
        updated_at (datetime): 更新时间
    """
    id: int = Field(..., description="密钥ID")
    user_id: str = Field(..., description="用户ID")
    api_key: str = Field(..., description="API密钥")
    key_name: Optional[str] = Field(None, description="密钥名称")
    description: Optional[str] = Field(None, description="密钥描述")
    is_active: bool = Field(..., description="是否激活")
    last_used_at: Optional[datetime] = Field(None, description="最后使用时间")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    class Config:
        from_attributes = True