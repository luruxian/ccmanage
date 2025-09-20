from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from ..models import AdminOperation, User
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)


class AdminOperationCRUD:
    """管理员操作记录CRUD"""

    def __init__(self, db: Session):
        self.db = db

    def create_operation_record(self, admin_user_id: str, operation_type: str,
                              target_resource: Optional[str] = None,
                              target_id: Optional[str] = None,
                              operation_description: Optional[str] = None,
                              operation_data: Optional[Dict[str, Any]] = None,
                              ip_address: Optional[str] = None) -> Optional[AdminOperation]:
        """创建管理员操作记录"""
        try:
            operation_record = AdminOperation(
                admin_user_id=admin_user_id,
                operation_type=operation_type,
                target_resource=target_resource,
                target_id=target_id,
                operation_description=operation_description,
                operation_data=json.dumps(operation_data) if operation_data else None,
                ip_address=ip_address
            )

            self.db.add(operation_record)
            self.db.commit()
            self.db.refresh(operation_record)

            logger.info(f"管理员操作记录创建成功: {admin_user_id}, 操作: {operation_type}")
            return operation_record

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建管理员操作记录失败: {str(e)}")
            return None

    def get_admin_operations(self, admin_user_id: Optional[str] = None,
                           operation_type: Optional[str] = None,
                           target_resource: Optional[str] = None,
                           start_date: Optional[datetime] = None,
                           end_date: Optional[datetime] = None,
                           limit: int = 100) -> List[Dict[str, Any]]:
        """获取管理员操作记录"""
        try:
            query = self.db.query(AdminOperation, User).join(
                User, AdminOperation.admin_user_id == User.user_id
            )

            if admin_user_id:
                query = query.filter(AdminOperation.admin_user_id == admin_user_id)
            if operation_type:
                query = query.filter(AdminOperation.operation_type == operation_type)
            if target_resource:
                query = query.filter(AdminOperation.target_resource == target_resource)
            if start_date:
                query = query.filter(AdminOperation.created_at >= start_date)
            if end_date:
                query = query.filter(AdminOperation.created_at <= end_date)

            results = query.order_by(desc(AdminOperation.created_at)).limit(limit).all()

            operations = []
            for operation, admin_user in results:
                operation_data = None
                if operation.operation_data:
                    try:
                        operation_data = json.loads(operation.operation_data)
                    except json.JSONDecodeError:
                        operation_data = operation.operation_data

                operations.append({
                    "id": operation.id,
                    "admin_user_id": operation.admin_user_id,
                    "admin_email": admin_user.email,
                    "admin_role": "admin",  # 旧管理员操作记录统一为admin角色
                    "operation_type": operation.operation_type,
                    "target_resource": operation.target_resource,
                    "target_id": operation.target_id,
                    "operation_description": operation.operation_description,
                    "operation_data": operation_data,
                    "ip_address": operation.ip_address,
                    "created_at": operation.created_at
                })

            return operations

        except Exception as e:
            logger.error(f"获取管理员操作记录失败: {str(e)}")
            return []

    def get_operation_statistics(self, days: int = 30) -> Dict[str, Any]:
        """获取操作统计"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            # 总操作数
            total_operations = self.db.query(AdminOperation).filter(
                AdminOperation.created_at >= start_date
            ).count()

            # 按操作类型统计
            operation_types = self.db.query(
                AdminOperation.operation_type,
                func.count(AdminOperation.id).label('count')
            ).filter(
                AdminOperation.created_at >= start_date
            ).group_by(AdminOperation.operation_type).all()

            # 按目标资源统计
            target_resources = self.db.query(
                AdminOperation.target_resource,
                func.count(AdminOperation.id).label('count')
            ).filter(
                and_(
                    AdminOperation.created_at >= start_date,
                    AdminOperation.target_resource.isnot(None)
                )
            ).group_by(AdminOperation.target_resource).all()

            # 活跃管理员
            active_admins = self.db.query(
                AdminOperation.admin_user_id,
                func.count(AdminOperation.id).label('count')
            ).filter(
                AdminOperation.created_at >= start_date
            ).group_by(AdminOperation.admin_user_id).all()

            # 每日操作统计
            daily_stats = self._get_daily_operation_stats(days)

            return {
                "total_operations": total_operations,
                "operation_types": [{"type": ot[0], "count": ot[1]} for ot in operation_types],
                "target_resources": [{"resource": tr[0], "count": tr[1]} for tr in target_resources],
                "active_admins": len(active_admins),
                "daily_stats": daily_stats
            }

        except Exception as e:
            logger.error(f"获取操作统计失败: {str(e)}")
            return {
                "total_operations": 0,
                "operation_types": [],
                "target_resources": [],
                "active_admins": 0,
                "daily_stats": []
            }

    def get_user_operations(self, target_user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """获取针对特定用户的管理员操作"""
        try:
            return self.get_admin_operations(
                target_resource="user",
                limit=limit
            )
        except Exception as e:
            logger.error(f"获取用户操作记录失败: {str(e)}")
            return []

    def clean_old_records(self, days: int = 365) -> int:
        """清理旧的操作记录"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            deleted_count = self.db.query(AdminOperation).filter(
                AdminOperation.created_at < cutoff_date
            ).delete()

            self.db.commit()
            logger.info(f"清理了 {deleted_count} 条旧操作记录")
            return deleted_count

        except Exception as e:
            self.db.rollback()
            logger.error(f"清理旧操作记录失败: {str(e)}")
            return 0

    def _get_daily_operation_stats(self, days: int) -> List[Dict[str, Any]]:
        """获取每日操作统计"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            # 按日期统计操作数量
            daily_operations = self.db.query(
                func.date(AdminOperation.created_at).label('operation_date'),
                func.count(AdminOperation.id).label('operation_count'),
                func.count(func.distinct(AdminOperation.admin_user_id)).label('unique_admins')
            ).filter(
                AdminOperation.created_at >= start_date
            ).group_by(
                func.date(AdminOperation.created_at)
            ).order_by('operation_date').all()

            daily_stats = []
            for stat in daily_operations:
                daily_stats.append({
                    "date": str(stat.operation_date),
                    "operation_count": stat.operation_count,
                    "unique_admins": stat.unique_admins
                })

            return daily_stats

        except Exception as e:
            logger.error(f"获取每日操作统计失败: {str(e)}")
            return []

    # 预定义操作类型常量
    class OperationType:
        USER_CREATE = "user_create"
        USER_UPDATE = "user_update"
        USER_DELETE = "user_delete"
        USER_ACTIVATE = "user_activate"
        USER_DEACTIVATE = "user_deactivate"
        USER_BAN = "user_ban"
        USER_UNBAN = "user_unban"

        KEY_CREATE = "key_create"
        KEY_UPDATE = "key_update"
        KEY_DELETE = "key_delete"
        KEY_ACTIVATE = "key_activate"
        KEY_DEACTIVATE = "key_deactivate"

        PACKAGE_CREATE = "package_create"
        PACKAGE_UPDATE = "package_update"
        PACKAGE_DELETE = "package_delete"

        PLAN_CREATE = "plan_create"
        PLAN_UPDATE = "plan_update"
        PLAN_DELETE = "plan_delete"

        SYSTEM_CONFIG = "system_config"
        LOGIN_AS_USER = "login_as_user"
        BULK_OPERATION = "bulk_operation"