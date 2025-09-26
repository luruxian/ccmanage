#!/usr/bin/env python3
"""
更新usage_records表中现有记录的credits_used值
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.db.database import get_db
from app.db.models import UsageRecord
from calculate_credits_used import calculate_credits_used
from sqlalchemy.orm import Session


def update_existing_credits_used():
    """更新现有记录的credits_used值"""
    db = next(get_db())

    try:
        # 查询所有usage_records记录
        records = db.query(UsageRecord).all()
        print(f"找到 {len(records)} 条使用记录")

        updated_count = 0
        for record in records:
            if record.total_tokens is not None:
                # 计算新的credits_used值
                new_credits_used = calculate_credits_used(record.total_tokens)

                # 如果值有变化，则更新
                if record.credits_used != new_credits_used:
                    old_value = record.credits_used
                    record.credits_used = new_credits_used
                    updated_count += 1
                    print(f"记录ID {record.id}: tokens={record.total_tokens}, "
                          f"旧credits_used={old_value} -> 新credits_used={new_credits_used}")

        # 提交更改
        db.commit()
        print(f"\n成功更新了 {updated_count} 条记录")

    except Exception as e:
        db.rollback()
        print(f"更新失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("开始更新credits_used值...")
    update_existing_credits_used()
    print("更新完成！")