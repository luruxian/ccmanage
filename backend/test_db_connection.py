#!/usr/bin/env python3
"""
测试数据库连接
"""

import os
import sys

# 添加app目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.db.database import check_db_connection, get_db
from app.core.config import settings

def test_connection():
    print("测试数据库连接...")
    print(f"数据库配置: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}")

    if check_db_connection():
        print("Database connection successful")
        return True
    else:
        print("Database connection failed")
        return False

if __name__ == "__main__":
    test_connection()