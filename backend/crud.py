from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from database_models import User, APIKey, UserPlan, UsageRecord, RateLimit
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class UserCRUD:
    """用户相关的数据库操作"""

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        """根据用户ID获取用户信息"""
        return db.query(User).filter(User.user_id == user_id).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> User:
        """根据用户名获取用户信息"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def create_user(db: Session, user_id: str, username: str, email: str = None, phone: str = None) -> User:
        """创建新用户"""
        db_user = User(
            user_id=user_id,
            username=username,
            email=email,
            phone=phone
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"创建新用户: {user_id}")
        return db_user

    @staticmethod
    def update_user_status(db: Session, user_id: str, is_active: bool = None, is_banned: bool = None) -> bool:
        """更新用户状态"""
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return False

        if is_active is not None:
            user.is_active = is_active
        if is_banned is not None:
            user.is_banned = is_banned

        db.commit()
        logger.info(f"更新用户状态: {user_id}, active={is_active}, banned={is_banned}")
        return True


class APIKeyCRUD:
    """API密钥相关的数据库操作"""

    @staticmethod
    def get_api_key_info(db: Session, api_key: str) -> APIKey:
        """根据API密钥获取密钥信息"""
        return db.query(APIKey).filter(
            and_(APIKey.api_key == api_key, APIKey.is_active == True)
        ).first()

    @staticmethod
    def create_api_key(db: Session, user_id: str, api_key: str, real_api_key: str,
                       key_name: str = None, description: str = None) -> APIKey:
        """创建新的API密钥"""
        db_api_key = APIKey(
            user_id=user_id,
            api_key=api_key,
            real_api_key=real_api_key,
            key_name=key_name,
            description=description
        )
        db.add(db_api_key)
        db.commit()
        db.refresh(db_api_key)
        logger.info(f"创建新API密钥: {user_id}")
        return db_api_key

    @staticmethod
    def update_last_used(db: Session, api_key: str) -> bool:
        """更新API密钥的最后使用时间"""
        result = db.query(APIKey).filter(APIKey.api_key == api_key).update(
            {APIKey.last_used_at: datetime.now()}
        )
        db.commit()
        return result > 0

    @staticmethod
    def deactivate_api_key(db: Session, api_key: str) -> bool:
        """停用API密钥"""
        result = db.query(APIKey).filter(APIKey.api_key == api_key).update(
            {APIKey.is_active: False}
        )
        db.commit()
        logger.info(f"停用API密钥: {api_key[:10]}...")
        return result > 0


class UserPlanCRUD:
    """用户套餐相关的数据库操作"""

    @staticmethod
    def get_active_plan(db: Session, user_id: str) -> UserPlan:
        """获取用户当前有效的套餐"""
        now = datetime.now()
        return db.query(UserPlan).filter(
            and_(
                UserPlan.user_id == user_id,
                UserPlan.is_active == True,
                UserPlan.expire_date > now
            )
        ).first()

    @staticmethod
    def create_user_plan(db: Session, user_id: str, plan_type: str, total_credits: int,
                        expire_date: datetime, auto_renew: bool = False) -> UserPlan:
        """创建新的用户套餐"""
        db_plan = UserPlan(
            user_id=user_id,
            plan_type=plan_type,
            credits=total_credits,
            total_credits=total_credits,
            start_date=datetime.now(),
            expire_date=expire_date,
            auto_renew=auto_renew
        )
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        logger.info(f"创建用户套餐: {user_id}, {plan_type}")
        return db_plan

    @staticmethod
    def consume_credits(db: Session, user_id: str, credits_amount: int) -> bool:
        """消耗用户积分"""
        plan = UserPlanCRUD.get_active_plan(db, user_id)
        if not plan or plan.credits < credits_amount:
            return False

        plan.credits -= credits_amount
        db.commit()
        logger.info(f"消耗积分: {user_id}, 消耗{credits_amount}, 剩余{plan.credits}")
        return True

    @staticmethod
    def check_plan_status(db: Session, user_id: str) -> dict:
        """检查用户套餐状态"""
        plan = UserPlanCRUD.get_active_plan(db, user_id)
        if not plan:
            return {
                "valid": False,
                "error_type": "plan_expired",
                "message": "No active plan found"
            }

        # 检查是否过期
        if plan.expire_date <= datetime.now():
            return {
                "valid": False,
                "error_type": "plan_expired",
                "message": "Plan expired",
                "expire_date": plan.expire_date.strftime("%Y-%m-%d")
            }

        # 检查积分是否耗尽
        if plan.credits <= 0:
            return {
                "valid": False,
                "error_type": "credits_exhausted",
                "message": "Credits exhausted"
            }

        return {
            "valid": True,
            "plan_type": plan.plan_type,
            "credits": plan.credits,
            "expire_date": plan.expire_date.strftime("%Y-%m-%d")
        }


class UsageRecordCRUD:
    """使用记录相关的数据库操作"""

    @staticmethod
    def create_usage_record(db: Session, user_id: str, api_key_id: int, service: str,
                           credits_used: int = 1, response_status: str = "success") -> UsageRecord:
        """创建使用记录"""
        db_record = UsageRecord(
            user_id=user_id,
            api_key_id=api_key_id,
            service=service,
            credits_used=credits_used,
            response_status=response_status
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record

    @staticmethod
    def get_usage_stats(db: Session, user_id: str, days: int = 30) -> dict:
        """获取用户使用统计"""
        start_date = datetime.now() - timedelta(days=days)

        total_requests = db.query(UsageRecord).filter(
            and_(
                UsageRecord.user_id == user_id,
                UsageRecord.request_timestamp >= start_date
            )
        ).count()

        total_credits = db.query(UsageRecord).filter(
            and_(
                UsageRecord.user_id == user_id,
                UsageRecord.request_timestamp >= start_date
            )
        ).with_entities(UsageRecord.credits_used).all()

        total_credits_used = sum([record[0] for record in total_credits])

        return {
            "total_requests": total_requests,
            "total_credits_used": total_credits_used,
            "period_days": days
        }


class RateLimitCRUD:
    """频率限制相关的数据库操作"""

    @staticmethod
    def check_rate_limit(db: Session, user_id: str, service: str, max_requests: int = 100,
                        window_minutes: int = 60) -> bool:
        """检查频率限制"""
        now = datetime.now()
        window_start = now - timedelta(minutes=window_minutes)

        # 查找当前时间窗口内的记录
        current_window = db.query(RateLimit).filter(
            and_(
                RateLimit.user_id == user_id,
                RateLimit.service == service,
                RateLimit.window_start <= now,
                RateLimit.window_end > now
            )
        ).first()

        if current_window:
            if current_window.requests_count >= max_requests:
                return False
            # 增加请求计数
            current_window.requests_count += 1
            db.commit()
        else:
            # 创建新的时间窗口记录
            db_rate_limit = RateLimit(
                user_id=user_id,
                service=service,
                requests_count=1,
                window_start=now,
                window_end=now + timedelta(minutes=window_minutes),
                max_requests=max_requests
            )
            db.add(db_rate_limit)
            db.commit()

        return True

    @staticmethod
    def cleanup_expired_records(db: Session) -> int:
        """清理过期的频率限制记录"""
        now = datetime.now()
        deleted_count = db.query(RateLimit).filter(RateLimit.window_end < now).delete()
        db.commit()
        logger.info(f"清理过期频率限制记录: {deleted_count}条")
        return deleted_count


class APIKeyValidationService:
    """API密钥校验服务"""

    @staticmethod
    def validate_api_key(db: Session, api_key: str, service: str = "llm_proxy") -> dict:
        """
        完整的API密钥校验逻辑
        返回校验结果和相关信息
        """
        logger.info(f"开始校验API密钥: {api_key[:10]}...")

        # 1. 检查API密钥是否存在
        api_key_info = APIKeyCRUD.get_api_key_info(db, api_key)
        if not api_key_info:
            logger.warning(f"API密钥不存在: {api_key[:10]}...")
            return {
                "valid": False,
                "error_code": 1003,
                "error_type": "invalid_api_key",
                "message": "API key is invalid"
            }

        # 2. 检查用户是否存在和状态
        user = UserCRUD.get_user_by_id(db, api_key_info.user_id)
        if not user:
            logger.error(f"用户不存在: {api_key_info.user_id}")
            return {
                "valid": False,
                "error_code": 1003,
                "error_type": "invalid_api_key",
                "message": "User not found"
            }

        # 3. 检查账户是否被封禁
        if user.is_banned or not user.is_active:
            logger.warning(f"账户被封禁: {user.user_id}")
            return {
                "valid": False,
                "error_code": 1004,
                "error_type": "account_banned",
                "message": "Account has been banned"
            }

        # 4. 检查频率限制
        if not RateLimitCRUD.check_rate_limit(db, user.user_id, service):
            logger.warning(f"请求频率超限: {user.user_id}")
            return {
                "valid": False,
                "error_code": 1005,
                "error_type": "rate_limit_exceeded",
                "message": "Rate limit exceeded"
            }

        # 5. 检查套餐状态
        plan_status = UserPlanCRUD.check_plan_status(db, user.user_id)
        if not plan_status["valid"]:
            error_code_map = {
                "plan_expired": 1001,
                "credits_exhausted": 1002
            }
            return {
                "valid": False,
                "error_code": error_code_map.get(plan_status["error_type"], 1008),
                "error_type": plan_status["error_type"],
                "message": plan_status["message"],
                "expire_date": plan_status.get("expire_date")
            }

        # 6. 更新API密钥使用时间
        APIKeyCRUD.update_last_used(db, api_key)

        # 7. 记录使用记录
        UsageRecordCRUD.create_usage_record(
            db, user.user_id, api_key_info.id, service
        )

        # 8. 校验成功
        logger.info(f"API密钥校验成功: {user.user_id}")
        return {
            "valid": True,
            "user_id": user.user_id,
            "real_api_key": api_key_info.real_api_key,
            "plan_type": plan_status["plan_type"]
        }