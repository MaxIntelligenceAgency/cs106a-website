#!/bin/bash
# 用法: ./tello-station.sh "<SSID>" "<密码>"
# 前提: Mac 已经手动连上 TELLO-XXXXXX 这个热点

set -e

SSID="$1"
PASS="$2"

if [ -z "$SSID" ] || [ -z "$PASS" ]; then
  echo "用法: $0 \"<SSID>\" \"<密码>\""
  echo "例:  $0 \"yuanbo的iPhone\" \"mypass123\""
  exit 1
fi

IFACE=$(networksetup -listallhardwareports | awk '/Wi-Fi/{getline; print $2}')
CURRENT=$(networksetup -getairportnetwork "$IFACE" | sed 's/^Current Wi-Fi Network: //')

if [[ "$CURRENT" != TELLO-* ]]; then
  echo "[X] 当前 Wi-Fi 是: $CURRENT"
  echo "    先在菜单栏把 Mac 连到 TELLO-XXXXXX 再跑这个脚本"
  exit 1
fi
echo "[OK] 已连上 $CURRENT"

ping -c1 -W1000 192.168.10.1 >/dev/null || { echo "[X] ping 不到 192.168.10.1, Tello 可能没开机"; exit 1; }
echo "[OK] Tello 在线"

send() {
  local CMD="$1"
  local REPLY
  REPLY=$(echo -n "$CMD" | nc -u -w2 192.168.10.1 8889 | tr -d '\0')
  echo "  > $CMD  ->  $REPLY"
  [[ "$REPLY" == ok* ]] || { echo "[X] Tello 返回非 ok, 中止"; exit 1; }
}

echo "[*] 进入 SDK 模式..."
send "command"

echo "[*] 查电量 (低于 25% 不建议切, 切完会重启)..."
BATT=$(echo -n "battery?" | nc -u -w2 192.168.10.1 8889 | tr -d '\0\r\n')
echo "  电量: ${BATT}%"
if [ "${BATT:-0}" -lt 25 ]; then
  echo "[X] 电量太低, 先充电"
  exit 1
fi

echo "[*] 把 Tello 切到 station 模式, 让它去连: $SSID"
send "ap $SSID $PASS"

echo ""
echo "===================================================================="
echo "完成。Tello 现在会重启并尝试连上 [$SSID]。"
echo ""
echo "接下来你要做的:"
echo "  1. Mac 这边的 TELLO-* 热点会消失 (因为飞机不再当 AP)"
echo "  2. 把 Mac 也连到 [$SSID]"
echo "  3. 在路由器 / 热点设备上查 Tello 拿到的新 IP"
echo "     (iPhone 热点: 设置 -> 个人热点 -> 看连接的设备)"
echo "  4. 之后控制 Tello 就用那个新 IP, 不再是 192.168.10.1"
echo ""
echo "想让 Tello 退回 AP 模式: 关机后长按电源键 5 秒以上"
echo "===================================================================="
