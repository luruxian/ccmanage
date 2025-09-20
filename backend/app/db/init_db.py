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

from .database import engine, SessionLocal, create_tables, check_db_connection
from .models import User, APIKey, UsageRecord
from .crud.user import UserCRUD
from .crud.api_key import APIKeyCRUD
from .crud.user_plan import UserPlanCRUD

# 配置日志
logger = logging.getLogger(__name__)


def create_test_data():
    """创建测试数据"""
    db = SessionLocal()

    try:
        user_crud = UserCRUD(db)
        api_key_crud = APIKeyCRUD(db)
        user_plan_crud = UserPlanCRUD(db)

        logger.info("开始创建测试数据...")

        # 创建测试用户
        test_user_data = {
            "user_id": "test_user_001",
            "username": "testuser",
            "email": "test@example.com",
            "phone": "13800138000",
            "is_active": True,
            "is_banned": False
        }

        existing_user = user_crud.get_user_by_id("test_user_001")
        if not existing_user:
            test_user = user_crud.create_user(test_user_data)
            logger.info(f"创建测试用户: {test_user.username}")
        else:
            test_user = existing_user
            logger.info(f"测试用户已存在: {test_user.username}")

        # 创建测试API密钥
        api_key_data = {
            "user_id": test_user.user_id,
            "api_key": "sk-test123456789",
            "real_api_key": "sk-real123456789",
            "key_name": "测试密钥",
            "description": "用于测试的API密钥",
            "is_active": True
        }

        existing_api_key = api_key_crud.get_api_key_by_key("sk-test123456789")
        if not existing_api_key:
            test_api_key = api_key_crud.create_api_key(api_key_data)
            logger.info(f"创建测试API密钥: {test_api_key.api_key}")
        else:
            logger.info(f"测试API密钥已存在: {existing_api_key.api_key}")

        # 创建测试用户套餐
        plan_data = {
            "user_id": test_user.user_id,
            "plan_type": "basic",
            "credits": 1000,
            "total_credits": 1000,
            "start_date": datetime.now(),
            "expire_date": datetime.now() + timedelta(days=30),
            "is_active": True,
            "auto_renew": False
        }

        existing_plan = user_plan_crud.get_active_plan(test_user.user_id)
        if not existing_plan:
            test_plan = user_plan_crud.create_user_plan(plan_data)
            logger.info(f"创建测试套餐: {test_plan.plan_type}")
        else:
            logger.info(f"测试套餐已存在: {existing_plan.plan_type}")

        db.commit()
        logger.info("测试数据创建完成")

    except SQLAlchemyError as e:
        logger.error(f"创建测试数据失败: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def init_database():
    """初始化数据库"""
    try:
        logger.info("开始初始化数据库...")

        # 检查数据库连接
        if not check_db_connection():
            logger.error("数据库连接失败")
            return False

        # 创建表
        create_tables()
        logger.info("数据库表创建完成")

        # 创建测试数据
        create_test_data()

        logger.info("数据库初始化完成")
        return True

    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        return False


if __name__ == "__main__":
    init_database()