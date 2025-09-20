#!/usr/bin/env python3
"""
数据修复脚本：修复用户密钥显示问题

该脚本用于：
1. 检查现有api_keys表中的数据
2. 为缺失的UserKey记录创建关联
3. 修复数据不一致问题
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import engine
from app.db.models import APIKey, UserKey, Package
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_data_consistency():
    """检查数据一致性"""
    with Session(engine) as db:
        # 统计api_keys表中的记录
        total_api_keys = db.query(APIKey).count()
        api_keys_with_user = db.query(APIKey).filter(APIKey.user_id.isnot(None)).count()
        api_keys_without_user = total_api_keys - api_keys_with_user

        # 统计user_keys表中的记录
        total_user_keys = db.query(UserKey).count()

        print(f"=== 数据一致性检查 ===")
        print(f"API密钥总数: {total_api_keys}")
        print(f"已关联用户的API密钥: {api_keys_with_user}")
        print(f"未关联用户的API密钥: {api_keys_without_user}")
        print(f"UserKey记录总数: {total_user_keys}")

        # 查找没有UserKey记录的APIKey
        api_keys_without_user_key = db.query(APIKey).filter(
            ~APIKey.id.in_(db.query(UserKey.api_key_id))
        ).all()

        print(f"没有UserKey记录的API密钥: {len(api_keys_without_user_key)}")

        return api_keys_without_user_key


def create_missing_user_keys(api_keys_without_user_key):
    """为缺失的API密钥创建UserKey记录"""
    with Session(engine) as db:
        # 获取默认的package（如果存在）
        default_package = db.query(Package).filter(Package.is_active == True).first()
        if not default_package:
            print("错误：没有找到可用的订阅套餐，无法创建UserKey记录")
            return False

        print(f"使用默认套餐: {default_package.package_name} (ID: {default_package.id})")

        created_count = 0
        for api_key in api_keys_without_user_key:
            try:
                # 检查是否已存在UserKey记录
                existing_user_key = db.query(UserKey).filter(
                    UserKey.api_key_id == api_key.id
                ).first()

                if existing_user_key:
                    print(f"跳过API密钥 {api_key.id}，已存在UserKey记录")
                    continue

                # 创建UserKey记录
                user_key = UserKey(
                    user_id=api_key.user_id,  # 保持原有的用户关联
                    api_key_id=api_key.id,
                    package_id=default_package.id,
                    activation_date=api_key.created_at if api_key.user_id else None,
                    expire_date=None,  # 需要根据业务逻辑设置
                    remaining_days=default_package.duration_days,
                    remaining_credits=default_package.credits,
                    total_credits=default_package.credits,
                    status="active" if api_key.user_id and api_key.is_active else "inactive",
                    notes=f"Data migration - created from existing API key on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"
                )

                db.add(user_key)
                created_count += 1
                print(f"为API密钥 {api_key.id} 创建UserKey记录")

            except Exception as e:
                print(f"创建UserKey记录失败（API密钥ID: {api_key.id}）: {str(e)}")
                db.rollback()
                return False

        try:
            db.commit()
            print(f"成功创建 {created_count} 个UserKey记录")
            return True
        except Exception as e:
            print(f"提交事务失败: {str(e)}")
            db.rollback()
            return False


def main():
    """主函数"""
    print("开始数据修复...")

    # 检查数据一致性
    api_keys_without_user_key = check_data_consistency()

    if not api_keys_without_user_key:
        print("数据一致性良好，无需修复")
        return

    # 询问是否执行修复
    while True:
        response = input(f"\n发现 {len(api_keys_without_user_key)} 个API密钥没有UserKey记录。是否执行修复？(y/n): ").strip().lower()
        if response in ['y', 'yes']:
            break
        elif response in ['n', 'no']:
            print("取消修复操作")
            return
        else:
            print("请输入 y 或 n")

    # 执行修复
    if create_missing_user_keys(api_keys_without_user_key):
        print("\n修复完成！")
        # 再次检查数据一致性
        print("\n=== 修复后数据检查 ===")
        check_data_consistency()
    else:
        print("\n修复失败！")


if __name__ == "__main__":
    main()