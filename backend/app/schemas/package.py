from pydantic import BaseModel, Field, validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from .enums import PackageType


class PackageCreate(BaseModel):
    """创建订阅请求"""
    package_code: str = Field(..., min_length=1, max_length=50, description="订阅代码")
    package_name: str = Field(..., min_length=1, max_length=100, description="订阅名称")
    description: Optional[str] = Field(None, description="订阅描述")
    endpoint: Optional[str] = Field(None, max_length=256, description="订阅服务端点")
    price: Decimal = Field(..., gt=0, description="订阅价格")
    credits: int = Field(..., gt=0, description="订阅积分")
    daily_reset_credits: Optional[int] = Field(None, ge=0, description=f"每日重置积分数，{PackageType.STANDARD}类型订阅默认为10000，{PackageType.MAX_SERIES}类型订阅默认为15000，{PackageType.FUEL_PACK}类型订阅为0")
    duration_days: int = Field(..., gt=0, description="订阅时长（天）")
    package_type: str = Field(PackageType.STANDARD, min_length=2, max_length=2, description=f"订阅类型：{PackageType.STANDARD}-标准订阅，{PackageType.MAX_SERIES}-Max系列订阅，{PackageType.FUEL_PACK}-加油包（只累加积分）")
    is_active: bool = Field(True, description="订阅是否可用")
    sort_order: int = Field(0, description="排序顺序")

    @validator('package_code')
    def validate_package_code(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('订阅代码只能包含字母、数字、下划线和连字符')
        return v.lower()

    @validator('endpoint')
    def validate_endpoint(cls, v):
        if v and not v.strip():
            raise ValueError('订阅端点不能为空字符串')
        return v

    @validator('package_type')
    def validate_package_type(cls, v):
        if not PackageType.is_valid_type(v):
            raise ValueError(f'订阅类型必须是{PackageType.STANDARD}（标准订阅）、{PackageType.MAX_SERIES}（Max系列订阅）或{PackageType.FUEL_PACK}（加油包）')
        return v

    @validator('daily_reset_credits')
    def validate_daily_reset_credits(cls, v, values):
        if v is None:
            # 根据套餐类型设置默认值
            package_type = values.get('package_type', PackageType.STANDARD)
            return PackageType.get_default_daily_reset_credits(package_type)
        return v


class PackageUpdate(BaseModel):
    """更新订阅请求"""
    package_name: Optional[str] = Field(None, min_length=1, max_length=100, description="订阅名称")
    description: Optional[str] = Field(None, description="订阅描述")
    endpoint: Optional[str] = Field(None, max_length=256, description="订阅服务端点")
    price: Optional[Decimal] = Field(None, gt=0, description="订阅价格")
    credits: Optional[int] = Field(None, gt=0, description="订阅积分")
    daily_reset_credits: Optional[int] = Field(None, ge=0, description=f"每日重置积分数，{PackageType.STANDARD}类型订阅默认为10000，{PackageType.MAX_SERIES}类型订阅默认为15000，{PackageType.FUEL_PACK}类型订阅为0")
    duration_days: Optional[int] = Field(None, gt=0, description="订阅时长（天）")
    package_type: Optional[str] = Field(None, min_length=2, max_length=2, description=f"订阅类型：{PackageType.STANDARD}-标准订阅，{PackageType.MAX_SERIES}-Max系列订阅，{PackageType.FUEL_PACK}-加油包（只累加积分）")
    is_active: Optional[bool] = Field(None, description="订阅是否可用")
    sort_order: Optional[int] = Field(None, description="排序顺序")

    @validator('package_type')
    def validate_package_type(cls, v):
        if v is not None and not PackageType.is_valid_type(v):
            raise ValueError(f'订阅类型必须是{PackageType.STANDARD}（标准订阅）、{PackageType.MAX_SERIES}（Max系列订阅）或{PackageType.FUEL_PACK}（加油包）')
        return v

    @validator('daily_reset_credits')
    def validate_daily_reset_credits(cls, v, values):
        if v is not None and v < 0:
            raise ValueError('每日重置积分数不能为负数')
        return v


class PackageResponse(BaseModel):
    """订阅响应"""
    id: int
    package_code: str
    package_name: str
    description: Optional[str]
    endpoint: Optional[str]
    price: Decimal
    credits: int
    daily_reset_credits: int
    duration_days: int
    package_type: str
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PackageListResponse(BaseModel):
    """订阅列表响应"""
    packages: List[PackageResponse]
    total: int


class PackagePurchaseRequest(BaseModel):
    """购买订阅请求"""
    package_id: int = Field(..., description="订阅ID")
    auto_renew: bool = Field(False, description="是否自动续费")


class PackagePurchaseResponse(BaseModel):
    """购买订阅响应"""
    message: str
    user_plan_id: int
    package_code: str
    credits_added: int
    expire_date: datetime


class PackageStatisticsResponse(BaseModel):
    """订阅统计响应"""
    total_packages: int
    active_packages: int
    inactive_packages: int