from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class UsageRecordCreate(BaseModel):
    """创建使用记录的请求模型"""
    api_key: str = Field(..., description="API密钥")
    service: str = Field(..., description="服务类型")
    request_count: int = Field(default=1, description="请求次数")
    credits_used: int = Field(default=0, description="消耗积分")
    input_tokens: Optional[int] = Field(None, description="输入token数量")
    output_tokens: Optional[int] = Field(None, description="输出token数量")
    total_tokens: Optional[int] = Field(None, description="总token数量")
    response_status: Optional[str] = Field(None, description="响应状态")
    error_message: Optional[str] = Field(None, description="错误信息")


class UsageRecordResponse(BaseModel):
    """使用记录响应模型"""
    id: int
    api_key_id: int
    service: str
    request_count: int
    credits_used: int
    input_tokens: Optional[int]
    output_tokens: Optional[int]
    total_tokens: Optional[int]
    request_timestamp: datetime
    response_status: Optional[str]
    error_message: Optional[str]

    class Config:
        from_attributes = True


class UsageHistoryQuery(BaseModel):
    """使用履历查询参数"""
    page: int = Field(default=1, ge=1, description="页码")
    page_size: int = Field(default=20, ge=1, le=100, description="每页数量")
    service: Optional[str] = Field(None, description="服务类型筛选")
    start_date: Optional[datetime] = Field(None, description="开始时间")
    end_date: Optional[datetime] = Field(None, description="结束时间")


class UsageHistoryListResponse(BaseModel):
    """使用履历列表响应"""
    records: List[UsageRecordResponse]
    total: int
    page: int
    page_size: int
    pages: int

    @property
    def has_next(self) -> bool:
        return self.page < self.pages

    @property
    def has_prev(self) -> bool:
        return self.page > 1


class ServiceStatsResponse(BaseModel):
    """服务统计响应"""
    service: str
    request_count: int
    total_credits: int
    total_tokens: int


class DailyUsageResponse(BaseModel):
    """每日使用统计响应"""
    date: str
    request_count: int
    total_tokens: int


class UsageStatsResponse(BaseModel):
    """使用统计响应模型"""
    total_requests: int = Field(..., description="总请求数")
    total_credits: int = Field(..., description="总消耗积分")
    total_input_tokens: int = Field(..., description="总输入token数")
    total_output_tokens: int = Field(..., description="总输出token数")
    total_tokens: int = Field(..., description="总token数")
    service_breakdown: List[ServiceStatsResponse] = Field(..., description="按服务类型统计")
    daily_usage: List[DailyUsageResponse] = Field(..., description="每日使用统计")


class UsageStatsQuery(BaseModel):
    """使用统计查询参数"""
    start_date: Optional[datetime] = Field(None, description="开始时间")
    end_date: Optional[datetime] = Field(None, description="结束时间")


class ApiKeyUsageResponse(BaseModel):
    """API密钥使用统计响应"""
    api_key_id: int
    total_requests: int
    total_credits: int
    total_tokens: int
    last_used_at: Optional[datetime]


class UsageRecordSuccess(BaseModel):
    """使用记录创建成功响应"""
    message: str = "使用记录创建成功"
    record_id: int
    timestamp: datetime


class TokenUsageRequest(BaseModel):
    """Token使用记录请求"""
    api_key: str = Field(..., description="API密钥")
    service: str = Field(..., description="服务类型", example="chat-completion")
    input_tokens: int = Field(..., description="输入token数量", ge=0)
    output_tokens: int = Field(..., description="输出token数量", ge=0)
    total_tokens: Optional[int] = Field(None, description="总token数量")
    credits_used: int = Field(default=0, description="消耗积分", ge=0)
    response_status: str = Field(default="success", description="响应状态")
    error_message: Optional[str] = Field(None, description="错误信息")

    def __post_init__(self):
        # 如果没有提供total_tokens，自动计算
        if self.total_tokens is None:
            self.total_tokens = self.input_tokens + self.output_tokens


class BatchUsageRecordRequest(BaseModel):
    """批量使用记录请求"""
    records: List[TokenUsageRequest] = Field(..., description="使用记录列表")


class UsageSummaryResponse(BaseModel):
    """使用摘要响应"""
    period: str = Field(..., description="统计周期")
    total_requests: int = Field(..., description="总请求数")
    total_tokens: int = Field(..., description="总token数")
    total_credits: int = Field(..., description="总积分")
    average_tokens_per_request: float = Field(..., description="平均每请求token数")
    most_used_service: Optional[str] = Field(None, description="最常用服务")


class ErrorResponse(BaseModel):
    """错误响应"""
    error: str
    detail: str
    timestamp: datetime = Field(default_factory=datetime.now)