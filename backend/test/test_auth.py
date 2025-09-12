#!/usr/bin/env python3
"""
测试脚本用于验证前端登录后，后端能正确校验 access_token，并支持 refresh_token 刷新
改进点：
1. API_BASE_URL 可通过环境变量传入
2. 输入 token 使用 getpass 避免明文显示
3. 响应解析兼容非 JSON
4. 错误提示更全面
5. 增加 refresh_token 测试
"""

import os
import sys
import getpass
import requests

API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")


def safe_json(response):
    """安全解析 JSON，如果失败则返回原始文本"""
    try:
        return response.json()
    except ValueError:
        return response.text


def test_auth_flow():
    print("=== Smart Trip Forge 认证流程测试 ===\n")
    print(f"API_BASE_URL: {API_BASE_URL}\n")

    # 1. 测试根端点 (不需要认证)
    print("1. 测试根端点...")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {safe_json(response)}\n")
    except requests.exceptions.ConnectionError:
        print("   错误: 无法连接到后端服务器，请确保后端服务正在运行\n")
        return
    except requests.exceptions.Timeout:
        print("   错误: 连接超时，请检查后端服务\n")
        return
    except Exception as e:
        print(f"   错误: {e}\n")
        return

    # 2. 测试 /me 端点 (未提供 token)
    print("2. 测试 /me 端点 (未提供 token)...")
    try:
        response = requests.get(f"{API_BASE_URL}/me", timeout=5)
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {safe_json(response)}\n")
    except Exception as e:
        print(f"   错误: {e}\n")

    # 3. 输入 access_token
    print("3. 模拟前端登录...")
    print("   请提供一个有效的 Supabase access_token 进行测试:")
    print("   (你可以从浏览器开发者工具的 Application/Storage 标签页中找到)")
    print("   注意: 如果后端的 SUPABASE_JWT_SECRET 配置不正确，认证会失败")

    token = getpass.getpass("   Access Token (或按回车跳过此测试): ").strip()

    if token:
        # 4. 使用 token 测试 /me 端点
        print("\n4. 使用提供的 access_token 测试 /me 端点...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_BASE_URL}/me", headers=headers, timeout=5)
            print(f"   状态码: {response.status_code}")
            data = safe_json(response)
            if response.status_code == 200:
                print(f"   认证成功! 用户信息: {data}")
            else:
                print(f"   响应: {data}")
                if response.status_code == 401:
                    print("   提示: 401 错误可能的原因：")
                    print("     - token 无效或已过期")
                    print("     - 使用了 refresh_token 而不是 access_token")
                    print("     - 后端 SUPABASE_JWT_SECRET 配置错误")
        except requests.exceptions.Timeout:
            print("   错误: 请求超时")
        except Exception as e:
            print(f"   错误: {e}")

        # 5. 测试清单端点
        print("\n5. 使用提供的 access_token 测试清单端点 /checklists...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_BASE_URL}/checklists", headers=headers, timeout=5)
            print(f"   状态码: {response.status_code}")
            data = safe_json(response)
            if response.status_code == 200:
                print(f"   成功获取清单数据，共 {len(data)} 个清单")
                if data:
                    first = data[0] if isinstance(data, list) else None
                    if first:
                        print(f"   第一个清单: {first.get('name', 'N/A')}")
            else:
                print(f"   响应: {data}")
                if response.status_code == 401:
                    print("   提示: 401 错误可能的原因同上")
        except requests.exceptions.Timeout:
            print("   错误: 请求超时")
        except Exception as e:
            print(f"   错误: {e}")
    else:
        print("   跳过需要 access_token 的测试\n")

    # 6. 测试 refresh_token
    print("\n6. 测试 refresh_token...")
    refresh_token = getpass.getpass("   Refresh Token (或按回车跳过此测试): ").strip()

    if refresh_token:
        try:
            response = requests.post(
                f"{API_BASE_URL}/auth/refresh",
                json={"refresh_token": refresh_token},
                timeout=5,
            )
            print(f"   状态码: {response.status_code}")
            data = safe_json(response)
            if response.status_code == 200:
                new_token = data.get("access_token")
                if new_token:
                    print("   刷新成功! 新 access_token 已获取")
                else:
                    print("   响应: 未包含 access_token")
            else:
                print(f"   响应: {data}")
                if response.status_code == 401:
                    print("   提示: refresh_token 无效或已过期")
        except requests.exceptions.Timeout:
            print("   错误: 请求超时")
        except Exception as e:
            print(f"   错误: {e}")
    else:
        print("   跳过 refresh_token 测试\n")

    print("\n=== 测试完成 ===")


if __name__ == "__main__":
    try:
        test_auth_flow()
    except KeyboardInterrupt:
        print("\n用户中断测试")
        sys.exit(1)
