#!/usr/bin/env python3
"""
在 Tello Talent (RMTT) 顶部 8x8 点阵屏上显示一个 ArUco 风格图案.

用法:
    python3 tt_show_aruco.py                    # 默认 id=0, 蓝色
    python3 tt_show_aruco.py 7                  # id=7
    python3 tt_show_aruco.py 7 r                # id=7, 红色
    python3 tt_show_aruco.py --clear            # 清屏
    python3 tt_show_aruco.py --text "HELLO" b   # 滚动文字

依赖:
    pip3 install opencv-contrib-python numpy

前提:
    Mac 已连上 TELLO-XXXXXX 这个 Wi-Fi
    飞机顶部装着开源 ESP32 扩展模块 (出厂自带)
"""

import socket
import sys
import time
import subprocess

TELLO_IP = "192.168.10.1"
TELLO_PORT = 8889
LOCAL_PORT = 9000


def check_wifi():
    iface = subprocess.check_output(
        ["networksetup", "-listallhardwareports"], text=True
    )
    wifi_dev = None
    lines = iface.splitlines()
    for i, line in enumerate(lines):
        if "Wi-Fi" in line and i + 1 < len(lines):
            wifi_dev = lines[i + 1].split()[-1]
            break
    if not wifi_dev:
        return None
    out = subprocess.check_output(
        ["networksetup", "-getairportnetwork", wifi_dev], text=True
    ).strip()
    ssid = out.replace("Current Wi-Fi Network: ", "")
    return ssid


def make_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("", LOCAL_PORT))
    s.settimeout(3)
    return s


def send(sock, cmd, wait=0.4):
    print(f"  -> {cmd}")
    sock.sendto(cmd.encode(), (TELLO_IP, TELLO_PORT))
    try:
        data, _ = sock.recvfrom(2048)
        reply = data.decode(errors="ignore").strip()
        print(f"  <- {reply}")
        time.sleep(wait)
        return reply
    except socket.timeout:
        print("  <- (timeout)")
        return None


def aruco_pattern(marker_id: int, color: str) -> str:
    """生成 8x8 点阵字符串. 字符: r / b / p / 0."""
    try:
        import cv2
    except ImportError:
        print("[X] 需要安装 opencv:  pip3 install opencv-contrib-python numpy")
        sys.exit(1)

    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    if hasattr(cv2.aruco, "generateImageMarker"):
        img = cv2.aruco.generateImageMarker(aruco_dict, marker_id, 8, borderBits=1)
    else:
        img = cv2.aruco.drawMarker(aruco_dict, marker_id, 8, borderBits=1)

    chars = []
    for r in range(8):
        for c in range(8):
            # ArUco 黑格 -> LED 点亮 (取反, 因为点阵屏没有白色背景)
            chars.append(color if img[r, c] < 127 else "0")
    return "".join(chars)


def preview(pattern: str, color: str):
    print("\n  预览 (实物会用颜色 '%s' 亮起):" % color)
    icons = {"0": "·", "r": "■", "b": "■", "p": "■"}
    for r in range(8):
        row = pattern[r * 8 : (r + 1) * 8]
        print("    " + " ".join(icons.get(ch, "?") for ch in row))
    print()


def main():
    args = sys.argv[1:]

    # 检查 Wi-Fi
    ssid = check_wifi()
    if not ssid or not ssid.startswith("TELLO-"):
        print(f"[X] 当前 Wi-Fi: {ssid}")
        print("    先在菜单栏连到 TELLO-XXXXXX 再跑这个脚本.")
        sys.exit(1)
    print(f"[OK] Wi-Fi 已连接: {ssid}")

    sock = make_socket()
    try:
        # 进 SDK 模式
        if send(sock, "command") != "ok":
            print("[X] 飞机没回 ok, 检查飞机是否开机 / 在范围内")
            sys.exit(1)

        # 模式分发
        if args and args[0] in ("--clear", "-c", "clear"):
            send(sock, "EXT mled sc")
            print("[OK] 已清屏")
            return

        if args and args[0] in ("--text", "-t", "text"):
            text = args[1] if len(args) > 1 else "HELLO"
            color = args[2] if len(args) > 2 else "b"
            # EXT mled l <color> <freq 0.1-2.5> <方向 l/r/u/d> <text>
            send(sock, f"EXT mled l {color} 1.5 l {text}")
            print(f"[OK] 滚动文字: {text}")
            return

        # 默认: 显示 ArUco
        marker_id = int(args[0]) if len(args) >= 1 else 0
        color = args[1] if len(args) >= 2 else "b"
        if color not in ("r", "b", "p"):
            print("color 只能是 r / b / p"); sys.exit(1)
        if not (0 <= marker_id < 50):
            print("DICT_4X4_50 的 id 范围 0~49"); sys.exit(1)

        # 查电量, 防止半路掉
        batt = send(sock, "battery?")
        try:
            if int(batt) < 10:
                print("[X] 电量太低"); sys.exit(1)
        except (TypeError, ValueError):
            pass

        pattern = aruco_pattern(marker_id, color)
        preview(pattern, color)

        send(sock, f"EXT mled g {pattern}")
        print(f"[OK] 已显示 ArUco DICT_4X4_50 id={marker_id} (颜色 {color})")
        print("    清屏:  python3 tt_show_aruco.py --clear")

    finally:
        sock.close()


if __name__ == "__main__":
    main()
