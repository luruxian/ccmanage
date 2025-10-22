from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, DECIMAL, Index, Enum
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime
import enum


class UserRole(enum.Enum):
    """用户角色枚举"""
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), unique=True, index=True, nullable=False, comment="用户唯一标识")
    email = Column(String(255), unique=True, index=True, nullable=False, comment="邮箱")
    password_hash = Column(String(255), nullable=False, comment="密码哈希值")
    phone = Column(String(20), unique=True, index=True, nullable=True, comment="手机号")
    is_active = Column(Boolean, default=False, nullable=False, comment="账户是否激活")
    is_email_verified = Column(Boolean, default=False, nullable=False, comment="邮箱是否已验证")
    is_banned = Column(Boolean, default=False, nullable=False, comment="账户是否被封禁")
    last_login_at = Column(DateTime(timezone=True), nullable=True, comment="最后登录时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 删除所有关联关系以简化架构


class APIKey(Base):
    """用户密钥表（合并后的完整版本）"""
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), nullable=True, comment="用户ID（激活前可为空）")
    api_key = Column(String(255), unique=True, index=True, nullable=False, comment="用户密钥")
    real_api_key = Column(String(255), nullable=False, comment="真实API密钥")
    key_name = Column(String(100), nullable=True, comment="密钥名称")
    description = Column(Text, nullable=True, comment="密钥描述")
    is_active = Column(Boolean, default=True, nullable=False, comment="密钥是否激活")
    last_used_at = Column(DateTime(timezone=True), nullable=True, comment="最后使用时间")

    # 订阅管理字段（从user_keys合并过来）
    package_id = Column(Integer, nullable=True, comment="关联的订阅ID")
    activation_date = Column(DateTime(timezone=True), nullable=True, comment="激活时间")
    expire_date = Column(DateTime(timezone=True), nullable=True, comment="过期时间")
    remaining_days = Column(Integer, nullable=True, comment="剩余天数")
    remaining_credits = Column(Integer, nullable=True, comment="剩余积分")
    total_credits = Column(Integer, nullable=True, comment="总积分")
    status = Column(String(20), default="inactive", nullable=False, comment="状态: active/inactive/expired")
    notes = Column(Text, nullable=True, comment="备注信息")
    last_reset_credits_at = Column(DateTime(timezone=True), nullable=True, comment="最后重置积分时间")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")


# UserPlan表已删除，功能合并到api_keys表中


class UsageRecord(Base):
    """使用记录表"""
    __tablename__ = "usage_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    api_key_id = Column(Integer, nullable=False, comment="API密钥ID")
    service = Column(String(50), nullable=False, comment="服务类型")
    request_count = Column(Integer, default=1, nullable=False, comment="请求次数")
    credits_used = Column(Integer, default=0, nullable=False, comment="消耗积分")
    remaining_credits = Column(Integer, nullable=True, comment="扣减后的剩余积分")
    input_tokens = Column(Integer, nullable=True, comment="输入token数量")
    output_tokens = Column(Integer, nullable=True, comment="输出token数量")
    total_tokens = Column(Integer, nullable=True, comment="总token数量")
    request_timestamp = Column(DateTime(timezone=True), server_default=func.now(), comment="请求时间")
    response_status = Column(String(20), nullable=True, comment="响应状态")
    error_message = Column(Text, nullable=True, comment="错误信息")

    # 删除关联关系以简化架构


class RateLimit(Base):
    """频率限制表"""
    __tablename__ = "rate_limits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, comment="用户ID")
    service = Column(String(50), nullable=False, comment="服务类型")
    requests_count = Column(Integer, default=0, nullable=False, comment="请求次数")
    window_start = Column(DateTime(timezone=True), nullable=False, comment="时间窗口开始")
    window_end = Column(DateTime(timezone=True), nullable=False, comment="时间窗口结束")
    max_requests = Column(Integer, nullable=False, comment="最大请求数")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 删除关联关系以简化架构


