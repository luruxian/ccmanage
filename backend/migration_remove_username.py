#!/usr/bin/env python3
"""
数据库迁移脚本：移除用户表中的username字段
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

def migrate_remove_username():
    """移除用户表中的username字段"""

    # 创建数据库连接
    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.connect() as conn:
            # 开始事务
            trans = conn.begin()

            try:
                logger.info("开始移除username字段迁移...")

                # 1. 检查username列是否存在
                check_column_sql = """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='username';
                """
                result = conn.execute(text(check_column_sql))
                column_exists = result.scalar() > 0

                if not column_exists:
                    logger.info("username列不存在，跳过迁移")
                    return True

                # 2. 删除username列的索引（如果存在）
                logger.info("删除username相关的索引...")
                try:
                    drop_index_sql = "DROP INDEX ix_users_username ON users;"
                    conn.execute(text(drop_index_sql))
                except Exception as e:
                    logger.info(f"索引 ix_users_username 不存在或已删除: {e}")

                # 3. 删除username列的唯一约束（如果存在）
                logger.info("删除username的唯一约束...")
                try:
                    drop_unique_sql = "ALTER TABLE users DROP INDEX users_username_key;"
                    conn.execute(text(drop_unique_sql))
                except Exception as e:
                    logger.info(f"唯一约束 users_username_key 不存在或已删除: {e}")

                # 4. 删除username列
                logger.info("删除username列...")
                drop_column_sql = "ALTER TABLE users DROP COLUMN username;"
                conn.execute(text(drop_column_sql))

                # 提交事务
                trans.commit()
                logger.info("username字段迁移完成！")
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
            # 检查username列是否存在
            check_sql = """
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_name='users' AND column_name='username';
            """
            result = conn.execute(text(check_sql))
            column_exists = result.scalar() > 0

            if column_exists:
                logger.info("❌ username列仍然存在")
                return False
            else:
                logger.info("✅ username列已成功移除")
                return True

    except Exception as e:
        logger.error(f"检查迁移状态失败: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Database Migration: Remove username field ===")
    print("WARNING: This operation will permanently delete username column and its data!")
    print("WARNING: Please ensure you have backed up your database!")

    # 检查是否有--force参数
    force_migrate = len(sys.argv) > 1 and sys.argv[1] == "--force"

    if not force_migrate:
        confirm = input("Confirm to continue migration? (type 'YES' to confirm): ")
        if confirm != "YES":
            print("Migration cancelled")
            sys.exit(0)

    print("\nStarting migration...")

    # 执行迁移
    if migrate_remove_username():
        print("\nChecking migration result...")
        if check_migration_status():
            print("\nMigration completed successfully!")
        else:
            print("\nMigration verification failed")
            sys.exit(1)
    else:
        print("\nMigration failed")
        sys.exit(1)