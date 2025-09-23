#!/usr/bin/env python3
"""
测试重构后的应用
"""

import sys
import os

# 添加app目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """测试所有模块导入"""
    print("开始测试模块导入...")

    try:
        from app.core.config import settings
        print("[OK] 配置模块导入成功")

        from app.core.logging import setup_logging, logger
        print("[OK] 日志模块导入成功")

        from app.db.models import User, APIKey, UserPlan
        print("[OK] 数据库模型导入成功")

        from app.schemas.api_key import APIKeyValidationRequest
        from app.schemas.user import UserCreate
        from app.schemas.common import ErrorCodes
        print("[OK] Schema模型导入成功")

        from app.db.crud.user import UserCRUD
        from app.db.crud.api_key import APIKeyCRUD
        print("[OK] CRUD模块导入成功")

        from app.api.routes import example, api_key_validation
        print("[OK] API路由导入成功")

        return True

    except Exception as e:
        print(f"[FAIL] 导入失败: {str(e)}")
        return False

def test_app_creation():
    """测试FastAPI应用创建"""
    print("\n开始测试FastAPI应用创建...")

    try:
        from app.main import app
        print(f"[OK] FastAPI应用创建成功: {app.title}")
        print(f"[OK] 应用版本: {app.version}")
        return True

    except Exception as e:
        print(f"[FAIL] FastAPI应用创建失败: {str(e)}")
        return False

def test_config():
    """测试配置"""
    print("\n开始测试配置...")

    try:
        from app.core.config import settings
        print(f"[OK] 项目名称: {settings.PROJECT_NAME}")
        print(f"[OK] 服务器地址: {settings.SERVER_HOST}:{settings.SERVER_PORT}")
        print(f"[OK] 调试模式: {settings.DEBUG}")
        return True

    except Exception as e:
        print(f"[FAIL] 配置测试失败: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("agnets.app 后端重构测试")
    print("=" * 50)

    tests = [
        ("模块导入", test_imports),
        ("应用创建", test_app_creation),
        ("配置测试", test_config),
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1

    print("\n" + "=" * 50)
    print(f"测试结果: {passed}/{total} 通过")

    if passed == total:
        print("[SUCCESS] 所有测试通过，重构成功！")
    else:
        print("[ERROR] 部分测试失败，需要修复")
        sys.exit(1)