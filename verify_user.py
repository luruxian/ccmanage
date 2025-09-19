#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.db.database import SessionLocal
from backend.app.db.crud.user import UserCRUD
from backend.app.core.auth_service import auth_service

def verify_user_email(email: str, new_password: str = "123456"):
    """手动验证用户邮箱并重置密码"""
    db = SessionLocal()
    try:
        user_crud = UserCRUD(db)
        user = user_crud.get_user_by_email(email.lower().strip())

        if not user:
            print(f"用户不存在: {email}")
            return False

        # 生成新密码哈希
        password_hash = auth_service.get_password_hash(new_password)

        # 更新用户状态为已验证并重置密码
        user_crud.update_user_info(user.user_id, {
            "is_active": True,
            "is_email_verified": True,
            "password_hash": password_hash
        })

        print(f"用户 {email} 已验证成功")
        print(f"用户ID: {user.user_id}")
        print(f"新密码: {new_password}")
        print(f"状态: active=True, verified=True")
        return True

    except Exception as e:
        print(f"验证失败: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    email = "59230858@qq.com"
    verify_user_email(email)