class EmailVerification(Base):
    """邮箱验证表"""
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, comment="用户ID")
    email = Column(String(255), nullable=False, comment="待验证邮箱")
    verification_code = Column(String(10), nullable=False, comment="验证码")
    verification_type = Column(String(20), nullable=False, comment="验证类型: register/reset_password")
    is_used = Column(Boolean, default=False, nullable=False, comment="是否已使用")
    expire_at = Column(DateTime(timezone=True), nullable=False, comment="过期时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")

    # 删除关联关系以简化架构


class Package(Base):
    """订阅模板表"""
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    package_code = Column(String(50), unique=True, index=True, nullable=False, comment="订阅代码")
    package_name = Column(String(100), nullable=False, comment="订阅名称")
    description = Column(Text, nullable=True, comment="订阅描述")
    endpoint = Column(String(256), nullable=True, comment="订阅服务端点")
    price = Column(DECIMAL(10, 2), nullable=False, comment="订阅价格")
    credits = Column(Integer, nullable=False, comment="订阅积分")
    duration_days = Column(Integer, nullable=False, comment="订阅时长（天）")
    is_active = Column(Boolean, default=True, nullable=False, comment="订阅是否可用")
    sort_order = Column(Integer, default=0, nullable=False, comment="排序顺序")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 删除关联关系以简化架构


# UserKey表已删除，功能合并到APIKey表中


class LoginHistory(Base):
    """登录历史表"""
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, comment="用户ID")
    login_time = Column(DateTime(timezone=True), server_default=func.now(), comment="登录时间")
    logout_time = Column(DateTime(timezone=True), nullable=True, comment="退出时间")
    ip_address = Column(String(45), nullable=True, comment="IP地址")
    user_agent = Column(Text, nullable=True, comment="用户代理")
    device_info = Column(Text, nullable=True, comment="设备信息")
    login_status = Column(String(20), default="success", nullable=False, comment="登录状态: success/failed")
    session_id = Column(String(100), nullable=True, comment="会话ID")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")

    # 删除关联关系以简化架构


class Admin(Base):
    """管理员表"""
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False, comment="管理员用户名")
    password_hash = Column(String(255), nullable=False, comment="密码哈希值")
    display_name = Column(String(100), nullable=True, comment="显示名称")
    role = Column(Enum(UserRole), default=UserRole.ADMIN, nullable=False, comment="管理员角色")
    is_active = Column(Boolean, default=True, nullable=False, comment="账户是否激活")
    is_deleted = Column(Boolean, default=False, nullable=False, comment="是否已删除（逻辑删除）")
    last_login_at = Column(DateTime(timezone=True), nullable=True, comment="最后登录时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 删除关联关系以简化架构


class AdminOperation(Base):
    """管理员操作记录表"""
    __tablename__ = "admin_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_user_id = Column(String(50), nullable=False, comment="管理员用户ID")
    operation_type = Column(String(50), nullable=False, comment="操作类型")
    target_resource = Column(String(100), nullable=True, comment="目标资源")
    target_id = Column(String(50), nullable=True, comment="目标ID")
    operation_description = Column(Text, nullable=True, comment="操作描述")
    operation_data = Column(Text, nullable=True, comment="操作数据（JSON格式）")
    ip_address = Column(String(45), nullable=True, comment="IP地址")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="操作时间")

    # 删除关联关系以简化架构




# 创建复合索引优化查询性能
Index('idx_api_key_user', APIKey.user_id, APIKey.api_key)
# Index('idx_user_plan_active', UserPlan.user_id, UserPlan.is_active, UserPlan.expire_date)  # UserPlan表已删除
Index('idx_usage_record_time_new', UsageRecord.api_key_id, UsageRecord.request_timestamp)
Index('idx_rate_limit_window', RateLimit.user_id, RateLimit.service, RateLimit.window_start, RateLimit.window_end)
Index('idx_email_verification', EmailVerification.email, EmailVerification.verification_code, EmailVerification.is_used)
# Index('idx_user_key_relation', UserKey.user_id, UserKey.api_key_id, UserKey.status)  # UserKey表已删除
Index('idx_login_history', LoginHistory.user_id, LoginHistory.login_time)
Index('idx_admin_operations', AdminOperation.admin_user_id, AdminOperation.operation_type, AdminOperation.created_at)
Index('idx_package_active', Package.is_active, Package.sort_order)
Index('idx_admin_username', Admin.username, Admin.is_deleted, Admin.is_active)