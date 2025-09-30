# -*- coding: utf-8 -*-
import requests
import json

BASE_URL = "http://localhost:8000"
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "testpass123"

def test_complete_flow():
    """测试完整的用户流程"""
    session = requests.Session()

    print("[1] Testing user registration...")
    # 1. 注册用户
    register_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "username": "testuser"
    }

    reg_response = session.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    print(f"Registration status: {reg_response.status_code}")

    if reg_response.status_code not in [200, 201, 400]:  # 400可能是用户已存在
        print(f"Registration failed: {reg_response.text}")
        return False

    print("[2] Testing user login...")
    # 2. 登录用户
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }

    login_response = session.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    print(f"Login status: {login_response.status_code}")

    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        return False

    # 获取token
    login_result = login_response.json()
    token = login_result.get("access_token")
    if not token:
        print("No access token received")
        return False

    print("[3] Testing plan-status API with authentication...")
    # 3. 使用认证调用plan-status API
    headers = {"Authorization": f"Bearer {token}"}

    plan_response = session.get(f"{BASE_URL}/api/v1/keys/plan-status", headers=headers)
    print(f"Plan status response: {plan_response.status_code}")

    if plan_response.status_code == 200:
        plan_data = plan_response.json()
        print("Plan status data:")
        print(json.dumps(plan_data, indent=2, ensure_ascii=False))

        # 验证数据结构
        expected_fields = ["has_active_plan", "plan_type", "credits_remaining", "total_credits", "usage_percentage"]
        missing_fields = [field for field in expected_fields if field not in plan_data]

        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return False

        # 对于没有API key的新用户，应该返回默认值
        if not plan_data["has_active_plan"]:
            print("[SUCCESS] Correctly returned no active plan for new user")

        return True
    else:
        print(f"Plan status failed: {plan_response.text}")
        return False

if __name__ == "__main__":
    print("Testing complete flow...")
    success = test_complete_flow()

    if success:
        print("\n[SUCCESS] All tests passed! Fix is working correctly.")
    else:
        print("\n[FAILURE] Tests failed.")