# -*- coding: utf-8 -*-
import requests

BASE_URL = "http://localhost:8000"

# 测试plan-status API
def test_plan_status():
    try:
        # 先测试API是否可访问
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("[OK] Backend is running")
        else:
            print("[ERROR] Backend not accessible")
            return

        # 测试没有认证的情况下plan-status API的行为
        response = requests.get(f"{BASE_URL}/api/v1/keys/plan-status")
        print(f"[TEST] Plan status without auth: {response.status_code}")

        if response.status_code == 401:
            print("[EXPECTED] 401 Unauthorized - need authentication")
        elif response.status_code == 200:
            print("[UNEXPECTED] 200 OK without auth")
            print(f"Response: {response.json()}")
        else:
            print(f"[OTHER] Status: {response.status_code}")

    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    print("Testing plan-status API...")
    test_plan_status()