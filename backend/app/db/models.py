from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, DECIMAL, Index, Enum
from sqlalchemy.orm import relationship
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

    # 关联关系
    api_keys = relationship("APIKey", back_populates="user")
    user_plans = relationship("UserPlan", back_populates="user")
    usage_records = relationship("UsageRecord", back_populates="user")
    email_verifications = relationship("EmailVerification", back_populates="user")
    login_history = relationship("LoginHistory", back_populates="user")
    user_keys = relationship("UserKey", back_populates="user")


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
    user_keys = relationship("UserKey", back_populates="api_key")


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


class EmailVerification(Base):
    """邮箱验证表"""
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, comment="用户ID")
    email = Column(String(255), nullable=False, comment="待验证邮箱")
    verification_code = Column(String(10), nullable=False, comment="验证码")
    verification_type = Column(String(20), nullable=False, comment="验证类型: register/reset_password")
    is_used = Column(Boolean, default=False, nullable=False, comment="是否已使用")
    expire_at = Column(DateTime(timezone=True), nullable=False, comment="过期时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")

    # 关联关系
    user = relationship("User", back_populates="email_verifications")


class Package(Base):
    """套餐模板表"""
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    package_code = Column(String(50), unique=True, index=True, nullable=False, comment="套餐代码")
    package_name = Column(String(100), nullable=False, comment="套餐名称")
    description = Column(Text, nullable=True, comment="套餐描述")
    price = Column(DECIMAL(10, 2), nullable=False, comment="套餐价格")
    credits = Column(Integer, nullable=False, comment="套餐积分")
    duration_days = Column(Integer, nullable=False, comment="套餐时长（天）")
    is_active = Column(Boolean, default=True, nullable=False, comment="套餐是否可用")
    sort_order = Column(Integer, default=0, nullable=False, comment="排序顺序")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 关联关系
    # user_plans = relationship("UserPlan", back_populates="package")  # 暂时移除，待package_id字段添加后恢复


class UserKey(Base):
    """用户密钥关联表"""
    __tablename__ = "user_keys"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, comment="用户ID")
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), nullable=False, comment="API密钥ID")
    activation_date = Column(DateTime(timezone=True), server_default=func.now(), comment="激活时间")
    status = Column(String(20), default="active", nullable=False, comment="状态: active/inactive/expired")
    notes = Column(Text, nullable=True, comment="备注信息")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="user_keys")
    api_key = relationship("APIKey", back_populates="user_keys")


class LoginHistory(Base):
    """登录历史表"""
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, comment="用户ID")
    login_time = Column(DateTime(timezone=True), server_default=func.now(), comment="登录时间")
    logout_time = Column(DateTime(timezone=True), nullable=True, comment="退出时间")
    ip_address = Column(String(45), nullable=True, comment="IP地址")
    user_agent = Column(Text, nullable=True, comment="用户代理")
    device_info = Column(Text, nullable=True, comment="设备信息")
    login_status = Column(String(20), default="success", nullable=False, comment="登录状态: success/failed")
    session_id = Column(String(100), nullable=True, comment="会话ID")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")

    # 关联关系
    user = relationship("User", back_populates="login_history")


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

    # 关联关系
    admin_operations = relationship("AdminOperation", back_populates="admin")


class AdminOperation(Base):
    """管理员操作记录表"""
    __tablename__ = "admin_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False, comment="管理员ID")
    admin_user_id = Column(String(50), ForeignKey("users.user_id"), nullable=True, comment="旧的管理员用户ID（兼容性）")
    operation_type = Column(String(50), nullable=False, comment="操作类型")
    target_resource = Column(String(100), nullable=True, comment="目标资源")
    target_id = Column(String(50), nullable=True, comment="目标ID")
    operation_description = Column(Text, nullable=True, comment="操作描述")
    operation_data = Column(Text, nullable=True, comment="操作数据（JSON格式）")
    ip_address = Column(String(45), nullable=True, comment="IP地址")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="操作时间")

    # 关联关系
    admin = relationship("Admin", back_populates="admin_operations")
    admin_user = relationship("User")




# 创建复合索引优化查询性能
Index('idx_api_key_user', APIKey.user_id, APIKey.api_key)
Index('idx_user_plan_active', UserPlan.user_id, UserPlan.is_active, UserPlan.expire_date)
Index('idx_usage_record_time', UsageRecord.user_id, UsageRecord.request_timestamp)
Index('idx_rate_limit_window', RateLimit.user_id, RateLimit.service, RateLimit.window_start, RateLimit.window_end)
Index('idx_email_verification', EmailVerification.email, EmailVerification.verification_code, EmailVerification.is_used)
Index('idx_user_key_relation', UserKey.user_id, UserKey.api_key_id, UserKey.status)
Index('idx_login_history', LoginHistory.user_id, LoginHistory.login_time)
Index('idx_admin_operations', AdminOperation.admin_user_id, AdminOperation.operation_type, AdminOperation.created_at)
Index('idx_package_active', Package.is_active, Package.sort_order)
Index('idx_admin_username', Admin.username, Admin.is_deleted, Admin.is_active)
Index('idx_admin_operations_new', AdminOperation.admin_id, AdminOperation.operation_type, AdminOperation.created_at)