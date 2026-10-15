extends Node
## 메뉴 → 로비 → 게임 → 결과 화면 전환 담당.
## 온라인 흐름: 호스트가 서버를 연다(호스트 = 플레이어 1) → 친구들이 IP로 접속
## → 호스트가 Start → 모든 컴퓨터가 같은 슬롯 정보로 게임을 만든다.

const Net = preload("res://scripts/net.gd")
const GameScript = preload("res://scripts/game.gd")

var menu_box: VBoxContainer
var lobby_box: VBoxContainer
var result_box: VBoxContainer
var status_label: Label
var ip_edit: LineEdit
var lobby_label: Label
var start_button: Button
var result_label: Label
var again_button: Button

var game: Node = null
var lobby_peers: Array = []   # 서버만 관리: 접속한 플레이어 id (호스트 = 1)
var last_slots: Array = []


func _ready() -> void:
	multiplayer.peer_connected.connect(_on_peer_connected)
	multiplayer.peer_disconnected.connect(_on_peer_disconnected)
	multiplayer.connected_to_server.connect(_on_connected_to_server)
	multiplayer.connection_failed.connect(_on_connection_failed)
	multiplayer.server_disconnected.connect(_on_server_disconnected)
	_build_ui()
	_show_screen(menu_box)
	_handle_cmdline.call_deferred()


## 테스트용 실행 옵션: -- --host  /  -- --join=127.0.0.1  /  -- --local
func _handle_cmdline() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg == "--host":
			_on_host_pressed()
		elif arg.begins_with("--join="):
			ip_edit.text = arg.get_slice("=", 1)
			_on_join_pressed()
		elif arg == "--local":
			_on_local_pressed()


# ---------------------------------------------------------------- 버튼

func _on_local_pressed() -> void:
	_leave_network()
	_begin_game([{"peer": 1, "keys": 0}, {"peer": 1, "keys": 1}])


func _on_solo_pressed() -> void:
	_leave_network()
	_begin_game([{"peer": 1, "keys": 2}])


func _on_host_pressed() -> void:
	_leave_network()
	var peer := Net.create_host()
	if peer == null:
		status_label.text = "Could not host. Is port %d already in use?" % Net.DEFAULT_PORT
		return
	multiplayer.multiplayer_peer = peer
	lobby_peers = [1]
	start_button.visible = true
	_show_screen(lobby_box)
	_refresh_lobby(lobby_peers)


func _on_join_pressed() -> void:
	_leave_network()
	var address := ip_edit.text.strip_edges()
	var peer := Net.create_client(address)
	if peer == null:
		status_label.text = "Invalid address."
		return
	multiplayer.multiplayer_peer = peer
	status_label.text = "Connecting to %s ..." % address


func _on_start_pressed() -> void:
	if multiplayer.is_server():
		_start_game.rpc(_slots_from_lobby())


func _on_again_pressed() -> void:
	if _is_online():
		_start_game.rpc(_slots_from_lobby())
	else:
		_begin_game(last_slots)


func _on_menu_pressed() -> void:
	_free_game()
	_leave_network()
	status_label.text = ""
	_show_screen(menu_box)


# ---------------------------------------------------------------- 네트워크 이벤트

func _on_peer_connected(id: int) -> void:
	if not multiplayer.is_server():
		return
	# 게임 도중 난입은 아직 지원하지 않음
	if game != null or lobby_peers.size() >= Net.MAX_PLAYERS:
		multiplayer.multiplayer_peer.disconnect_peer(id)
		return
	lobby_peers.append(id)
	_sync_lobby.rpc(lobby_peers)


func _on_peer_disconnected(id: int) -> void:
	if not multiplayer.is_server():
		return
	lobby_peers.erase(id)
	_sync_lobby.rpc(lobby_peers)
	if game != null:
		game.on_peer_left(id)


func _on_connected_to_server() -> void:
	start_button.visible = false
	_show_screen(lobby_box)


func _on_connection_failed() -> void:
	_leave_network()
	status_label.text = "Could not connect."


func _on_server_disconnected() -> void:
	_free_game()
	_leave_network()
	status_label.text = "The host left the game."
	_show_screen(menu_box)


@rpc("authority", "call_local", "reliable")
func _sync_lobby(peers: Array) -> void:
	_refresh_lobby(peers)


