#!/usr/bin/env python3
"""
创建初始管理员账户脚本
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from app.db.database import engine
from app.db.crud.admin import AdminCRUD
from app.db.models import UserRole

def create_initial_admin():
    """创建初始管理员账户"""

    # 创建数据库会话
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    try:
        admin_crud = AdminCRUD(session)

        # 检查是否已存在管理员
        existing_admin = admin_crud.get_admin_by_username("admin")
        if existing_admin:
            print("管理员账户已存在！")
            print(f"用户名: {existing_admin.username}")
            print(f"显示名: {existing_admin.display_name}")
            print(f"角色: {existing_admin.role.value}")
            print(f"状态: {'激活' if existing_admin.is_active else '禁用'}")
            return

        # 创建初始管理员
        admin = admin_crud.create_admin(
            username="admin",
            password="admin123456",
            display_name="系统管理员",
            role=UserRole.SUPER_ADMIN
        )

        print("初始管理员账户创建成功！")
        print(f"用户名: {admin.username}")
        print(f"密码: admin123456")
        print(f"显示名: {admin.display_name}")
        print(f"角色: {admin.role.value}")
        print(f"ID: {admin.id}")

        # 记录操作
        admin_crud.create_operation_record(
            admin_id=admin.id,
            operation_type="admin_created",
            operation_description="创建初始管理员账户",
            target_resource="admin",
            target_id=str(admin.id)
        )

        print("\n管理员登录地址: http://localhost:5173/meme")

    except Exception as e:
        print(f"创建管理员失败: {str(e)}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    create_initial_admin()