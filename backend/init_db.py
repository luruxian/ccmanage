#!/usr/bin/env python3
"""
数据库初始化脚本

用于创建数据库表结构并插入测试数据
"""

import os
import sys
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
import logging

# 设置路径以便导入模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, create_tables, check_db_connection
from database_models import User, APIKey, UserPlan, UsageRecord
from crud import UserCRUD, APIKeyCRUD, UserPlanCRUD

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_test_data():
    """创建测试数据"""
    db = SessionLocal()
    try:
        logger.info("开始创建测试数据...")

        # 创建测试用户
        test_users = [
            {
                "user_id": "user_001",
                "username": "testuser1",
                "email": "test1@example.com",
                "phone": "13800138001"
            },
            {
                "user_id": "user_002",
                "username": "testuser2",
                "email": "test2@example.com",
                "phone": "13800138002"
            },
            {
                "user_id": "user_003",
                "username": "testuser3",
                "email": "test3@example.com",
                "phone": "13800138003"
            }
        ]

        for user_data in test_users:
            # 检查用户是否已存在
            existing_user = UserCRUD.get_user_by_id(db, user_data["user_id"])
            if not existing_user:
                user = UserCRUD.create_user(
                    db,
                    user_id=user_data["user_id"],
                    username=user_data["username"],
                    email=user_data["email"],
                    phone=user_data["phone"]
                )
                logger.info(f"创建用户: {user.user_id}")
            else:
                logger.info(f"用户已存在: {user_data['user_id']}")

        # 创建API密钥
        test_api_keys = [
            {
                "user_id": "user_001",
                "api_key": "test_api_key_123",
                "real_api_key": "sk-deepseek-abc123def456",
                "key_name": "测试密钥1",
                "description": "用于测试的API密钥"
            },
            {
                "user_id": "user_002",
                "api_key": "expired_key_456",
                "real_api_key": "sk-deepseek-xyz789",
                "key_name": "过期密钥",
                "description": "已过期的测试密钥"
            },
            {
                "user_id": "user_003",
                "api_key": "banned_key_789",
                "real_api_key": "sk-deepseek-banned123",
                "key_name": "封禁密钥",
                "description": "被封禁用户的密钥"
            }
        ]

        for api_key_data in test_api_keys:
            # 检查API密钥是否已存在
            existing_key = APIKeyCRUD.get_api_key_info(db, api_key_data["api_key"])
            if not existing_key:
                api_key = APIKeyCRUD.create_api_key(
                    db,
                    user_id=api_key_data["user_id"],
                    api_key=api_key_data["api_key"],
                    real_api_key=api_key_data["real_api_key"],
                    key_name=api_key_data["key_name"],
                    description=api_key_data["description"]
                )
                logger.info(f"创建API密钥: {api_key.api_key}")
            else:
                logger.info(f"API密钥已存在: {api_key_data['api_key']}")

        # 创建用户套餐
        test_plans = [
            {
                "user_id": "user_001",
                "plan_type": "premium",
                "total_credits": 1000,
                "expire_date": datetime.now() + timedelta(days=365),  # 一年后过期
                "auto_renew": True
            },
            {
                "user_id": "user_002",
                "plan_type": "basic",
                "total_credits": 500,
                "expire_date": datetime.now() - timedelta(days=30),  # 已过期
                "auto_renew": False
            },
            {
                "user_id": "user_003",
                "plan_type": "enterprise",
                "total_credits": 2000,
                "expire_date": datetime.now() + timedelta(days=180),  # 半年后过期
                "auto_renew": False
            }
        ]

        for plan_data in test_plans:
            # 检查用户套餐是否已存在
            existing_plan = UserPlanCRUD.get_active_plan(db, plan_data["user_id"])
            if not existing_plan:
                plan = UserPlanCRUD.create_user_plan(
                    db,
                    user_id=plan_data["user_id"],
                    plan_type=plan_data["plan_type"],
                    total_credits=plan_data["total_credits"],
                    expire_date=plan_data["expire_date"],
                    auto_renew=plan_data["auto_renew"]
                )
                logger.info(f"创建用户套餐: {plan.user_id} - {plan.plan_type}")
            else:
                logger.info(f"用户套餐已存在: {plan_data['user_id']}")

        # 更新用户状态（封禁user_003）
        UserCRUD.update_user_status(db, "user_003", is_banned=True)
        logger.info("更新用户状态: user_003 被封禁")

        logger.info("测试数据创建完成!")

    except SQLAlchemyError as e:
        logger.error(f"创建测试数据时发生数据库错误: {str(e)}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"创建测试数据时发生未知错误: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def init_database():
    """初始化数据库"""
    logger.info("开始初始化数据库...")

    try:
        # 1. 检查数据库连接
        logger.info("检查数据库连接...")
        if not check_db_connection():
            logger.error("数据库连接失败，请检查配置")
            return False

        # 2. 创建表结构
        logger.info("创建数据库表结构...")
        create_tables()

        # 3. 创建测试数据
        logger.info("创建测试数据...")
        create_test_data()

        logger.info("数据库初始化完成!")
        return True

    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        return False


def reset_database():
    """重置数据库（删除所有表并重新创建）"""
    logger.warning("警告：即将重置数据库，所有数据将被删除！")

    try:
        from database import drop_tables

        # 删除所有表
        logger.info("删除所有数据库表...")
        drop_tables()

        # 重新初始化
        return init_database()

    except Exception as e:
        logger.error(f"重置数据库失败: {str(e)}")
        return False


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="数据库初始化工具")
    parser.add_argument("--reset", action="store_true", help="重置数据库（删除所有数据）")
    parser.add_argument("--test-data-only", action="store_true", help="仅创建测试数据")

    args = parser.parse_args()

    try:
        if args.reset:
            success = reset_database()
        elif args.test_data_only:
            success = True
            create_test_data()
        else:
            success = init_database()

        if success:
            logger.info("操作完成!")
            sys.exit(0)
        else:
            logger.error("操作失败!")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("操作被用户中断")
        sys.exit(1)
    except Exception as e:
        logger.error(f"发生未知错误: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()