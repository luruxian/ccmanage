#!/usr/bin/env python3
"""
数据迁移脚本：将user_plans表的重要数据迁移到api_keys表，然后删除user_plans表

执行前的数据分析：
- user_plans表包含用户的套餐购买记录
- api_keys表已有用户密钥，但缺少激活时间和过期时间等信息
- 需要将user_plans中的时间信息迁移到对应的api_keys记录中

执行方式：
cd backend && python migrate_user_plans_to_api_keys.py
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
from dotenv import load_dotenv
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """执行数据迁移"""
    load_dotenv()

    logger.info("开始执行数据迁移：user_plans -> api_keys")

    try:
        # 创建数据库连接
        engine = create_engine(settings.DATABASE_URL)

        with engine.connect() as conn:
            # 开始事务
            trans = conn.begin()

            try:
                # 1. 获取user_plans中的所有数据
                logger.info("获取user_plans表数据...")
                user_plans_result = conn.execute(text("""
                    SELECT user_id, plan_type, credits, total_credits,
                           start_date, expire_date, is_active, auto_renew
                    FROM user_plans
                """))

                user_plans = list(user_plans_result)
                logger.info(f"找到 {len(user_plans)} 条user_plans记录")

                # 2. 为每个user_plan更新对应的api_keys记录
                migrated_count = 0
                for plan in user_plans:
                    user_id, plan_type, credits, total_credits, start_date, expire_date, is_active, auto_renew = plan

                    logger.info(f"处理用户 {user_id} 的套餐数据...")

                    # 查找该用户的api_keys记录
                    api_keys_result = conn.execute(text("""
                        SELECT id FROM api_keys
                        WHERE user_id = :user_id
                        ORDER BY created_at DESC
                        LIMIT 1
                    """), {'user_id': user_id})

                    api_key_record = api_keys_result.fetchone()

                    if api_key_record:
                        api_key_id = api_key_record[0]

                        # 更新api_keys记录，补充缺失的时间信息
                        update_result = conn.execute(text("""
                            UPDATE api_keys SET
                                activation_date = :start_date,
                                expire_date = :expire_date,
                                remaining_credits = :credits,
                                total_credits = :total_credits,
                                status = CASE
                                    WHEN :is_active = 1 AND :expire_date > NOW() THEN 'active'
                                    WHEN :expire_date <= NOW() THEN 'expired'
                                    ELSE 'inactive'
                                END,
                                notes = CONCAT(COALESCE(notes, ''),
                                    ' | 迁移自user_plans: plan_type=', :plan_type,
                                    ', auto_renew=', :auto_renew)
                            WHERE id = :api_key_id
                        """), {
                            'start_date': start_date,
                            'expire_date': expire_date,
                            'credits': credits,
                            'total_credits': total_credits,
                            'is_active': is_active,
                            'plan_type': plan_type,
                            'auto_renew': auto_renew,
                            'api_key_id': api_key_id
                        })

                        if update_result.rowcount > 0:
                            migrated_count += 1
                            logger.info(f"✅ 成功迁移用户 {user_id} 的数据到api_keys表")
                        else:
                            logger.warning(f"❌ 未能更新用户 {user_id} 的api_keys记录")
                    else:
                        logger.warning(f"⚠️ 用户 {user_id} 在api_keys表中没有记录，跳过迁移")

                logger.info(f"数据迁移完成，成功迁移 {migrated_count} 条记录")

                # 3. 验证迁移结果
                logger.info("验证迁移结果...")
                verification_result = conn.execute(text("""
                    SELECT COUNT(*) as count
                    FROM api_keys
                    WHERE activation_date IS NOT NULL
                    AND expire_date IS NOT NULL
                    AND user_id IS NOT NULL
                """))

                migrated_api_keys = verification_result.fetchone()[0]
                logger.info(f"验证结果：api_keys表中有 {migrated_api_keys} 条记录包含完整的时间信息")

                # 4. 删除user_plans表
                logger.info("删除user_plans表...")
                conn.execute(text("DROP TABLE user_plans"))
                logger.info("✅ user_plans表已删除")

                # 提交事务
                trans.commit()
                logger.info("✅ 数据迁移和表删除成功完成")

            except Exception as e:
                # 回滚事务
                trans.rollback()
                logger.error(f"❌ 数据迁移失败，已回滚: {str(e)}")
                raise

    except Exception as e:
        logger.error(f"❌ 连接数据库失败: {str(e)}")
        raise

if __name__ == "__main__":
    main()