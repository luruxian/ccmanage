#!/usr/bin/env python3
"""
测试重置积分功能
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.db.database import get_db
from app.db.crud.api_key import APIKeyCRUD
from app.db.models import APIKey
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_reset_credits():
    """测试重置积分功能"""
    db = next(get_db())
    api_key_crud = APIKeyCRUD(db)

    try:
        # 查找一个API密钥进行测试
        api_key = db.query(APIKey).filter(
            APIKey.total_credits.isnot(None),
            APIKey.total_credits > 0
        ).first()

        if not api_key:
            print("没有找到设置了总积分的API密钥")
            return

        print(f"找到API密钥ID: {api_key.id}")
        print(f"总积分: {api_key.total_credits}")
        print(f"当前剩余积分: {api_key.remaining_credits}")
        print(f"最后重置时间: {api_key.last_reset_credits_at}")

        # 先修改剩余积分来模拟消耗
        if api_key.remaining_credits == api_key.total_credits:
            api_key.remaining_credits = max(0, api_key.total_credits - 100)
            db.commit()
            print(f"模拟消耗后剩余积分: {api_key.remaining_credits}")

        # 测试重置积分
        result = api_key_crud.reset_credits(api_key.id)

        print(f"重置结果: {result}")

        if result["success"]:
            # 重新查询验证结果
            db.refresh(api_key)
            print(f"重置后剩余积分: {api_key.remaining_credits}")
            print(f"重置时间: {api_key.last_reset_credits_at}")

            # 测试每日限制
            print("\n测试每日重置限制...")
            result2 = api_key_crud.reset_credits(api_key.id)
            print(f"第二次重置结果: {result2}")

    except Exception as e:
        print(f"测试失败: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("开始测试重置积分功能...")
    test_reset_credits()
    print("测试完成！")