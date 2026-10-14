extends RefCounted
## 네트워크 연결(피어) 생성만 담당한다.
## 지금은 ENet(IP 직접 접속)을 쓰고, 나중에 Steam으로 바꿀 때는 이 파일만
## SteamMultiplayerPeer(GodotSteam)로 교체하면 나머지 게임 코드는 그대로 동작한다.

const DEFAULT_PORT := 7777
const MAX_PLAYERS := 4


static func create_host(port: int = DEFAULT_PORT) -> MultiplayerPeer:
	var peer := ENetMultiplayerPeer.new()
	# 호스트 자신도 플레이어이므로 접속 가능한 클라이언트 수는 MAX_PLAYERS - 1
	if peer.create_server(port, MAX_PLAYERS - 1) != OK:
		return null
	return peer


static func create_client(address: String, port: int = DEFAULT_PORT) -> MultiplayerPeer:
	var peer := ENetMultiplayerPeer.new()
	if peer.create_client(address, port) != OK:
		return null
	return peer


## 같은 공유기(LAN)에 있는 친구에게 알려줄 내 IP 목록
static func local_ipv4_addresses() -> Array[String]:
	var out: Array[String] = []
	for addr in IP.get_local_addresses():
		if addr.count(".") == 3 and not addr.begins_with("127."):
			out.append(addr)
	return out
