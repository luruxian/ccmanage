#!/usr/bin/env python3
"""
数据库迁移脚本：向packages表添加endpoint字段
执行前请备份数据库！
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_add_endpoint():
    """向packages表添加endpoint字段"""

    # 创建数据库连接
    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.connect() as conn:
            # 开始事务
            trans = conn.begin()

            try:
                logger.info("开始添加endpoint字段迁移...")

                # 1. 检查endpoint列是否已存在
                check_column_sql = """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_name='packages' AND column_name='endpoint'
                AND table_schema = DATABASE();
                """
                result = conn.execute(text(check_column_sql))
                column_exists = result.scalar() > 0

                if column_exists:
                    logger.info("endpoint列已存在，跳过迁移")
                    return True

                # 2. 添加endpoint列
                logger.info("添加endpoint列到packages表...")
                add_column_sql = """
                ALTER TABLE packages
                ADD COLUMN endpoint VARCHAR(256) NULL
                COMMENT '订阅服务端点'
                AFTER description;
                """
                conn.execute(text(add_column_sql))

                # 3. 验证列是否添加成功
                logger.info("验证endpoint列是否添加成功...")
                verify_sql = """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_name='packages' AND column_name='endpoint'
                AND table_schema = DATABASE();
                """
                result = conn.execute(text(verify_sql))
                if result.scalar() == 0:
                    raise Exception("endpoint列添加失败")

                # 提交事务
                trans.commit()
                logger.info("endpoint字段迁移完成！")
                return True

            except Exception as e:
                # 回滚事务
                trans.rollback()
                logger.error(f"迁移失败，已回滚: {str(e)}")
                raise e

    except Exception as e:
        logger.error(f"数据库连接失败: {str(e)}")
        return False

def check_migration_status():
    """检查迁移状态"""
    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.connect() as conn:
            # 检查endpoint列是否存在
            check_sql = """
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_name='packages' AND column_name='endpoint'
            AND table_schema = DATABASE();
            """
            result = conn.execute(text(check_sql))
            column_exists = result.scalar() > 0

            if column_exists:
                logger.info("✅ endpoint列已成功添加")

                # 显示列的详细信息
                detail_sql = """
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
                       IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
                FROM information_schema.columns
                WHERE table_name='packages' AND column_name='endpoint'
                AND table_schema = DATABASE();
                """
                result = conn.execute(text(detail_sql))
                column_info = result.fetchone()
                if column_info:
                    logger.info(f"列详情: {column_info._asdict()}")

                return True
            else:
                logger.info("❌ endpoint列不存在")
                return False

    except Exception as e:
        logger.error(f"检查迁移状态失败: {str(e)}")
        return False

def show_packages_table_structure():
    """显示packages表结构"""
    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.connect() as conn:
            # 显示表结构
            describe_sql = "DESCRIBE packages;"
            result = conn.execute(text(describe_sql))
            columns = result.fetchall()

            logger.info("packages表当前结构:")
            for col in columns:
                logger.info(f"  {col}")

    except Exception as e:
        logger.error(f"获取表结构失败: {str(e)}")

if __name__ == "__main__":
    print("=== Database Migration: Add endpoint field to packages ===")
    print("WARNING: This operation will modify the packages table structure!")
    print("WARNING: Please ensure you have backed up your database!")

    # 显示当前表结构
    print("\n当前packages表结构:")
    show_packages_table_structure()

    # 检查是否有--force参数
    force_migrate = len(sys.argv) > 1 and sys.argv[1] == "--force"

    if not force_migrate:
        confirm = input("\nConfirm to continue migration? (type 'YES' to confirm): ")
        if confirm != "YES":
            print("Migration cancelled")
            sys.exit(0)

    print("\nStarting migration...")

    # 执行迁移
    if migrate_add_endpoint():
        print("\nChecking migration result...")
        if check_migration_status():
            print("\nMigration completed successfully!")
            print("\n迁移后packages表结构:")
            show_packages_table_structure()
        else:
            print("\nMigration verification failed")
            sys.exit(1)
    else:
        print("\nMigration failed")
        sys.exit(1)