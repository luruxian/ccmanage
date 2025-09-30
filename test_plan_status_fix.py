#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试修复后的plan-status API
验证没有API key的用户是否能正常获取套餐状态而不报错
"""

import requests
import json
import sys

# 设置控制台编码以支持emoji
if sys.platform == "win32":
    import os
    os.system("chcp 65001 > nul")

# 测试配置
BASE_URL = "http://localhost:8000"
EMAIL = "test@example.com"
PASSWORD = "password123"

def test_plan_status_api():
    """测试plan-status API"""
    session = requests.Session()

    try:
        # 1. 先注册/登录一个测试用户
        print("[AUTH] 正在登录测试用户...")
        login_data = {
            "email": EMAIL,
            "password": PASSWORD
        }

        login_response = session.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)

        if login_response.status_code != 200:
            print(f"❌ 登录失败: {login_response.status_code}")
            # 尝试注册
            print("📝 尝试注册新用户...")
            register_data = {
                "email": EMAIL,
                "password": PASSWORD,
                "username": "testuser"
            }
            register_response = session.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
            if register_response.status_code not in [200, 201]:
                print(f"❌ 注册失败: {register_response.status_code}")
                return False

            # 重新登录
            login_response = session.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
            if login_response.status_code != 200:
                print(f"❌ 重新登录失败: {login_response.status_code}")
                return False

        # 获取token
        login_result = login_response.json()
        token = login_result.get("access_token")
        if not token:
            print("❌ 未获取到访问令牌")
            return False

        print("✅ 登录成功")

        # 2. 测试plan-status API
        print("📊 正在测试plan-status API...")
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        plan_response = session.get(f"{BASE_URL}/api/v1/keys/plan-status", headers=headers)

        print(f"📈 响应状态码: {plan_response.status_code}")

        if plan_response.status_code == 200:
            plan_data = plan_response.json()
            print("✅ plan-status API调用成功!")
            print(f"📋 响应数据: {json.dumps(plan_data, indent=2, ensure_ascii=False)}")

            # 验证响应数据结构
            expected_keys = ["has_active_plan", "plan_type", "credits_remaining", "total_credits", "usage_percentage"]
            for key in expected_keys:
                if key not in plan_data:
                    print(f"⚠️  警告: 响应中缺少字段 '{key}'")
                    return False

            print("✅ 响应数据结构正确")

            # 验证没有API key的用户应该获得默认值
            if not plan_data["has_active_plan"]:
                print("✅ 正确返回无活跃套餐状态")

            return True
        else:
            print(f"❌ plan-status API调用失败: {plan_response.status_code}")
            print(f"错误详情: {plan_response.text}")
            return False

    except Exception as e:
        print(f"❌ 测试过程中发生异常: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 开始测试plan-status API修复...")
    success = test_plan_status_api()

    if success:
        print("\n🎉 测试成功! plan-status API修复有效")
    else:
        print("\n💥 测试失败! 需要进一步检查")