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

    def get_package_user_keys(self, package_id: int, page: int = 1, page_size: int = 50, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取订阅关联的用户密钥列表（支持分页）"""
        try:
            # 通过UserPlan表关联到Package和UserKey
            from ..models import UserPlan

            query = self.db.query(UserKey, APIKey, User, UserPlan).join(
                APIKey, UserKey.api_key_id == APIKey.id
            ).join(
                User, UserKey.user_id == User.user_id
            ).join(
                UserPlan, UserKey.user_id == UserPlan.user_id
            ).filter(
                UserPlan.package_id == package_id
            )

            if status_filter:
                query = query.filter(UserKey.status == status_filter)

            # 分页
            offset = (page - 1) * page_size
            query = query.order_by(desc(UserKey.created_at)).offset(offset).limit(page_size)
            results = query.all()

            user_keys = []
            for user_key, api_key, user, user_plan in results:
                # 计算剩余天数
                remaining_days = 0
                if user_plan.expire_date:
                    delta = user_plan.expire_date - datetime.utcnow()
                    remaining_days = max(0, delta.days)

                user_keys.append({
                    "id": user_key.id,
                    "user_id": user_key.user_id,
                    "api_key_id": user_key.api_key_id,
                    "api_key": api_key.api_key,
                    "key_name": api_key.key_name,
                    "description": api_key.description,
                    "user_email": user.email,
                    "activation_date": user_key.activation_date,
                    "status": user_key.status,
                    "notes": user_key.notes,
                    "last_used_at": api_key.last_used_at,
                    "start_date": user_plan.start_date,
                    "expire_date": user_plan.expire_date,
                    "remaining_days": remaining_days,
                    "remaining_credits": user_plan.credits,
                    "total_credits": user_plan.total_credits,
                    "created_at": user_key.created_at
                })

            return user_keys

        except Exception as e:
            logger.error(f"获取订阅用户密钥列表失败: {str(e)}")
            return []

    def count_package_user_keys(self, package_id: int, status_filter: Optional[str] = None) -> int:
        """统计订阅关联的用户密钥数量"""
        try:
            from ..models import UserPlan

            query = self.db.query(UserKey).join(
                UserPlan, UserKey.user_id == UserPlan.user_id
            ).filter(
                UserPlan.package_id == package_id
            )

            if status_filter:
                query = query.filter(UserKey.status == status_filter)

            return query.count()

        except Exception as e:
            logger.error(f"统计订阅用户密钥数量失败: {str(e)}")
            return 0

    def bulk_generate_user_keys(self, package_id: int, user_ids: List[str], notes: Optional[str] = None) -> int:
        """批量生成用户密钥关联"""
        try:
            from ..models import UserPlan
            success_count = 0

            for user_id in user_ids:
                # 检查用户是否已有该订阅的套餐
                user_plan = self.db.query(UserPlan).filter(
                    and_(UserPlan.user_id == user_id, UserPlan.package_id == package_id)
                ).first()

                if not user_plan:
                    continue

                # 检查是否已存在用户密钥关联
                existing = self.db.query(UserKey).filter(
                    UserKey.user_id == user_id
                ).first()

                if existing:
                    continue

                # 创建默认的API密钥（这里需要根据实际业务逻辑调整）
                from ..models import APIKey
                api_key = self.db.query(APIKey).filter(
                    APIKey.user_id == user_id
                ).first()

                if api_key:
                    user_key = UserKey(
                        user_id=user_id,
                        api_key_id=api_key.id,
                        status="active",
                        notes=notes
                    )
                    self.db.add(user_key)
                    success_count += 1

            self.db.commit()
            logger.info(f"批量生成用户密钥关联成功: {success_count} 个")
            return success_count

        except Exception as e:
            self.db.rollback()
            logger.error(f"批量生成用户密钥关联失败: {str(e)}")
            return 0

    def bulk_update_user_key_status(self, package_id: int, user_ids: List[str], status: str, notes: Optional[str] = None) -> int:
        """批量更新用户密钥状态"""
        try:
            from ..models import UserPlan
            success_count = 0

            for user_id in user_ids:
                # 通过UserPlan关联找到相关的UserKey
                user_keys = self.db.query(UserKey).join(
                    UserPlan, UserKey.user_id == UserPlan.user_id
                ).filter(
                    and_(UserPlan.package_id == package_id, UserKey.user_id == user_id)
                ).all()

                for user_key in user_keys:
                    user_key.status = status
                    if notes is not None:
                        user_key.notes = notes
                    user_key.updated_at = datetime.utcnow()
                    success_count += 1

            self.db.commit()
            logger.info(f"批量更新用户密钥状态成功: {success_count} 个")
            return success_count

        except Exception as e:
            self.db.rollback()
            logger.error(f"批量更新用户密钥状态失败: {str(e)}")
            return 0

    def bulk_delete_user_keys(self, package_id: int, user_ids: List[str]) -> int:
        """批量删除用户密钥关联"""
        try:
            from ..models import UserPlan
            success_count = 0

            for user_id in user_ids:
                # 通过UserPlan关联找到相关的UserKey
                user_keys = self.db.query(UserKey).join(
                    UserPlan, UserKey.user_id == UserPlan.user_id
                ).filter(
                    and_(UserPlan.package_id == package_id, UserKey.user_id == user_id)
                ).all()

                for user_key in user_keys:
                    self.db.delete(user_key)
                    success_count += 1

            self.db.commit()
            logger.info(f"批量删除用户密钥关联成功: {success_count} 个")
            return success_count

        except Exception as e:
            self.db.rollback()
            logger.error(f"批量删除用户密钥关联失败: {str(e)}")
            return 0

    def bulk_generate_standalone_user_keys(self, package_id: int, count: int = 10, status: str = "inactive") -> int:
        """批量生成独立的用户密钥（不依赖具体用户）"""
        try:
            from ..models import APIKey, User, UserPlan
            import uuid
            import secrets
            success_count = 0

            for i in range(count):
                # 生成临时用户ID和API密钥
                temp_user_id = f"temp_user_{uuid.uuid4().hex[:8]}"
                temp_api_key = f"sk-{secrets.token_urlsafe(32)}"
                temp_real_api_key = f"real-{secrets.token_urlsafe(48)}"

                # 创建临时用户
                temp_user = User(
                    user_id=temp_user_id,
                    email=f"{temp_user_id}@temp.com",
                    password_hash="temp_hash",
                    is_active=False,
                    is_email_verified=False
                )
                self.db.add(temp_user)
                self.db.flush()  # 获取user ID

                # 创建API密钥
                api_key = APIKey(
                    user_id=temp_user_id,
                    api_key=temp_api_key,
                    real_api_key=temp_real_api_key,
                    key_name=f"Generated Key {i+1}",
                    description=f"Batch generated key for package {package_id}",
                    is_active=True
                )
                self.db.add(api_key)
                self.db.flush()  # 获取api_key ID

                # 创建用户套餐关联
                from datetime import datetime, timedelta
                user_plan = UserPlan(
                    user_id=temp_user_id,
                    package_id=package_id,
                    plan_type="generated",
                    credits=0,
                    total_credits=0,
                    start_date=datetime.utcnow(),
                    expire_date=datetime.utcnow() + timedelta(days=365),
                    is_active=True
                )
                self.db.add(user_plan)
                self.db.flush()

                # 创建用户密钥关联
                user_key = UserKey(
                    user_id=temp_user_id,
                    api_key_id=api_key.id,
                    status=status,
                    notes=f"Batch generated - {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"
                )
                self.db.add(user_key)
                success_count += 1

            self.db.commit()
            logger.info(f"批量生成独立用户密钥成功: {success_count} 个")
            return success_count

        except Exception as e:
            self.db.rollback()
            logger.error(f"批量生成独立用户密钥失败: {str(e)}")
            return 0