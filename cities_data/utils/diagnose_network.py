import socket
import subprocess
import httpx
import os

DOMAIN = "generativelanguage.googleapis.com"

def check_dns():
    print("=== 🧩 DNS 解析结果 ===")
    try:
        addrs = socket.getaddrinfo(DOMAIN, 443)
        for a in addrs:
            print(a[4][0])
    except Exception as e:
        print("DNS 解析失败:", e)

def check_ping():
    print("\n=== 📡 Ping 测试 ===")
    try:
        subprocess.run(["ping", "-n", "3", DOMAIN], check=False)
    except Exception as e:
        print("Ping 失败:", e)

def check_curl():
    print("\n=== 🌐 Curl 测试 ===")
    try:
        subprocess.run(["curl.exe", "-v", f"https://{DOMAIN}/"], check=False)
    except Exception as e:
        print("Curl 失败:", e)

def check_httpx():
    print("\n=== 🐍 Python httpx 测试 ===")
    try:
        r = httpx.get(f"https://{DOMAIN}/", timeout=10)
        print("状态码:", r.status_code)
        print("响应头:", r.headers)
    except Exception as e:
        print("httpx 请求失败:", e)

def check_proxy():
    print("\n=== 🔑 环境变量 Proxy ===")
    for key in ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"]:
        print(f"{key} =", os.getenv(key))

if __name__ == "__main__":
    print(f"开始诊断 {DOMAIN} ...\n")
    check_proxy()
    check_dns()
    check_ping()
    check_curl()
    check_httpx()
