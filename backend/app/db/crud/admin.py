from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from ..models import Admin, UserRole
from ...core.auth_service import auth_service


class AdminCRUD:
    """管理员CRUD操作类"""

    def __init__(self, db: Session):
        self.db = db

    def get_admin_by_username(self, username: str) -> Optional[Admin]:
        """根据用户名获取管理员（排除已删除的）"""
        return self.db.query(Admin).filter(
            and_(
                Admin.username == username,
                Admin.is_deleted == False
            )
        ).first()

    def get_admin_by_id(self, admin_id: int) -> Optional[Admin]:
        """根据ID获取管理员（排除已删除的）"""
        return self.db.query(Admin).filter(
            and_(
                Admin.id == admin_id,
                Admin.is_deleted == False
            )
        ).first()

    def create_admin(
        self,
        username: str,
        password: str,
        display_name: str = None,
        role: UserRole = UserRole.ADMIN
    ) -> Admin:
        """创建管理员"""
        # 检查用户名是否已存在
        existing_admin = self.db.query(Admin).filter(
            Admin.username == username
        ).first()

        if existing_admin:
            if existing_admin.is_deleted:
                # 如果是被删除的账户，恢复并更新
                existing_admin.is_deleted = False
                existing_admin.password_hash = auth_service.get_password_hash(password)
                existing_admin.display_name = display_name
                existing_admin.role = role
                existing_admin.is_active = True
                existing_admin.updated_at = datetime.now()
                self.db.commit()
                self.db.refresh(existing_admin)
                return existing_admin
            else:
                raise ValueError(f"用户名 {username} 已存在")

        # 创建新管理员
        admin = Admin(
            username=username,
            password_hash=auth_service.get_password_hash(password),
            display_name=display_name,
            role=role,
            is_active=True
        )

        self.db.add(admin)
        self.db.commit()
        self.db.refresh(admin)
        return admin

    def update_admin(
        self,
        admin_id: int,
        username: str = None,
        password: str = None,
        display_name: str = None,
        role: UserRole = None,
        is_active: bool = None
    ) -> Optional[Admin]:
        """更新管理员信息"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return None

        if username is not None:
            # 检查新用户名是否已被其他管理员使用
            existing = self.db.query(Admin).filter(
                and_(
                    Admin.username == username,
                    Admin.id != admin_id,
                    Admin.is_deleted == False
                )
            ).first()
            if existing:
                raise ValueError(f"用户名 {username} 已被使用")
            admin.username = username

        if password is not None:
            admin.password_hash = auth_service.get_password_hash(password)

        if display_name is not None:
            admin.display_name = display_name

        if role is not None:
            admin.role = role

        if is_active is not None:
            admin.is_active = is_active

        admin.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(admin)
        return admin

    def delete_admin(self, admin_id: int) -> bool:
        """逻辑删除管理员"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return False

        admin.is_deleted = True
        admin.is_active = False
        admin.updated_at = datetime.now()
        self.db.commit()
        return True

    def get_all_admins(
        self,
        include_deleted: bool = False,
        page: int = 1,
        page_size: int = 20
    ) -> List[Admin]:
        """获取所有管理员列表"""
        query = self.db.query(Admin)

        if not include_deleted:
            query = query.filter(Admin.is_deleted == False)

        # 分页
        offset = (page - 1) * page_size
        return query.offset(offset).limit(page_size).all()

    def count_admins(self, include_deleted: bool = False) -> int:
        """统计管理员数量"""
        query = self.db.query(Admin)

        if not include_deleted:
            query = query.filter(Admin.is_deleted == False)

        return query.count()

    def get_admin_statistics(self) -> Dict[str, Any]:
        """获取管理员统计信息"""
        try:
            total_admins = self.db.query(Admin).filter(Admin.is_deleted == False).count()
            active_admins = self.db.query(Admin).filter(
                Admin.is_deleted == False, Admin.is_active == True
            ).count()
            inactive_admins = total_admins - active_admins

            return {
                "total_admins": total_admins,
                "active_admins": active_admins,
                "inactive_admins": inactive_admins
            }
        except Exception as e:
            logger.error(f"获取管理员统计失败: {str(e)}")
            return {
                "total_admins": 0,
                "active_admins": 0,
                "inactive_admins": 0
            }

    def verify_password(self, admin: Admin, password: str) -> bool:
        """验证管理员密码"""
        return auth_service.verify_password(password, admin.password_hash)

    def update_last_login(self, admin_id: int) -> bool:
        """更新最后登录时间"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return False

        admin.last_login_at = datetime.now()
        self.db.commit()
        return True

    def search_admins(
        self,
        keyword: str,
        role: UserRole = None,
        is_active: bool = None,
        include_deleted: bool = False,
        page: int = 1,
        page_size: int = 20
    ) -> List[Admin]:
        """搜索管理员"""
        query = self.db.query(Admin)

        # 基本过滤条件
        if not include_deleted:
            query = query.filter(Admin.is_deleted == False)

        # 关键字搜索
        if keyword:
            search_filter = or_(
                Admin.username.contains(keyword),
                Admin.display_name.contains(keyword)
            )
            query = query.filter(search_filter)

        # 角色过滤
        if role:
            query = query.filter(Admin.role == role)

        # 状态过滤
        if is_active is not None:
            query = query.filter(Admin.is_active == is_active)

        # 分页
        offset = (page - 1) * page_size
        return query.offset(offset).limit(page_size).all()


    def get_admin_statistics(self) -> Dict[str, Any]:
        """获取管理员统计信息"""
        total_admins = self.count_admins(include_deleted=False)
        active_admins = self.db.query(Admin).filter(
            and_(
                Admin.is_deleted == False,
                Admin.is_active == True
            )
        ).count()

        super_admins = self.db.query(Admin).filter(
            and_(
                Admin.is_deleted == False,
                Admin.role == UserRole.SUPER_ADMIN
            )
        ).count()

        regular_admins = self.db.query(Admin).filter(
            and_(
                Admin.is_deleted == False,
                Admin.role == UserRole.ADMIN
            )
        ).count()

        return {
            "total_admins": total_admins,
            "active_admins": active_admins,
            "super_admins": super_admins,
            "regular_admins": regular_admins
        }