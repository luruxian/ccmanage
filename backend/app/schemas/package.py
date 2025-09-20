from pydantic import BaseModel, Field, validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class PackageCreate(BaseModel):
    """创建套餐请求"""
    package_code: str = Field(..., min_length=1, max_length=50, description="套餐代码")
    package_name: str = Field(..., min_length=1, max_length=100, description="套餐名称")
    description: Optional[str] = Field(None, description="套餐描述")
    price: Decimal = Field(..., gt=0, description="套餐价格")
    credits: int = Field(..., gt=0, description="套餐积分")
    duration_days: int = Field(..., gt=0, description="套餐时长（天）")
    is_active: bool = Field(True, description="套餐是否可用")
    sort_order: int = Field(0, description="排序顺序")

    @validator('package_code')
    def validate_package_code(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('套餐代码只能包含字母、数字、下划线和连字符')
        return v.lower()


class PackageUpdate(BaseModel):
    """更新套餐请求"""
    package_name: Optional[str] = Field(None, min_length=1, max_length=100, description="套餐名称")
    description: Optional[str] = Field(None, description="套餐描述")
    price: Optional[Decimal] = Field(None, gt=0, description="套餐价格")
    credits: Optional[int] = Field(None, gt=0, description="套餐积分")
    duration_days: Optional[int] = Field(None, gt=0, description="套餐时长（天）")
    is_active: Optional[bool] = Field(None, description="套餐是否可用")
    sort_order: Optional[int] = Field(None, description="排序顺序")


class PackageResponse(BaseModel):
    """套餐响应"""
    id: int
    package_code: str
    package_name: str
    description: Optional[str]
    price: Decimal
    credits: int
    duration_days: int
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PackageListResponse(BaseModel):
    """套餐列表响应"""
    packages: List[PackageResponse]
    total: int


class PackagePurchaseRequest(BaseModel):
    """购买套餐请求"""
    package_id: int = Field(..., description="套餐ID")
    auto_renew: bool = Field(False, description="是否自动续费")


class PackagePurchaseResponse(BaseModel):
    """购买套餐响应"""
    message: str
    user_plan_id: int
    package_code: str
    credits_added: int
    expire_date: datetime


class PackageStatisticsResponse(BaseModel):
    """套餐统计响应"""
    total_packages: int
    active_packages: int
    inactive_packages: int