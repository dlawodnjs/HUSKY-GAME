extends Node2D
## 썰매 레이스 본체.
## - 물리(허스키, 줄, 썰매)는 서버(호스트)만 계산한다.
## - 각 컴퓨터는 자기 허스키의 키 입력만 서버로 보낸다.
## - 서버는 매 프레임 위치를 모두에게 보내고, 클라이언트는 받은 위치를 부드럽게 따라간다.
## 로컬(한 키보드) 플레이는 서버 = 나 자신인 경우라서 같은 코드로 동작한다.

signal finished(time_sec: float)

const LevelScript = preload("res://scripts/level.gd")
const SledScript = preload("res://scripts/sled.gd")
const HuskyScript = preload("res://scripts/husky.gd")

# ---------- 튜닝 값 (여기 숫자만 바꿔도 손맛이 크게 달라진다) ----------
const HUSKY_PULL_FORCE := 900.0   # 허스키가 달리는 힘
const LEAD_PULL_BONUS := 1.15     # 리더견(맨 앞) 힘 보너스
const HUSKY_DAMP := 4.0           # 허스키 발 접지력 (높을수록 빨리 멈춤)
const HUSKY_BRAKE_DAMP := 20.0    # 휠견이 발로 버틸 때 접지력
const SLED_DAMP := 0.12           # 썰매 앞뒤 마찰 (낮을수록 미끄러움 = 관성 큼)
const SLED_SIDE_GRIP := 1.2       # 썰매 옆미끄러짐 저항 (낮을수록 드리프트가 심함)
const SLED_BRAKE_DAMP := 1.6      # 휠견 한 마리가 버틸 때 썰매에 더해지는 마찰
const ICE_FACTOR := 0.1           # 빙판 위에서 썰매 마찰 배율
const ROPE_BASE := 55.0           # 썰매 바로 앞 줄 길이
const ROPE_STEP := 50.0           # 한 줄(2마리) 앞으로 갈 때마다 늘어나는 줄 길이
const ROPE_K := 80.0              # 줄 탄성
const ROPE_DAMP := 6.0            # 줄 흔들림 억제
const SYNC_WINDOW := 0.4          # "같이 당기기"를 모두 이 시간(초) 안에 눌러야 성공
const SYNC_COOLDOWN := 1.5
const SYNC_IMPULSE := 520.0       # 성공 시 썰매에 주는 순간 힘
const COUNTDOWN := 3.0

const PLAYER_COLORS := [Color("e74c3c"), Color("3498db"), Color("27ae60"), Color("f39c12")]

## keys 번호: 0 = WASD/Q/E, 1 = IJKL/U/O (한 키보드 2인용), 2 = WASD 또는 방향키 (온라인/솔로)
const KEY_SCHEMES := [
	{"up": [KEY_W], "down": [KEY_S], "left": [KEY_A], "right": [KEY_D], "brake": [KEY_Q], "sync": [KEY_E]},
	{"up": [KEY_I], "down": [KEY_K], "left": [KEY_J], "right": [KEY_L], "brake": [KEY_U], "sync": [KEY_O]},
	{"up": [KEY_W, KEY_UP], "down": [KEY_S, KEY_DOWN], "left": [KEY_A, KEY_LEFT], "right": [KEY_D, KEY_RIGHT],
		"brake": [KEY_Q, KEY_SHIFT], "sync": [KEY_E, KEY_SPACE]},
]
const KEY_HELP := [
	"WASD move   Q brake   E pull together",
	"IJKL move   U brake   O pull together",
	"WASD/Arrows move   Q/Shift brake   E/Space pull together",
]

var slots: Array = []            # [{peer: 피어 id, keys: 키 배치 번호}] 인덱스 = 허스키 번호
var level: Node2D
var sled: RigidBody2D
var huskies: Array = []
var anchors: Array[Vector2] = []     # 썰매 기준 줄 연결 위치
var rope_lengths: Array[float] = []
var ropes_layer: Node2D
var camera: Camera2D
var elapsed := -COUNTDOWN
var running := true

# 서버 전용
var inputs: Array = []           # 허스키별 최신 입력 {dir, brake, seq}
var sync_press_time: Array[float] = []
var sync_cooldown := 0.0

# 이 컴퓨터의 입력 상태
var local_sync_seq := {}
var local_sync_held := {}

# 클라이언트 보간용
var has_state := false
var sled_target_pos := Vector2.ZERO
var sled_target_rot := 0.0
var husky_targets: Array[Vector2] = []

# 화면 표시
var timer_label: Label
var center_label: Label
var sync_fx_time := 0.0
var shake := 0.0


