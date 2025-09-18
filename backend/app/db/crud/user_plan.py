from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..models import UserPlan
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class UserPlanCRUD:
    """用户套餐相关的数据库操作"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_plan_by_id(self, plan_id: int) -> Optional[UserPlan]:
        """根据套餐ID获取套餐信息"""
        return self.db.query(UserPlan).filter(UserPlan.id == plan_id).first()

    def get_active_plan(self, user_id: str) -> Optional[UserPlan]:
        """获取用户当前激活的套餐"""
        return self.db.query(UserPlan).filter(
            UserPlan.user_id == user_id,
            UserPlan.is_active == True,
            UserPlan.expire_date > datetime.now()
        ).first()

    def get_user_plans(self, user_id: str, active_only: bool = False) -> List[UserPlan]:
        """获取用户的所有套餐"""
        query = self.db.query(UserPlan).filter(UserPlan.user_id == user_id)

        if active_only:
            query = query.filter(
                UserPlan.is_active == True,
                UserPlan.expire_date > datetime.now()
            )

        return query.order_by(UserPlan.created_at.desc()).all()

    def create_user_plan(self, plan_data: Dict[str, Any]) -> UserPlan:
        """创建新的用户套餐"""
        db_plan = UserPlan(**plan_data)
        self.db.add(db_plan)
        self.db.commit()
        self.db.refresh(db_plan)
        logger.info(f"创建新用户套餐: {plan_data.get('user_id')} - {plan_data.get('plan_type')}")
        return db_plan

    def update_plan_credits(self, user_id: str, credits_used: int) -> bool:
        """更新套餐积分（消费积分）"""
        active_plan = self.get_active_plan(user_id)
        if not active_plan:
            logger.warning(f"用户 {user_id} 没有激活的套餐")
            return False

        if active_plan.credits < credits_used:
            logger.warning(f"用户 {user_id} 积分不足，需要 {credits_used}，剩余 {active_plan.credits}")
            return False

        active_plan.credits -= credits_used
        active_plan.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"用户 {user_id} 消费积分 {credits_used}，剩余 {active_plan.credits}")
        return True

    def add_plan_credits(self, user_id: str, credits_to_add: int) -> bool:
        """增加套餐积分"""
        active_plan = self.get_active_plan(user_id)
        if not active_plan:
            logger.warning(f"用户 {user_id} 没有激活的套餐")
            return False

        active_plan.credits += credits_to_add
        active_plan.total_credits += credits_to_add
        active_plan.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"用户 {user_id} 增加积分 {credits_to_add}，总积分 {active_plan.credits}")
        return True

    def deactivate_plan(self, plan_id: int) -> bool:
        """停用套餐"""
        plan = self.get_user_plan_by_id(plan_id)
        if not plan:
            return False

        plan.is_active = False
        plan.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"停用套餐: {plan_id}")
        return True

    def extend_plan(self, user_id: str, days: int) -> bool:
        """延长套餐有效期"""
        active_plan = self.get_active_plan(user_id)
        if not active_plan:
            return False

        active_plan.expire_date += timedelta(days=days)
        active_plan.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"延长用户 {user_id} 套餐 {days} 天")
        return True

    def upgrade_plan(self, user_id: str, new_plan_type: str, additional_credits: int = 0) -> bool:
        """升级套餐"""
        active_plan = self.get_active_plan(user_id)
        if not active_plan:
            return False

        active_plan.plan_type = new_plan_type
        if additional_credits > 0:
            active_plan.credits += additional_credits
            active_plan.total_credits += additional_credits
        active_plan.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"升级用户 {user_id} 套餐到 {new_plan_type}")
        return True

    def get_plan_usage_stats(self, user_id: str) -> Dict[str, Any]:
        """获取套餐使用统计"""
        active_plan = self.get_active_plan(user_id)
        if not active_plan:
            return {
                "has_active_plan": False,
                "plan_type": None,
                "credits_remaining": 0,
                "total_credits": 0,
                "expire_date": None,
                "days_remaining": 0
            }

        days_remaining = (active_plan.expire_date - datetime.now()).days
        usage_percentage = ((active_plan.total_credits - active_plan.credits) / active_plan.total_credits * 100) if active_plan.total_credits > 0 else 0

        return {
            "has_active_plan": True,
            "plan_type": active_plan.plan_type,
            "credits_remaining": active_plan.credits,
            "total_credits": active_plan.total_credits,
            "credits_used": active_plan.total_credits - active_plan.credits,
            "usage_percentage": round(usage_percentage, 2),
            "expire_date": active_plan.expire_date,
            "days_remaining": max(0, days_remaining),
            "auto_renew": active_plan.auto_renew
        }

    def check_plan_expiry(self) -> List[UserPlan]:
        """检查即将过期的套餐（7天内过期）"""
        expire_threshold = datetime.now() + timedelta(days=7)
        return self.db.query(UserPlan).filter(
            UserPlan.is_active == True,
            UserPlan.expire_date <= expire_threshold,
            UserPlan.expire_date > datetime.now()
        ).all()

    def auto_deactivate_expired_plans(self) -> int:
        """自动停用已过期的套餐"""
        expired_plans = self.db.query(UserPlan).filter(
            UserPlan.is_active == True,
            UserPlan.expire_date <= datetime.now()
        ).all()

        count = 0
        for plan in expired_plans:
            plan.is_active = False
            plan.updated_at = datetime.now()
            count += 1
            logger.info(f"自动停用过期套餐: {plan.user_id} - {plan.plan_type}")

        if count > 0:
            self.db.commit()

        return count