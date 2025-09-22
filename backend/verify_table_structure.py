#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证数据库表结构脚本 - 检查usage_records表是否包含token字段
"""

import os
import sys
from sqlalchemy import create_engine, text

# 添加app目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.core.config import settings

def get_database_url():
    """获取数据库连接URL"""
    return f"mysql+pymysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}?charset=utf8mb4"

def verify_table_structure():
    """验证表结构"""
    try:
        engine = create_engine(get_database_url())

        with engine.connect() as conn:
            # 查询usage_records表的结构
            describe_sql = "DESCRIBE usage_records"
            result = conn.execute(text(describe_sql))

            print("=== usage_records 表结构 ===")
            columns = result.fetchall()

            token_fields = ['input_tokens', 'output_tokens', 'total_tokens']
            found_fields = []

            for column in columns:
                field_name = column[0]
                field_type = column[1]
                field_null = column[2]
                field_comment = column[5] if len(column) > 5 else ''

                print(f"Field: {field_name:20} Type: {field_type:15} Null: {field_null:5} Comment: {field_comment}")

                if field_name in token_fields:
                    found_fields.append(field_name)

            print("\n=== 验证结果 ===")
            print(f"期望字段: {token_fields}")
            print(f"找到字段: {found_fields}")

            if set(token_fields) == set(found_fields):
                print("SUCCESS: All token fields have been added correctly!")
                return True
            else:
                missing = set(token_fields) - set(found_fields)
                print(f"MISSING: Missing fields: {missing}")
                return False

    except Exception as e:
        print(f"验证失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = verify_table_structure()
    if success:
        print("\nDatabase table structure verification completed successfully!")
    else:
        print("\nDatabase table structure verification failed!")
    sys.exit(0 if success else 1)