func setup(p_slots: Array) -> void:
	slots = p_slots
	level = LevelScript.new()
	add_child(level)
	ropes_layer = Node2D.new()
	ropes_layer.draw.connect(_draw_ropes)
	add_child(ropes_layer)

	var fwd: Vector2 = level.start_direction
	var side_dir := fwd.rotated(PI / 2)
	sled = SledScript.new()
	add_child(sled)
	sled.global_position = level.start_position
	sled.rotation = fwd.angle()

	var n := slots.size()
	var rows := (n + 1) >> 1
	for i in n:
		var row := i >> 1
		var side := 0.0 if (i % 2 == 0 and i == n - 1) else (-1.0 if i % 2 == 0 else 1.0)
		var rope_len := ROPE_BASE + row * ROPE_STEP
		anchors.append(Vector2(SledScript.HALF_LENGTH, side * 10.0))
		rope_lengths.append(rope_len)

		var h := HuskyScript.new()
		h.slot = i
		h.color = PLAYER_COLORS[i % PLAYER_COLORS.size()]
		h.label_text = "P%d" % (i + 1)
		if row == 0:
			h.role = "WHEEL"
		elif row == rows - 1:
			h.role = "LEAD"
		else:
			h.role = "SWING"
		h.can_brake = row == 0
		add_child(h)
		h.global_position = level.start_position + fwd * (SledScript.HALF_LENGTH + rope_len) + side_dir * side * 26.0
		h.facing = fwd.angle()
		huskies.append(h)
		husky_targets.append(h.global_position)
		inputs.append({"dir": Vector2.ZERO, "brake": false, "seq": 0})
		sync_press_time.append(-100.0)

	# 클라이언트는 물리 계산을 하지 않고 서버가 보낸 위치만 보여준다.
	if not multiplayer.is_server():
		sled.freeze = true
		for h in huskies:
			h.freeze = true

	camera = Camera2D.new()
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 5.0
	add_child(camera)
	camera.global_position = level.start_position
	camera.make_current()
	_build_hud()


## 서버: 접속이 끊긴 플레이어의 허스키는 힘이 빠진 채로 끌려다닌다.
func on_peer_left(peer_id: int) -> void:
	for i in slots.size():
		if int(slots[i]["peer"]) == peer_id:
			huskies[i].connected = false
			inputs[i] = {"dir": Vector2.ZERO, "brake": false, "seq": inputs[i]["seq"]}


func _physics_process(delta: float) -> void:
	_gather_local_input()
	if multiplayer.is_server():
		_server_step(delta)


func _process(delta: float) -> void:
	if not multiplayer.is_server() and has_state:
		var w := 1.0 - exp(-20.0 * delta)
		sled.global_position = sled.global_position.lerp(sled_target_pos, w)
		sled.rotation = lerp_angle(sled.rotation, sled_target_rot, w)
		for i in huskies.size():
			huskies[i].global_position = huskies[i].global_position.lerp(husky_targets[i], w)

	# 카메라는 썰매와 허스키들의 중간을 본다 → 자연스럽게 진행 방향이 더 넓게 보임
	var center := Vector2.ZERO
	for h in huskies:
		center += h.global_position
	center = (sled.global_position + center / huskies.size()) * 0.5
	camera.global_position = center
	shake = maxf(shake - delta * 30.0, 0.0)
	camera.offset = Vector2(randf_range(-shake, shake), randf_range(-shake, shake))

	sync_fx_time = maxf(sync_fx_time - delta, 0.0)
	_update_hud()
	ropes_layer.queue_redraw()


# ---------------------------------------------------------------- 입력

func _gather_local_input() -> void:
	var my_id := multiplayer.get_unique_id()
	for i in slots.size():
		if int(slots[i]["peer"]) != my_id:
			continue
		var scheme: Dictionary = KEY_SCHEMES[int(slots[i]["keys"])]
		var dir := Vector2(
			float(_any_pressed(scheme["right"])) - float(_any_pressed(scheme["left"])),
			float(_any_pressed(scheme["down"])) - float(_any_pressed(scheme["up"])))
		var brake := _any_pressed(scheme["brake"])
		# 버튼을 누른 "횟수"를 보내서 패킷이 하나 빠져도 누른 걸 놓치지 않게 한다.
		var sync_held := _any_pressed(scheme["sync"])
		if sync_held and not local_sync_held.get(i, false):
			local_sync_seq[i] = int(local_sync_seq.get(i, 0)) + 1
		local_sync_held[i] = sync_held
		var seq: int = local_sync_seq.get(i, 0)
		if multiplayer.is_server():
			_store_input(i, dir, brake, seq)
		else:
			_submit_input.rpc_id(1, i, dir, brake, seq)


func _any_pressed(keys: Array) -> bool:
	for k in keys:
		if Input.is_physical_key_pressed(k):
			return true
	return false


