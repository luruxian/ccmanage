#!/usr/bin/env python3
"""
数据库迁移脚本：更新user_keys表结构
添加必要的字段以支持新的用户密钥管理功能
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

def check_column_exists(cursor, table_name, column_name):
    """检查列是否存在"""
    cursor.execute(f"DESCRIBE {table_name}")
    columns = [row[0] for row in cursor.fetchall()]
    return column_name in columns

def run_migration():
    """执行数据库迁移"""
    connection = None
    try:
        # 连接数据库
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("连接数据库成功，开始执行迁移...")

        # 1. 更新APIKey表的user_id字段为可空
        print("1. 检查并更新api_keys表的user_id字段...")
        cursor.execute("SHOW COLUMNS FROM api_keys WHERE Field='user_id'")
        result = cursor.fetchone()
        if result and 'NOT NULL' in result[2]:
            print("  - 修改api_keys.user_id为可空...")
            cursor.execute("""
                ALTER TABLE api_keys
                MODIFY COLUMN user_id VARCHAR(50) NULL COMMENT '用户ID（激活前可为空）'
            """)
        else:
            print("  - api_keys.user_id已经是可空字段")

        # 2. 检查user_keys表是否存在必要字段，如果不存在则添加
        migrations_needed = []

        # 检查package_id字段
        if not check_column_exists(cursor, 'user_keys', 'package_id'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN package_id INT NOT NULL COMMENT '关联的订阅ID' AFTER api_key_id
            """)

        # 检查activation_date字段
        if not check_column_exists(cursor, 'user_keys', 'activation_date'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN activation_date DATETIME NULL COMMENT '激活时间' AFTER package_id
            """)

        # 检查expire_date字段
        if not check_column_exists(cursor, 'user_keys', 'expire_date'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN expire_date DATETIME NULL COMMENT '过期时间' AFTER activation_date
            """)

        # 检查remaining_days字段
        if not check_column_exists(cursor, 'user_keys', 'remaining_days'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN remaining_days INT NULL COMMENT '剩余天数' AFTER expire_date
            """)

        # 检查remaining_credits字段
        if not check_column_exists(cursor, 'user_keys', 'remaining_credits'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN remaining_credits INT NULL COMMENT '剩余积分' AFTER remaining_days
            """)

        # 检查total_credits字段
        if not check_column_exists(cursor, 'user_keys', 'total_credits'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN total_credits INT NULL COMMENT '总积分' AFTER remaining_credits
            """)

        # 检查status字段
        if not check_column_exists(cursor, 'user_keys', 'status'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'inactive' COMMENT '状态: active/inactive/expired' AFTER total_credits
            """)

        # 检查notes字段
        if not check_column_exists(cursor, 'user_keys', 'notes'):
            migrations_needed.append("""
                ALTER TABLE user_keys
                ADD COLUMN notes TEXT NULL COMMENT '备注信息' AFTER status
            """)

        # 执行所有必要的迁移
        if migrations_needed:
            print("2. 更新user_keys表结构...")
            for i, migration in enumerate(migrations_needed, 1):
                print(f"  - 执行迁移 {i}/{len(migrations_needed)}...")
                cursor.execute(migration)
        else:
            print("2. user_keys表结构已是最新状态")

        # 3. 添加外键约束（如果不存在）
        print("3. 检查并添加外键约束...")
        try:
            cursor.execute("""
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = %s
                AND TABLE_NAME = 'user_keys'
                AND COLUMN_NAME = 'package_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            """, (DB_CONFIG['database'],))

            if not cursor.fetchone():
                print("  - 添加package_id外键约束...")
                cursor.execute("""
                    ALTER TABLE user_keys
                    ADD CONSTRAINT fk_user_keys_package_id
                    FOREIGN KEY (package_id) REFERENCES packages(id)
                    ON DELETE RESTRICT ON UPDATE CASCADE
                """)
            else:
                print("  - package_id外键约束已存在")
        except Exception as e:
            print(f"  - 外键约束添加失败（可能已存在）: {str(e)}")

        # 4. 创建或更新索引
        print("4. 创建索引...")
        try:
            # 检查索引是否存在
            cursor.execute("SHOW INDEX FROM user_keys WHERE Key_name = 'idx_user_key_relation'")
            if not cursor.fetchone():
                cursor.execute("""
                    CREATE INDEX idx_user_key_relation
                    ON user_keys(user_id, api_key_id, status)
                """)
                print("  - 创建用户密钥关联索引")
            else:
                print("  - 用户密钥关联索引已存在")
        except Exception as e:
            print(f"  - 索引创建失败: {str(e)}")

        # 提交事务
        connection.commit()
        print("\n✅ 数据库迁移完成！")

        # 显示最终的表结构
        print("\n📋 当前user_keys表结构：")
        cursor.execute("DESCRIBE user_keys")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]} {row[2]} {row[3]} {row[4]} {row[5]}")

        print("\n📋 当前api_keys表user_id字段：")
        cursor.execute("SHOW COLUMNS FROM api_keys WHERE Field='user_id'")
        result = cursor.fetchone()
        if result:
            print(f"  user_id: {result[1]} {result[2]} {result[3]} {result[4]} {result[5]}")

    except Exception as e:
        if connection:
            connection.rollback()
        print(f"❌ 迁移失败: {str(e)}")
        sys.exit(1)

    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    run_migration()