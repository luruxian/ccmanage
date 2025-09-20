#!/usr/bin/env python3
"""
数据库迁移脚本：修改api_keys表的user_id字段为nullable
解决批量生成用户密钥时的数据库约束冲突问题

执行方式：
cd backend && python migration_fix_user_id_nullable.py
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
from dotenv import load_dotenv
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """执行数据库迁移"""
    load_dotenv()

    logger.info("开始执行数据库迁移：修改api_keys.user_id字段为nullable")

    try:
        # 创建数据库连接
        engine = create_engine(settings.DATABASE_URL)

        with engine.connect() as conn:
            # 开始事务
            trans = conn.begin()

            try:
                # 首先检查当前表结构
                logger.info("检查当前表结构...")
                result = conn.execute(text("DESCRIBE api_keys"))
                for row in result:
                    if row[0] == 'user_id':
                        logger.info(f"当前user_id字段: Type={row[1]}, Null={row[2]}")
                        if row[2] == 'YES':
                            logger.info("user_id字段已经是nullable，无需修改")
                            return

                # 修改user_id字段为nullable
                logger.info("修改user_id字段为nullable...")
                alter_sql = """
                ALTER TABLE api_keys
                MODIFY COLUMN user_id VARCHAR(50) NULL
                COMMENT '用户ID（激活前可为空）'
                """

                conn.execute(text(alter_sql))

                # 验证修改结果
                logger.info("验证修改结果...")
                result = conn.execute(text("DESCRIBE api_keys"))
                for row in result:
                    if row[0] == 'user_id':
                        logger.info(f"修改后user_id字段: Type={row[1]}, Null={row[2]}")
                        if row[2] == 'YES':
                            logger.info("✅ user_id字段成功修改为nullable")
                        else:
                            raise Exception("❌ user_id字段修改失败")

                # 提交事务
                trans.commit()
                logger.info("✅ 数据库迁移成功完成")

            except Exception as e:
                # 回滚事务
                trans.rollback()
                logger.error(f"❌ 数据库迁移失败，已回滚: {str(e)}")
                raise

    except Exception as e:
        logger.error(f"❌ 连接数据库失败: {str(e)}")
        raise

if __name__ == "__main__":
    main()