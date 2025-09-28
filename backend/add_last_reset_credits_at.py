#!/usr/bin/env python3
"""
添加 last_reset_credits_at 字段到 api_keys 表
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.db.database import get_db
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def add_last_reset_credits_at_column():
    """添加 last_reset_credits_at 字段"""
    db = next(get_db())

    try:
        # 检查字段是否已存在
        check_query = text("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'api_keys'
            AND COLUMN_NAME = 'last_reset_credits_at'
        """)

        result = db.execute(check_query)
        column_exists = result.fetchone() is not None

        if column_exists:
            logger.info("字段 last_reset_credits_at 已存在，跳过添加")
            return

        # 添加字段
        alter_query = text("""
            ALTER TABLE api_keys
            ADD COLUMN last_reset_credits_at DATETIME DEFAULT NULL COMMENT '最后重置积分时间'
        """)

        db.execute(alter_query)
        db.commit()

        logger.info("成功添加 last_reset_credits_at 字段到 api_keys 表")

    except Exception as e:
        db.rollback()
        logger.error(f"添加字段失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("开始添加 last_reset_credits_at 字段...")
    add_last_reset_credits_at_column()
    print("字段添加完成！")