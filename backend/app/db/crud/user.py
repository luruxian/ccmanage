from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..models import User
from datetime import datetime
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class UserCRUD:
    """用户相关的数据库操作"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """根据用户ID获取用户信息"""
        return self.db.query(User).filter(User.user_id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """根据邮箱获取用户信息"""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_phone(self, phone: str) -> Optional[User]:
        """根据手机号获取用户信息"""
        return self.db.query(User).filter(User.phone == phone).first()

    def create_user(self, user_data: Dict[str, Any]) -> User:
        """创建新用户"""
        db_user = User(**user_data)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        logger.info(f"创建新用户: {user_data.get('user_id')}")
        return db_user

    def update_user_status(self, user_id: str, is_active: bool = None, is_banned: bool = None) -> bool:
        """更新用户状态"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        if is_active is not None:
            user.is_active = is_active
        if is_banned is not None:
            user.is_banned = is_banned

        user.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"更新用户状态: {user_id}")
        return True

    def update_user_info(self, user_id: str, update_data: Dict[str, Any]) -> Optional[User]:
        """更新用户信息"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        # 更新允许修改的字段
        allowed_fields = ['email', 'phone', 'password_hash']
        for field, value in update_data.items():
            if field in allowed_fields and value is not None:
                setattr(user, field, value)

        user.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(user)
        logger.info(f"更新用户信息: {user_id}")
        return user

    def verify_email(self, user_id: str) -> bool:
        """验证用户邮箱"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        user.is_email_verified = True
        user.is_active = True
        user.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"用户邮箱验证完成: {user_id}")
        return True

    def update_last_login(self, user_id: str) -> bool:
        """更新最后登录时间"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        user.last_login_at = datetime.now()
        self.db.commit()
        return True

    def delete_user(self, user_id: str) -> bool:
        """软删除用户（设置为非激活状态）"""
        return self.update_user_status(user_id, is_active=False)

    def is_user_active(self, user_id: str) -> bool:
        """检查用户是否激活"""
        user = self.get_user_by_id(user_id)
        return user and user.is_active and not user.is_banned if user else False

    def get_users_list(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> list:
        """获取用户列表"""
        query = self.db.query(User)

        if active_only:
            query = query.filter(User.is_active == True, User.is_banned == False)

        return query.offset(skip).limit(limit).all()

    def count_users(self, active_only: bool = True) -> int:
        """统计用户数量"""
        query = self.db.query(User)

        if active_only:
            query = query.filter(User.is_active == True, User.is_banned == False)

        return query.count()