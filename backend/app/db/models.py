from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, DECIMAL, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), unique=True, index=True, nullable=False, comment="用户唯一标识")
    username = Column(String(100), unique=True, index=True, nullable=False, comment="用户名")
    email = Column(String(255), unique=True, index=True, nullable=True, comment="邮箱")
    phone = Column(String(20), unique=True, index=True, nullable=True, comment="手机号")
    is_active = Column(Boolean, default=True, nullable=False, comment="账户是否激活")
    is_banned = Column(Boolean, default=False, nullable=False, comment="账户是否被封禁")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 关联关系
    api_keys = relationship("APIKey", back_populates="user")
    user_plans = relationship("UserPlan", back_populates="user")
    usage_records = relationship("UsageRecord", back_populates="user")


class APIKey(Base):
    """API密钥表"""
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, comment="用户ID")
    api_key = Column(String(255), unique=True, index=True, nullable=False, comment="自定义API密钥")
    real_api_key = Column(String(255), nullable=False, comment="真实API密钥")
    key_name = Column(String(100), nullable=True, comment="密钥名称")
    description = Column(Text, nullable=True, comment="密钥描述")
    is_active = Column(Boolean, default=True, nullable=False, comment="密钥是否激活")
    last_used_at = Column(DateTime(timezone=True), nullable=True, comment="最后使用时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="api_keys")
    usage_records = relationship("UsageRecord", back_populates="api_key")


class UserPlan(Base):
    """用户套餐表"""
    __tablename__ = "user_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, comment="用户ID")
    plan_type = Column(String(50), nullable=False, comment="套餐类型: basic/premium/enterprise")
    credits = Column(Integer, default=0, nullable=False, comment="剩余积分")
    total_credits = Column(Integer, default=0, nullable=False, comment="总积分")
    start_date = Column(DateTime(timezone=True), nullable=False, comment="开始时间")
    expire_date = Column(DateTime(timezone=True), nullable=False, comment="过期时间")
    is_active = Column(Boolean, default=True, nullable=False, comment="套餐是否激活")
    auto_renew = Column(Boolean, default=False, nullable=False, comment="是否自动续费")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="user_plans")


class UsageRecord(Base):
    """使用记录表"""
    __tablename__ = "usage_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, comment="用户ID")
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), nullable=False, comment="API密钥ID")
    service = Column(String(50), nullable=False, comment="服务类型")
    request_count = Column(Integer, default=1, nullable=False, comment="请求次数")
    credits_used = Column(Integer, default=0, nullable=False, comment="消耗积分")
    request_timestamp = Column(DateTime(timezone=True), server_default=func.now(), comment="请求时间")
    response_status = Column(String(20), nullable=True, comment="响应状态")
    error_message = Column(Text, nullable=True, comment="错误信息")

    # 关联关系
    user = relationship("User", back_populates="usage_records")
    api_key = relationship("APIKey", back_populates="usage_records")


class RateLimit(Base):
    """频率限制表"""
    __tablename__ = "rate_limits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, comment="用户ID")
    service = Column(String(50), nullable=False, comment="服务类型")
    requests_count = Column(Integer, default=0, nullable=False, comment="请求次数")
    window_start = Column(DateTime(timezone=True), nullable=False, comment="时间窗口开始")
    window_end = Column(DateTime(timezone=True), nullable=False, comment="时间窗口结束")
    max_requests = Column(Integer, nullable=False, comment="最大请求数")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 关联关系
    user = relationship("User")


# 创建复合索引优化查询性能
Index('idx_api_key_user', APIKey.user_id, APIKey.api_key)
Index('idx_user_plan_active', UserPlan.user_id, UserPlan.is_active, UserPlan.expire_date)
Index('idx_usage_record_time', UsageRecord.user_id, UsageRecord.request_timestamp)
Index('idx_rate_limit_window', RateLimit.user_id, RateLimit.service, RateLimit.window_start, RateLimit.window_end)