@rpc("authority", "call_local", "reliable")
func _start_game(slots: Array) -> void:
	_begin_game(slots)


# ---------------------------------------------------------------- 게임

func _begin_game(slots: Array) -> void:
	_free_game()
	last_slots = slots
	game = GameScript.new()
	game.name = "Game"  # 모든 컴퓨터에서 경로(/root/Main/Game)가 같아야 RPC가 전달된다
	add_child(game)
	game.setup(slots)
	game.finished.connect(_on_game_finished)
	_show_screen(null)


func _free_game() -> void:
	if game != null:
		remove_child(game)
		game.queue_free()
		game = null


func _on_game_finished(time_sec: float) -> void:
	result_label.text = "Delivered!\nTime: %.1f s" % time_sec
	again_button.visible = multiplayer.is_server()
	_show_screen(result_box)


func _slots_from_lobby() -> Array:
	var slots := []
	for id in lobby_peers:
		slots.append({"peer": id, "keys": 2})
	return slots


func _is_online() -> bool:
	return not (multiplayer.multiplayer_peer is OfflineMultiplayerPeer)


func _leave_network() -> void:
	if _is_online():
		multiplayer.multiplayer_peer.close()
	multiplayer.multiplayer_peer = OfflineMultiplayerPeer.new()
	lobby_peers = []


# ---------------------------------------------------------------- UI

func _build_ui() -> void:
	var ui := CanvasLayer.new()
	ui.layer = 10
	add_child(ui)

	menu_box = _make_screen(ui)
	_add_label(menu_box, "HUSKY SLED CO-OP", 48)
	_add_label(menu_box, "Pull the slippery sled to the goal together!", 18)
	_add_button(menu_box, "Local 2P  (one keyboard)", _on_local_pressed)
	_add_button(menu_box, "Solo test", _on_solo_pressed)
	menu_box.add_child(HSeparator.new())
	_add_button(menu_box, "Host online game", _on_host_pressed)
	var join_row := HBoxContainer.new()
	menu_box.add_child(join_row)
	ip_edit = LineEdit.new()
	ip_edit.text = "127.0.0.1"
	ip_edit.placeholder_text = "Host IP"
	ip_edit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	join_row.add_child(ip_edit)
	_add_button(join_row, "Join", _on_join_pressed)
	status_label = _add_label(menu_box, "", 16)

	lobby_box = _make_screen(ui)
	_add_label(lobby_box, "LOBBY", 40)
	lobby_label = _add_label(lobby_box, "", 18)
	start_button = _add_button(lobby_box, "Start", _on_start_pressed)
	_add_button(lobby_box, "Leave", _on_menu_pressed)

	result_box = _make_screen(ui)
	result_label = _add_label(result_box, "", 40)
	again_button = _add_button(result_box, "Play again", _on_again_pressed)
	_add_button(result_box, "Menu", _on_menu_pressed)


func _refresh_lobby(peers: Array) -> void:
	var text := "Players %d / %d\n" % [peers.size(), Net.MAX_PLAYERS]
	for i in peers.size():
		text += "\nP%d%s" % [i + 1, "  (host)" if peers[i] == 1 else ""]
	if multiplayer.is_server():
		var ips := Net.local_ipv4_addresses()
		text += "\n\nTell friends your IP: %s  (port %d)" % [", ".join(ips) if not ips.is_empty() else "?", Net.DEFAULT_PORT]
	else:
		text += "\n\nWaiting for the host to start..."
	lobby_label.text = text


func _show_screen(box: Control) -> void:
	for b in [menu_box, lobby_box, result_box]:
		b.get_parent().visible = b == box


func _make_screen(parent: Node) -> VBoxContainer:
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	parent.add_child(center)
	var panel := PanelContainer.new()
	center.add_child(panel)
	var margin := MarginContainer.new()
	for side in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_" + side, 24)
	panel.add_child(margin)
	var box := VBoxContainer.new()
	box.custom_minimum_size = Vector2(440, 0)
	box.add_theme_constant_override("separation", 12)
	margin.add_child(box)
	return box


func _add_label(parent: Node, text: String, size: int) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", size)
	parent.add_child(label)
	return label


func _add_button(parent: Node, text: String, callback: Callable) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(0, 40)
	button.pressed.connect(callback)
	parent.add_child(button)
	return button
