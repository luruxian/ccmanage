#!/usr/bin/env python3
"""
测试导入和版本兼容性
"""

try:
    print("Testing basic imports...")

    # 测试基础导入
    import sys
    print(f"Python version: {sys.version}")

    # 测试FastAPI导入
    try:
        from fastapi import FastAPI
        print("SUCCESS: FastAPI import successful")
    except Exception as e:
        print(f"ERROR: FastAPI import failed: {e}")

    # 测试Pydantic导入
    try:
        from pydantic import BaseModel
        print("SUCCESS: Pydantic import successful")
    except Exception as e:
        print(f"ERROR: Pydantic import failed: {e}")

    # 测试SQLAlchemy导入
    try:
        from sqlalchemy import create_engine
        print("SUCCESS: SQLAlchemy import successful")
    except Exception as e:
        print(f"ERROR: SQLAlchemy import failed: {e}")

    # 测试创建简单的FastAPI应用
    try:
        app = FastAPI()

        @app.get("/test")
        def test_endpoint():
            return {"message": "test"}

        print("SUCCESS: FastAPI app creation successful")
    except Exception as e:
        print(f"ERROR: FastAPI app creation failed: {e}")

except Exception as e:
    print(f"General error: {e}")

print("Import test completed.")