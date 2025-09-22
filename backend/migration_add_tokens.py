#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库迁移脚本 - 为usage_records表添加token字段

运行方式：
python migration_add_tokens.py
"""

import os
import sys
from sqlalchemy import create_engine, text
import logging

# 添加app目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.core.config import settings

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def get_database_url():
    """获取数据库连接URL"""
    return f"mysql+pymysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}?charset=utf8mb4"


def run_migration():
    """执行数据库迁移"""
    try:
        # 创建数据库连接
        engine = create_engine(get_database_url())

        with engine.connect() as conn:
            logger.info("Starting database migration: adding token fields to usage_records table")

            # 检查字段是否已存在 - 使用简化的查询方式
            check_sql = f"""
            SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = '{settings.MYSQL_DATABASE}'
            AND TABLE_NAME = 'usage_records'
            AND COLUMN_NAME = 'input_tokens'
            """

            result = conn.execute(text(check_sql))
            if result.fetchone()[0] > 0:
                logger.info("Token fields already exist, skipping migration")
                return True

            # 添加新字段的SQL语句
            migration_sqls = [
                "ALTER TABLE usage_records ADD COLUMN input_tokens INT NULL COMMENT '输入token数量'",
                "ALTER TABLE usage_records ADD COLUMN output_tokens INT NULL COMMENT '输出token数量'",
                "ALTER TABLE usage_records ADD COLUMN total_tokens INT NULL COMMENT '总token数量'"
            ]

            # 执行迁移
            for sql in migration_sqls:
                logger.info(f"Executing SQL: {sql}")
                conn.execute(text(sql))

            # 创建索引以优化查询性能
            index_sqls = [
                "CREATE INDEX idx_usage_tokens ON usage_records(user_id, total_tokens, request_timestamp)",
                "CREATE INDEX idx_usage_service_tokens ON usage_records(service, total_tokens)"
            ]

            for sql in index_sqls:
                try:
                    logger.info(f"Creating index: {sql}")
                    conn.execute(text(sql))
                except Exception as e:
                    # 索引可能已存在，忽略错误
                    logger.warning(f"Index creation failed (may already exist): {e}")

            # 提交事务
            conn.commit()
            logger.info("Database migration completed successfully!")
            return True

    except Exception as e:
        logger.error(f"Database migration failed: {str(e)}")
        return False


if __name__ == "__main__":
    success = run_migration()
    if success:
        print("Database migration completed successfully")
        sys.exit(0)
    else:
        print("Database migration failed")
        sys.exit(1)