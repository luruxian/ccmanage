from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_, or_
from ..models import APIKey, User, Package
from datetime import datetime, timedelta
import logging
import secrets
import string

logger = logging.getLogger(__name__)


class APIKeyCRUD:
    """用户密钥CRUD操作（合并后的完整版本）"""

    def __init__(self, db: Session):
        self.db = db

    def generate_api_key(self, prefix: str = "sk-", length: int = 32) -> str:
        """生成API密钥"""
        alphabet = string.ascii_letters + string.digits
        random_part = ''.join(secrets.choice(alphabet) for _ in range(length))
        return f"{prefix}{random_part}"

    # 原有API密钥管理功能
    def get_api_key_by_key(self, api_key: str) -> Optional[APIKey]:
        """根据API密钥获取记录"""
        return self.db.query(APIKey).filter(APIKey.api_key == api_key).first()

    def get_api_key_by_id(self, api_key_id: int) -> Optional[APIKey]:
        """根据ID获取API密钥记录"""
        return self.db.query(APIKey).filter(APIKey.id == api_key_id).first()

    def get_user_api_keys(self, user_id: str, active_only: bool = True) -> List[APIKey]:
        """获取用户的所有API密钥"""
        query = self.db.query(APIKey).filter(APIKey.user_id == user_id)

        if active_only:
            query = query.filter(APIKey.status == 'active')  # 使用status字段过滤，只返回激活状态的密钥

        return query.all()

    def get_user_api_keys_with_package_info(self, user_id: str, active_only: bool = True) -> List[Dict[str, Any]]:
        """获取用户的所有API密钥（包含套餐信息） - 专门为普通用户前端使用"""
        # 使用JOIN一次性获取所有数据，避免N+1查询
        query = (
            self.db.query(APIKey, Package)
            .outerjoin(Package, APIKey.package_id == Package.id)
            .filter(APIKey.user_id == user_id)
        )

        if active_only:
            query = query.filter(APIKey.status == 'active')

        # 获取所有记录
        results = query.all()

        result = []
        for api_key, package in results:
            # 计算剩余天数
            remaining_days = None
            current_status = api_key.status or "inactive"

            if api_key.expire_date:
                now = datetime.now()
                expire_date = api_key.expire_date

                delta = expire_date - now
                remaining_days = max(0, delta.days)

                # 如果已过期，更新状态为expired
                if remaining_days == 0 and delta.total_seconds() < 0:
                    current_status = "expired"
                elif api_key.is_active and current_status == "inactive":
                    current_status = "active"

            result.append({
                "id": api_key.id,
                "user_key_id": api_key.id,  # 兼容前端
                "api_key": api_key.api_key,
                "key_name": api_key.key_name,
                "package_name": package.package_name if package else "未知套餐",
                "description": api_key.description,
                "is_active": api_key.is_active,
                "last_used_at": api_key.last_used_at.isoformat() if api_key.last_used_at else None,  # 转为ISO字符串
                "created_at": api_key.created_at.isoformat(),  # 转为ISO字符串
                "activation_date": api_key.activation_date.isoformat() if api_key.activation_date else None,  # 转为ISO字符串
                "expire_date": api_key.expire_date.isoformat() if api_key.expire_date else None,  # 转为ISO字符串
                "remaining_days": remaining_days,
                "status": current_status,
                "total_credits": api_key.total_credits,
                "remaining_credits": api_key.remaining_credits,
                "usage_count": 0  # 这里需要从usage_records表查询，暂时设为0
            })

        # 按激活时间倒序排列，未激活的放在最后
        result.sort(key=lambda x: x.get('activation_date') or datetime.min, reverse=True)

        return result

    def create_api_key(self, api_key_data: Dict[str, Any]) -> APIKey:
        """创建新的API密钥"""
        db_api_key = APIKey(**api_key_data)
        self.db.add(db_api_key)
        self.db.commit()
        self.db.refresh(db_api_key)
        logger.info(f"创建新API密钥: {api_key_data.get('api_key')}")
        return db_api_key

    def update_api_key_status(self, api_key: str, is_active: bool) -> bool:
        """更新API密钥状态"""
        db_api_key = self.get_api_key_by_key(api_key)
        if not db_api_key:
            return False

        db_api_key.is_active = is_active
        db_api_key.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"更新API密钥状态: {api_key}")
        return True

    def update_last_used(self, api_key: str) -> bool:
        """更新API密钥最后使用时间"""
        db_api_key = self.get_api_key_by_key(api_key)
        if not db_api_key:
            return False

        db_api_key.last_used_at = datetime.now()
        self.db.commit()
        return True

    def update_api_key_info(self, api_key_id: int, update_data: Dict[str, Any]) -> Optional[APIKey]:
        """更新API密钥信息"""
        db_api_key = self.get_api_key_by_id(api_key_id)
        if not db_api_key:
            return None

        # 更新允许修改的字段
        allowed_fields = ['key_name', 'description', 'real_api_key']
        for field, value in update_data.items():
            if field in allowed_fields and value is not None:
                setattr(db_api_key, field, value)

        db_api_key.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(db_api_key)
        logger.info(f"更新API密钥信息: {api_key_id}")
        return db_api_key

    def delete_api_key(self, api_key: str) -> bool:
        """软删除API密钥（设置为非激活状态）"""
        return self.update_api_key_status(api_key, False)

    def is_api_key_valid(self, api_key: str) -> bool:
        """检查API密钥是否有效"""
        db_api_key = self.get_api_key_by_key(api_key)
        return db_api_key and db_api_key.is_active if db_api_key else False

    def get_real_api_key(self, api_key: str) -> Optional[str]:
        """获取真实的API密钥"""
        db_api_key = self.get_api_key_by_key(api_key)
        if db_api_key and db_api_key.is_active:
            return db_api_key.real_api_key
        return None

    def count_user_api_keys(self, user_id: str, active_only: bool = True) -> int:
        """统计用户的API密钥数量"""
        query = self.db.query(APIKey).filter(APIKey.user_id == user_id)

        if active_only:
            query = query.filter(APIKey.is_active == True)

        return query.count()

    def get_api_keys_list(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[APIKey]:
        """获取API密钥列表"""
        query = self.db.query(APIKey)

        if active_only:
            query = query.filter(APIKey.is_active == True)

        return query.offset(skip).limit(limit).all()

    # 新增：用户密钥管理功能（从user_key.py合并过来）
    def bulk_generate_standalone_user_keys(self, package_id: int, count: int, real_api_key: str, notes: Optional[str] = None) -> List[Dict[str, Any]]:
        """批量生成独立的用户密钥（不自动创建用户）"""
        try:
            # 获取套餐信息
            package = self.db.query(Package).filter(Package.id == package_id).first()
            if not package:
                logger.error(f"套餐不存在: {package_id}")
                return []

            generated_keys = []
            for i in range(count):
                # 生成唯一的API密钥
                api_key = self.generate_api_key()

                # 确保API密钥唯一
                while self.db.query(APIKey).filter(APIKey.api_key == api_key).first():
                    api_key = self.generate_api_key()

                # 创建APIKey记录
                user_key = APIKey(
                    user_id=None,  # 激活前为空
                    api_key=api_key,
                    real_api_key=real_api_key,
                    key_name=f"批量生成-{i+1}",
                    description=f"批量生成的用户密钥 - 套餐: {package.package_name}",
                    is_active=True,

                    # 订阅管理字段
                    package_id=package_id,
                    activation_date=None,  # 激活前为空
                    expire_date=None,  # 激活时计算
                    remaining_days=package.duration_days,
                    remaining_credits=package.credits,
                    total_credits=package.credits,
                    status="inactive",  # 默认未激活
                    notes=notes or f"批量生成 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                )

                self.db.add(user_key)
                generated_keys.append({
                    "api_key": api_key,
                    "real_api_key": real_api_key,
                    "package_name": package.package_name,
                    "credits": package.credits,
                    "duration_days": package.duration_days
                })

            self.db.commit()
            logger.info(f"批量生成用户密钥成功: {count}个")
            return generated_keys

        except Exception as e:
            self.db.rollback()
            logger.error(f"批量生成用户密钥失败: {str(e)}")
            return []

    def activate_user_key(self, api_key: str, user_email: str) -> Dict[str, Any]:
        """激活用户密钥"""
        try:
            # 查找用户密钥
            user_key_record = self.db.query(APIKey).filter(APIKey.api_key == api_key).first()
            if not user_key_record:
                return {"success": False, "message": "用户密钥不存在"}

            if user_key_record.status == "active":
                return {"success": False, "message": "用户密钥已被激活"}

            # 查找或创建用户
            user = self.db.query(User).filter(User.email == user_email).first()
            if not user:
                return {"success": False, "message": "用户不存在，请先注册"}

            # 计算过期时间（使用操作系统时区）
            activation_date = datetime.now()
            expire_date = activation_date + timedelta(days=user_key_record.remaining_days) if user_key_record.remaining_days else None

            # 更新用户密钥信息
            user_key_record.user_id = user.user_id
            user_key_record.activation_date = activation_date
            user_key_record.expire_date = expire_date
            user_key_record.status = "active"

            self.db.commit()

            logger.info(f"用户密钥激活成功: {api_key} -> {user_email}")
            return {
                "success": True,
                "message": "激活成功",
                "activation_date": activation_date.isoformat(),
                "expire_date": expire_date.isoformat() if expire_date else None
            }

        except Exception as e:
            self.db.rollback()
            logger.error(f"激活用户密钥失败: {str(e)}")
            return {"success": False, "message": f"激活失败: {str(e)}"}

    def get_package_user_keys(self, package_id: int, page: int = 1, page_size: int = 50, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取订阅关联的用户密钥列表（支持分页）"""
        try:
            # 使用JOIN一次性获取所有数据，避免N+1查询
            query = (
                self.db.query(APIKey, User)
                .outerjoin(User, APIKey.user_id == User.user_id)
                .filter(APIKey.package_id == package_id)
            )

            if status_filter:
                query = query.filter(APIKey.status == status_filter)

            # 分页
            offset = (page - 1) * page_size
            query = query.order_by(desc(APIKey.created_at)).offset(offset).limit(page_size)
            results = query.all()

            user_keys = []
            for api_key, user in results:
                # 获取用户邮箱（如果已激活）
                user_email = user.email if user else "未激活"

                user_keys.append({
                    "id": api_key.id,
                    "user_id": api_key.user_id,
                    "api_key_id": api_key.id,  # 为了兼容性，添加api_key_id
                    "api_key": api_key.api_key,
                    "real_api_key": api_key.real_api_key,  # 添加real_api_key字段
                    "key_name": api_key.key_name,
                    "description": api_key.description,
                    "user_email": user_email,
                    "status": api_key.status,
                    "activation_date": api_key.activation_date.isoformat() if api_key.activation_date else None,  # 转为ISO字符串
                    "expire_date": api_key.expire_date.isoformat() if api_key.expire_date else None,  # 转为ISO字符串
                    "remaining_days": api_key.remaining_days,
                    "remaining_credits": api_key.remaining_credits,
                    "total_credits": api_key.total_credits,
                    "last_used_at": api_key.last_used_at.isoformat() if api_key.last_used_at else None,  # 转为ISO字符串
                    "created_at": api_key.created_at.isoformat(),  # 转为ISO字符串
                    "notes": api_key.notes
                })

            # 添加日志输出，查看返回的数据
            logger.info(f"获取订阅用户密钥列表成功，共 {len(user_keys)} 条记录")
            for i, key in enumerate(user_keys):
                logger.info(f"密钥 {i+1}: id={key['id']}, expire_date={key['expire_date']}, activation_date={key['activation_date']}")

            return user_keys

        except Exception as e:
            logger.error(f"获取订阅用户密钥列表失败: {str(e)}")
            return []

    def get_package_user_keys_count(self, package_id: int, status_filter: Optional[str] = None) -> int:
        """获取订阅用户密钥总数"""
        try:
            query = self.db.query(APIKey).filter(APIKey.package_id == package_id)

            if status_filter:
                query = query.filter(APIKey.status == status_filter)

            return query.count()
        except Exception as e:
            logger.error(f"获取订阅用户密钥总数失败: {str(e)}")
            return 0

    def delete_user_keys_by_ids(self, api_key_ids: List[int]) -> Dict[str, Any]:
        """根据ID列表删除用户密钥"""
        try:
            # 查询要删除的密钥
            keys_to_delete = self.db.query(APIKey).filter(APIKey.id.in_(api_key_ids)).all()

            if not keys_to_delete:
                return {"success": False, "message": "没有找到要删除的密钥"}

            deleted_count = len(keys_to_delete)

            # 删除密钥
            for key in keys_to_delete:
                self.db.delete(key)

            self.db.commit()

            logger.info(f"删除用户密钥成功: {deleted_count}个")
            return {"success": True, "deleted_count": deleted_count}

        except Exception as e:
            self.db.rollback()
            logger.error(f"删除用户密钥失败: {str(e)}")
            return {"success": False, "message": f"删除失败: {str(e)}"}

    def disable_user_keys_by_ids(self, api_key_ids: List[int]) -> Dict[str, Any]:
        """根据ID列表禁用用户密钥"""
        try:
            # 更新密钥状态
            result = self.db.query(APIKey).filter(APIKey.id.in_(api_key_ids)).update(
                {"status": "inactive", "is_active": False},
                synchronize_session=False
            )

            self.db.commit()

            logger.info(f"禁用用户密钥成功: {result}个")
            return {"success": True, "disabled_count": result}

        except Exception as e:
            self.db.rollback()
            logger.error(f"禁用用户密钥失败: {str(e)}")
            return {"success": False, "message": f"禁用失败: {str(e)}"}

    def get_user_keys_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        """获取用户的所有密钥"""
        try:
            # 使用JOIN一次性获取所有数据，避免N+1查询
            query = (
                self.db.query(APIKey, Package)
                .outerjoin(Package, APIKey.package_id == Package.id)
                .filter(APIKey.user_id == user_id)
                .filter(APIKey.status == 'active')  # 只返回激活状态的密钥
            )

            results = query.all()

            result = []
            for api_key, package in results:
                result.append({
                    "id": api_key.id,
                    "api_key": api_key.api_key,
                    "status": api_key.status,
                    "activation_date": api_key.activation_date.isoformat() if api_key.activation_date else None,
                    "expire_date": api_key.expire_date.isoformat() if api_key.expire_date else None,
                    "remaining_days": api_key.remaining_days,
                    "remaining_credits": api_key.remaining_credits,
                    "total_credits": api_key.total_credits,
                    "package_name": package.package_name if package else "未知套餐",
                    "created_at": api_key.created_at.isoformat(),
                    "notes": api_key.notes
                })

            return result

        except Exception as e:
            logger.error(f"获取用户密钥列表失败: {str(e)}")
            return []

    def get_user_key_statistics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """获取用户密钥统计"""
        try:
            query = self.db.query(APIKey)
            if user_id:
                query = query.filter(APIKey.user_id == user_id)

            total_keys = query.count()
            active_keys = query.filter(APIKey.status == "active").count()
            inactive_keys = query.filter(APIKey.status == "inactive").count()

            return {
                "total_keys": total_keys,
                "active_keys": active_keys,
                "inactive_keys": inactive_keys,
                "expired_keys": total_keys - active_keys - inactive_keys
            }
        except Exception as e:
            logger.error(f"获取用户密钥统计失败: {str(e)}")
            return {
                "total_keys": 0,
                "active_keys": 0,
                "inactive_keys": 0,
                "expired_keys": 0
            }

    def get_plan_usage_stats(self, user_id: str) -> Dict[str, Any]:
        """获取用户套餐使用统计（替代UserPlanCRUD的功能）"""
        try:
            # 使用JOIN一次性获取所有数据，避免N+1查询
            active_key_result = (
                self.db.query(APIKey, Package)
                .outerjoin(Package, APIKey.package_id == Package.id)
                .filter(
                    APIKey.user_id == user_id,
                    APIKey.status == "active",
                    APIKey.expire_date > datetime.now()
                )
                .first()
            )

            if not active_key_result:
                return {
                    "has_active_plan": False,
                    "plan_type": None,
                    "credits_remaining": 0,
                    "total_credits": 0,
                    "expire_date": None,
                    "days_remaining": 0,
                    "usage_percentage": 0
                }

            active_key, package = active_key_result

            # 计算剩余天数
            days_remaining = (active_key.expire_date - datetime.now()).days if active_key.expire_date else 0

            # 计算使用百分比
            usage_percentage = 0
            if active_key.total_credits and active_key.total_credits > 0:
                used_credits = active_key.total_credits - (active_key.remaining_credits or 0)
                usage_percentage = (used_credits / active_key.total_credits) * 100

            # 获取套餐信息
            plan_type = package.package_code if package else "unknown"

            return {
                "has_active_plan": True,
                "plan_type": plan_type,
                "credits_remaining": active_key.remaining_credits or 0,
                "total_credits": active_key.total_credits or 0,
                "credits_used": (active_key.total_credits or 0) - (active_key.remaining_credits or 0),
                "usage_percentage": round(usage_percentage, 2),
                "expire_date": active_key.expire_date.isoformat() if active_key.expire_date else None,  # 转为ISO字符串
                "days_remaining": max(0, days_remaining)
            }

        except Exception as e:
            logger.error(f"获取套餐使用统计失败: {str(e)}")
            return {
                "has_active_plan": False,
                "plan_type": None,
                "credits_remaining": 0,
                "total_credits": 0,
                "expire_date": None,
                "days_remaining": 0,
                "usage_percentage": 0
            }

    def update_real_api_key(self, api_key_id: int, new_real_api_key: str) -> Dict[str, Any]:
        """更新API密钥的real_api_key字段"""
        try:
            # 查找API密钥
            api_key = self.db.query(APIKey).filter(APIKey.id == api_key_id).first()
            if not api_key:
                return {"success": False, "message": "API密钥不存在"}

            # 更新real_api_key字段
            api_key.real_api_key = new_real_api_key
            self.db.commit()

            logger.info(f"更新real_api_key成功: API密钥ID {api_key_id}")
            return {"success": True, "message": "更新成功"}

        except Exception as e:
            self.db.rollback()
            logger.error(f"更新real_api_key失败: {str(e)}")
            return {"success": False, "message": f"更新失败: {str(e)}"}

    def reset_credits(self, api_key_id: int) -> Dict[str, Any]:
        """重置API密钥的积分"""
        try:
            # 获取API密钥记录
            api_key = self.db.query(APIKey).filter(APIKey.id == api_key_id).first()
            if not api_key:
                return {"success": False, "message": "API密钥不存在"}

            # 检查是否有总积分设置
            if api_key.total_credits is None or api_key.total_credits <= 0:
                return {"success": False, "message": "该密钥没有设置总积分"}

            # 检查今天是否已经重置过
            now = datetime.now()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

            if api_key.last_reset_credits_at:
                last_reset = api_key.last_reset_credits_at
                if last_reset >= today_start:
                    return {"success": False, "message": "今日已经重置过积分，每天只能重置一次"}

            # 执行重置
            old_remaining = api_key.remaining_credits or 0
            api_key.remaining_credits = api_key.total_credits
            api_key.last_reset_credits_at = now

            self.db.commit()

            logger.info(f"API密钥 {api_key_id} 积分重置: {old_remaining} -> {api_key.total_credits}")
            return {
                "success": True,
                "message": "积分重置成功",
                "old_credits": old_remaining,
                "new_credits": api_key.total_credits
            }

        except Exception as e:
            self.db.rollback()
            logger.error(f"重置积分失败: {str(e)}")
            return {"success": False, "message": f"重置失败: {str(e)}"}