@rpc("any_peer", "call_remote", "unreliable_ordered")
func _submit_input(slot: int, dir: Vector2, brake: bool, seq: int) -> void:
	if not multiplayer.is_server() or slot < 0 or slot >= slots.size():
		return
	# 남의 허스키를 조종하는 패킷은 무시
	if int(slots[slot]["peer"]) != multiplayer.get_remote_sender_id():
		return
	_store_input(slot, dir, brake, seq)


func _store_input(slot: int, dir: Vector2, brake: bool, seq: int) -> void:
	var inp: Dictionary = inputs[slot]
	inp["dir"] = dir.limit_length(1.0)
	inp["brake"] = brake
	if seq != inp["seq"]:
		inp["seq"] = seq
		_on_sync_pressed(slot)


# ---------------------------------------------------------------- 서버 물리

func _server_step(delta: float) -> void:
	if not running:
		return
	elapsed += delta
	sync_cooldown = maxf(sync_cooldown - delta, 0.0)
	var racing := elapsed >= 0.0

	var braking_count := 0
	for i in huskies.size():
		var h = huskies[i]
		var dir: Vector2 = inputs[i]["dir"] if racing and h.connected else Vector2.ZERO
		h.braking = racing and h.connected and h.can_brake and inputs[i]["brake"]
		if h.braking:
			h.linear_damp = HUSKY_BRAKE_DAMP
			braking_count += 1
		else:
			h.linear_damp = HUSKY_DAMP
			if dir != Vector2.ZERO:
				var force := HUSKY_PULL_FORCE * (LEAD_PULL_BONUS if h.role == "LEAD" else 1.0)
				h.apply_central_force(dir.normalized() * force)
		if dir != Vector2.ZERO:
			h.facing = dir.angle()
		elif h.linear_velocity.length() > 30.0:
			h.facing = h.linear_velocity.angle()
		_apply_rope(i)

	# 썰매 마찰: 앞뒤로는 잘 미끄러지고, 옆으로는 조금 덜 미끄러진다 (드리프트)
	var mul := ICE_FACTOR if level.is_on_ice(sled.global_position) else 1.0
	sled.linear_damp = SLED_DAMP * mul + SLED_BRAKE_DAMP * braking_count
	var side := sled.global_transform.y.normalized()
	var side_speed := sled.linear_velocity.dot(side)
	sled.apply_central_force(-side * side_speed * SLED_SIDE_GRIP * mul * sled.mass)

	if level.is_at_goal(sled.global_position):
		running = false
		_finish.rpc(elapsed)
		return

	if not multiplayer.get_peers().is_empty():
		_receive_state.rpc(_pack_state())


## 줄은 늘어났을 때만 당긴다 (느슨할 땐 힘 없음). 썰매 앞쪽에 힘이 걸려서 썰매가 자연스럽게 돈다.
func _apply_rope(i: int) -> void:
	var h = huskies[i]
	var anchor_world := sled.to_global(anchors[i])
	var d: Vector2 = h.global_position - anchor_world
	var dist := d.length()
	if dist <= rope_lengths[i] or dist < 0.001:
		return
	var n := d / dist
	var r := anchor_world - sled.global_position
	var w := sled.angular_velocity
	var anchor_vel := sled.linear_velocity + Vector2(-w * r.y, w * r.x)
	var rel_speed: float = (h.linear_velocity - anchor_vel).dot(n)
	var f := maxf(ROPE_K * (dist - rope_lengths[i]) + ROPE_DAMP * rel_speed, 0.0)
	h.apply_central_force(-n * f)
	sled.apply_force(n * f, r)


## "같이 당기기": 연결된 모든 플레이어가 SYNC_WINDOW 안에 눌러야 썰매가 확 튀어나간다.
func _on_sync_pressed(slot: int) -> void:
	if not running or elapsed < 0.0:
		return
	sync_press_time[slot] = elapsed
	huskies[slot].sync_flash = SYNC_WINDOW
	if sync_cooldown > 0.0:
		return
	var dir := Vector2.ZERO
	for i in huskies.size():
		if not huskies[i].connected:
			continue
		if elapsed - sync_press_time[i] > SYNC_WINDOW:
			return
		dir += (huskies[i].global_position - sled.to_global(anchors[i])).normalized()
	dir = dir.normalized() if dir != Vector2.ZERO else sled.global_transform.x.normalized()
	sync_cooldown = SYNC_COOLDOWN
	for i in huskies.size():
		sync_press_time[i] = -100.0
	sled.apply_central_impulse(dir * SYNC_IMPULSE)
	for h in huskies:
		h.apply_central_impulse(dir * 120.0)
	_sync_fx.rpc()


