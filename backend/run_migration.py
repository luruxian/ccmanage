#!/usr/bin/env python3
"""
数据库迁移脚本：添加package_id字段到user_plans表
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

def run_migration():
    """执行数据库迁移"""
    connection = None
    try:
        # 连接数据库
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()

        print("连接数据库成功，开始执行迁移...")

        # 检查package_id字段是否已存在
        cursor.execute("DESCRIBE user_plans")
        columns = [row[0] for row in cursor.fetchall()]

        if 'package_id' in columns:
            print("package_id字段已存在，跳过迁移")
            return

        # 添加package_id字段
        print("添加package_id字段...")
        cursor.execute("""
            ALTER TABLE user_plans
            ADD COLUMN package_id INT NULL COMMENT '套餐ID' AFTER user_id
        """)

        # 添加外键约束
        print("添加外键约束...")
        cursor.execute("""
            ALTER TABLE user_plans
            ADD CONSTRAINT fk_user_plans_package_id
            FOREIGN KEY (package_id) REFERENCES packages(id)
            ON DELETE SET NULL ON UPDATE CASCADE
        """)

        # 创建索引
        print("创建索引...")
        cursor.execute("""
            CREATE INDEX idx_user_plans_package_id ON user_plans(package_id)
        """)

        # 提交事务
        connection.commit()
        print("迁移执行成功！")

        # 显示表结构确认
        print("\n当前user_plans表结构：")
        cursor.execute("DESCRIBE user_plans")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]} {row[2]} {row[3]} {row[4]} {row[5]}")

    except Exception as e:
        if connection:
            connection.rollback()
        print(f"迁移失败: {str(e)}")
        sys.exit(1)

    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    run_migration()