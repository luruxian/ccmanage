from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_
from ..models import UserKey, User, APIKey
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class UserKeyCRUD:
    """用户密钥关联CRUD操作"""

    def __init__(self, db: Session):
        self.db = db

    def create_user_key_relation(self, user_id: str, api_key_id: int, notes: Optional[str] = None) -> Optional[UserKey]:
        """创建用户密钥关联"""
        try:
            # 检查关联是否已存在
            existing = self.db.query(UserKey).filter(
                and_(UserKey.user_id == user_id, UserKey.api_key_id == api_key_id)
            ).first()

            if existing:
                logger.warning(f"用户密钥关联已存在: {user_id} - {api_key_id}")
                return existing

            user_key = UserKey(
                user_id=user_id,
                api_key_id=api_key_id,
                status="active",
                notes=notes
            )

            self.db.add(user_key)
            self.db.commit()
            self.db.refresh(user_key)

            logger.info(f"用户密钥关联创建成功: {user_id} - {api_key_id}")
            return user_key

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建用户密钥关联失败: {str(e)}")
            return None

    def get_user_keys(self, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取用户的所有密钥关联"""
        try:
            query = self.db.query(UserKey, APIKey).join(APIKey, UserKey.api_key_id == APIKey.id).filter(
                UserKey.user_id == user_id
            )

            if status:
                query = query.filter(UserKey.status == status)

            query = query.order_by(desc(UserKey.created_at))
            results = query.all()

            user_keys = []
            for user_key, api_key in results:
                user_keys.append({
                    "id": user_key.id,
                    "user_id": user_key.user_id,
                    "api_key_id": user_key.api_key_id,
                    "api_key": api_key.api_key,
                    "key_name": api_key.key_name,
                    "description": api_key.description,
                    "activation_date": user_key.activation_date,
                    "status": user_key.status,
                    "notes": user_key.notes,
                    "last_used_at": api_key.last_used_at,
                    "created_at": user_key.created_at
                })

            return user_keys

        except Exception as e:
            logger.error(f"获取用户密钥关联失败: {str(e)}")
            return []

    def get_key_users(self, api_key_id: int) -> List[Dict[str, Any]]:
        """获取密钥关联的所有用户"""
        try:
            query = self.db.query(UserKey, User).join(User, UserKey.user_id == User.user_id).filter(
                UserKey.api_key_id == api_key_id
            ).order_by(desc(UserKey.created_at))

            results = query.all()

            key_users = []
            for user_key, user in results:
                key_users.append({
                    "id": user_key.id,
                    "user_id": user_key.user_id,
                    "email": user.email,
                    "activation_date": user_key.activation_date,
                    "status": user_key.status,
                    "notes": user_key.notes,
                    "user_is_active": user.is_active,
                    "user_is_banned": user.is_banned,
                    "created_at": user_key.created_at
                })

            return key_users

        except Exception as e:
            logger.error(f"获取密钥用户关联失败: {str(e)}")
            return []

    def get_user_key_relation(self, user_id: str, api_key_id: int) -> Optional[UserKey]:
        """获取特定的用户密钥关联"""
        try:
            return self.db.query(UserKey).filter(
                and_(UserKey.user_id == user_id, UserKey.api_key_id == api_key_id)
            ).first()
        except Exception as e:
            logger.error(f"获取用户密钥关联失败: {str(e)}")
            return None

    def update_user_key_status(self, relation_id: int, status: str, notes: Optional[str] = None) -> bool:
        """更新用户密钥关联状态"""
        try:
            user_key = self.db.query(UserKey).filter(UserKey.id == relation_id).first()
            if not user_key:
                return False

            user_key.status = status
            if notes is not None:
                user_key.notes = notes
            user_key.updated_at = datetime.utcnow()

            self.db.commit()
            logger.info(f"用户密钥关联状态更新成功: {relation_id}, 新状态: {status}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"更新用户密钥关联状态失败: {str(e)}")
            return False

    def deactivate_user_key_relation(self, user_id: str, api_key_id: int) -> bool:
        """停用用户密钥关联"""
        try:
            user_key = self.get_user_key_relation(user_id, api_key_id)
            if not user_key:
                return False

            user_key.status = "inactive"
            user_key.updated_at = datetime.utcnow()
            self.db.commit()

            logger.info(f"用户密钥关联已停用: {user_id} - {api_key_id}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"停用用户密钥关联失败: {str(e)}")
            return False

    def delete_user_key_relation(self, relation_id: int) -> bool:
        """删除用户密钥关联"""
        try:
            user_key = self.db.query(UserKey).filter(UserKey.id == relation_id).first()
            if not user_key:
                return False

            self.db.delete(user_key)
            self.db.commit()

            logger.info(f"用户密钥关联删除成功: {relation_id}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"删除用户密钥关联失败: {str(e)}")
            return False

    def get_user_key_statistics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """获取用户密钥关联统计"""
        try:
            query = self.db.query(UserKey)
            if user_id:
                query = query.filter(UserKey.user_id == user_id)

            total_relations = query.count()
            active_relations = query.filter(UserKey.status == "active").count()
            inactive_relations = query.filter(UserKey.status == "inactive").count()

            return {
                "total_relations": total_relations,
                "active_relations": active_relations,
                "inactive_relations": inactive_relations,
                "expired_relations": total_relations - active_relations - inactive_relations
            }
        except Exception as e:
            logger.error(f"获取用户密钥关联统计失败: {str(e)}")
            return {
                "total_relations": 0,
                "active_relations": 0,
                "inactive_relations": 0,
                "expired_relations": 0
            }