func _pack_state() -> PackedFloat32Array:
	var s := PackedFloat32Array([elapsed, sled.global_position.x, sled.global_position.y, sled.rotation])
	for h in huskies:
		var flags := 0
		if h.braking:
			flags |= 1
		if h.sync_flash > 0.0:
			flags |= 2
		if not h.connected:
			flags |= 4
		s.append_array([h.global_position.x, h.global_position.y, h.facing, float(flags)])
	return s


# ---------------------------------------------------------------- 서버 → 모두

@rpc("authority", "call_remote", "unreliable_ordered")
func _receive_state(s: PackedFloat32Array) -> void:
	if s.size() != 4 + 4 * huskies.size():
		return
	elapsed = s[0]
	sled_target_pos = Vector2(s[1], s[2])
	sled_target_rot = s[3]
	for i in huskies.size():
		var o := 4 + i * 4
		var h = huskies[i]
		husky_targets[i] = Vector2(s[o], s[o + 1])
		h.facing = s[o + 2]
		var flags := int(s[o + 3])
		h.braking = flags & 1 != 0
		if flags & 2 != 0:
			h.sync_flash = 0.1
		h.connected = flags & 4 == 0
	if not has_state:
		has_state = true
		sled.global_position = sled_target_pos


@rpc("authority", "call_local", "reliable")
func _sync_fx() -> void:
	sync_fx_time = 0.8
	shake = 8.0


@rpc("authority", "call_local", "reliable")
func _finish(time_sec: float) -> void:
	running = false
	elapsed = time_sec
	finished.emit(time_sec)


# ---------------------------------------------------------------- 그리기 / HUD

func _draw_ropes() -> void:
	for i in huskies.size():
		var a := sled.to_global(anchors[i])
		var b: Vector2 = huskies[i].global_position
		var stretch := a.distance_to(b) / rope_lengths[i]
		var col := Color(0.3, 0.25, 0.2)
		if stretch < 0.97:
			# 느슨한 줄은 처지게 그린다
			var sag := (b - a).orthogonal().normalized() * (1.0 - stretch) * rope_lengths[i] * 0.35
			var pts := PackedVector2Array()
			for k in 9:
				var t := k / 8.0
				pts.append(a.lerp(b, t) + sag * 4.0 * t * (1.0 - t))
			ropes_layer.draw_polyline(pts, col, 2.5)
		else:
			col = col.lerp(Color(0.85, 0.15, 0.1), clampf((stretch - 1.0) * 6.0, 0.0, 1.0))
			ropes_layer.draw_line(a, b, col, 3.0)
		ropes_layer.draw_circle(a, 3.0, col)


func _build_hud() -> void:
	var hud := CanvasLayer.new()
	add_child(hud)
	timer_label = _make_label(hud, 30, Vector2(20, 14), Vector2(300, 40), HORIZONTAL_ALIGNMENT_LEFT)
	center_label = _make_label(hud, 72, Vector2(0, 170), Vector2(1280, 100), HORIZONTAL_ALIGNMENT_CENTER)

	var roster := ""
	for i in slots.size():
		var h = huskies[i]
		roster += "%s  %s%s\n" % [h.label_text, h.role, "  (can brake)" if h.can_brake else ""]
	var roster_label := _make_label(hud, 18, Vector2(960, 14), Vector2(300, 140), HORIZONTAL_ALIGNMENT_RIGHT)
	roster_label.text = roster

	var help := ""
	var my_id := multiplayer.get_unique_id()
	for i in slots.size():
		if int(slots[i]["peer"]) == my_id:
			help += "%s: %s\n" % [huskies[i].label_text, KEY_HELP[int(slots[i]["keys"])]]
	help += "Only WHEEL dogs (next to the sled) can brake. Everyone must press 'pull together' at once!"
	var help_label := _make_label(hud, 16, Vector2(20, 610), Vector2(1240, 100), HORIZONTAL_ALIGNMENT_LEFT)
	help_label.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	help_label.text = help


func _make_label(parent: Node, size: int, pos: Vector2, box: Vector2, align: HorizontalAlignment) -> Label:
	var label := Label.new()
	label.position = pos
	label.size = box
	label.horizontal_alignment = align
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", Color(0.12, 0.18, 0.3))
	label.add_theme_color_override("font_outline_color", Color.WHITE)
	label.add_theme_constant_override("outline_size", 6)
	parent.add_child(label)
	return label


func _update_hud() -> void:
	timer_label.text = "%.1f s" % maxf(elapsed, 0.0)
	if elapsed < 0.0:
		center_label.text = str(ceili(-elapsed))
	elif elapsed < 0.8:
		center_label.text = "GO!"
	elif sync_fx_time > 0.0:
		center_label.text = "PULL TOGETHER!"
	else:
		center_label.text = ""
