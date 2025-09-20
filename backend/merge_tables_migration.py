#!/usr/bin/env python3
"""
数据库重构迁移脚本：合并api_keys和user_keys表
1. 扩展api_keys表添加订阅管理字段
2. 合并user_keys数据到api_keys表
3. 删除user_keys表
4. 删除所有外键约束
"""

import os
import sys
import pymysql
from dotenv import load_dotenv
from datetime import datetime

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

def check_table_exists(cursor, table_name):
    """检查表是否存在"""
    cursor.execute("SHOW TABLES LIKE %s", (table_name,))
    return cursor.fetchone() is not None

def run_migration():
    """执行数据库迁移"""
    connection = None
    try:
        # 连接数据库
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("连接数据库成功，开始执行重构迁移...")

        # 步骤1: 扩展api_keys表结构
        print("\n步骤1: 扩展api_keys表结构...")

        # 需要添加的字段
        new_columns = [
            ("package_id", "INT NULL COMMENT '关联的订阅ID'"),
            ("activation_date", "DATETIME NULL COMMENT '激活时间'"),
            ("expire_date", "DATETIME NULL COMMENT '过期时间'"),
            ("remaining_days", "INT NULL COMMENT '剩余天数'"),
            ("remaining_credits", "INT NULL COMMENT '剩余积分'"),
            ("total_credits", "INT NULL COMMENT '总积分'"),
            ("status", "VARCHAR(20) NOT NULL DEFAULT 'inactive' COMMENT '状态: active/inactive/expired'"),
            ("notes", "TEXT NULL COMMENT '备注信息'")
        ]

        for column_name, column_def in new_columns:
            if not check_column_exists(cursor, 'api_keys', column_name):
                print(f"  - 添加字段: {column_name}")
                cursor.execute(f"ALTER TABLE api_keys ADD COLUMN {column_name} {column_def}")
            else:
                print(f"  - 字段已存在: {column_name}")

        # 步骤2: 数据迁移 - 合并user_keys数据到api_keys
        if check_table_exists(cursor, 'user_keys'):
            print("\n步骤2: 合并user_keys数据到api_keys...")

            # 查询user_keys表中的数据（只获取现有字段）
            cursor.execute("""
                SELECT api_key_id, activation_date, status, notes
                FROM user_keys
            """)
            user_keys_data = cursor.fetchall()

            if user_keys_data:
                print(f"  - 找到 {len(user_keys_data)} 条user_keys记录需要合并")

                # 更新api_keys表
                for record in user_keys_data:
                    api_key_id, activation_date, status, notes = record

                    cursor.execute("""
                        UPDATE api_keys
                        SET activation_date = %s, status = %s, notes = %s
                        WHERE id = %s
                    """, (activation_date, status, notes, api_key_id))

                print(f"  - 成功合并 {len(user_keys_data)} 条记录到api_keys表")
            else:
                print("  - user_keys表为空，跳过数据合并")
        else:
            print("\n步骤2: user_keys表不存在，跳过数据合并")

        # 步骤3: 删除外键约束
        print("\n步骤3: 删除外键约束...")

        # 获取所有外键约束
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = %s AND REFERENCED_TABLE_NAME IS NOT NULL
        """, (DB_CONFIG['database'],))

        foreign_keys = cursor.fetchall()

        if foreign_keys:
            print(f"  - 找到 {len(foreign_keys)} 个外键约束需要删除")
            for fk in foreign_keys:
                constraint_name, table_name, column_name, referenced_table = fk
                try:
                    cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {constraint_name}")
                    print(f"    删除外键成功: {table_name}.{constraint_name}")
                except Exception as e:
                    print(f"    删除外键失败: {table_name}.{constraint_name} - {str(e)}")
        else:
            print("  - 没有找到外键约束")

        # 步骤4: 删除user_keys表
        if check_table_exists(cursor, 'user_keys'):
            print("\n步骤4: 删除user_keys表...")
            cursor.execute("DROP TABLE user_keys")
            print("  - user_keys表已删除")
        else:
            print("\n步骤4: user_keys表不存在，跳过删除")

        # 步骤5: 为没有订阅信息的api_keys记录设置默认值
        print("\n步骤5: 设置默认订阅信息...")

        # 获取默认套餐
        cursor.execute("SELECT id, credits, duration_days FROM packages WHERE is_active = TRUE ORDER BY sort_order LIMIT 1")
        default_package = cursor.fetchone()

        if default_package:
            package_id, credits, duration_days = default_package

            # 更新没有package_id的记录
            cursor.execute("""
                UPDATE api_keys
                SET package_id = %s, remaining_days = %s, remaining_credits = %s,
                    total_credits = %s, notes = %s
                WHERE package_id IS NULL
            """, (package_id, duration_days, credits, credits,
                  f"Auto-assigned default package during migration - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"))

            affected_rows = cursor.rowcount
            print(f"  - 为 {affected_rows} 条记录设置了默认订阅信息 (套餐ID: {package_id})")
        else:
            print("  - 警告: 没有找到可用的默认套餐")

        # 提交事务
        connection.commit()
        print("\n数据库重构迁移完成！")

        # 显示最终的api_keys表结构
        print("\napi_keys表最终结构:")
        cursor.execute("DESCRIBE api_keys")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]} {row[2]} {row[3]} {row[4]} {row[5]}")

        # 显示数据统计
        cursor.execute("SELECT COUNT(*) FROM api_keys")
        total_keys = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM api_keys WHERE package_id IS NOT NULL")
        keys_with_package = cursor.fetchone()[0]

        print(f"\n数据统计:")
        print(f"  - 总用户密钥数: {total_keys}")
        print(f"  - 有订阅信息的密钥: {keys_with_package}")

    except Exception as e:
        if connection:
            connection.rollback()
        print(f"迁移失败: {str(e)}")
        sys.exit(1)

    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    print("开始数据库重构迁移...")
    print("警告: 此操作将修改数据库结构并删除user_keys表")
    print("自动执行迁移...")

    run_migration()