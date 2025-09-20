#!/usr/bin/env python3
"""
检查数据库当前结构
"""

import os
import sys
import pymysql
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 数据库配置
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ccmanage'),
    'charset': 'utf8mb4'
}

def check_tables():
    """检查数据库表结构"""
    connection = None
    try:
        # 连接数据库
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("连接数据库成功")

        # 检查表是否存在
        tables_to_check = ['api_keys', 'user_keys', 'packages']

        for table_name in tables_to_check:
            cursor.execute("SHOW TABLES LIKE %s", (table_name,))
            if cursor.fetchone():
                print(f"\n=== {table_name} 表结构 ===")
                cursor.execute(f"DESCRIBE {table_name}")
                for row in cursor.fetchall():
                    print(f"  {row[0]}: {row[1]} {row[2]} {row[3]} {row[4]} {row[5]}")

                # 显示表中的数据量
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                count = cursor.fetchone()[0]
                print(f"  数据量: {count} 条记录")
            else:
                print(f"\n{table_name} 表不存在")

    except Exception as e:
        print(f"检查失败: {str(e)}")
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    check_tables()