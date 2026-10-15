extends Node3D
## 물리 테스트 장면 (오프라인, 혼자서 테스트).
## - 허스키 4마리 중 1마리를 조종하고, 1~4 키로 조종할 허스키를 바꾼다.
## - 나머지 3마리는 개발용 봇: B 키로 "가만히 있기" / "내 입력 따라하기" 전환.
## 네트워크는 다음 단계에서 붙인다. 모든 허스키는 set_input()으로만 움직이므로 그대로 연결 가능.

const T = preload("res://scripts/tuning.gd")
const LevelScript = preload("res://scripts/test_level.gd")
const SledScript = preload("res://scripts/sled.gd")
const HuskyScript = preload("res://scripts/husky.gd")
const RopeScript = preload("res://scripts/rope.gd")
const CargoScript = preload("res://scripts/cargo.gd")
const CameraRigScript = preload("res://scripts/camera_rig.gd")

const SEAT_NAMES := ["L-Wheel", "L-Leader", "R-Wheel", "R-Leader"]
const BOT_MODES := ["Idle", "Copy my input"]
const CARGO_COLORS := [Color("e57373"), Color("64b5f6"), Color("ffd54f"), Color("81c784"), Color("ba68c8"), Color("ffb74d")]

var world: Node3D
var level: Node3D
var sled: RigidBody3D
var huskies: Array = []
var ropes: Array = []
var cargos: Array = []
var rig: Node3D

var controlled := 0
var bot_mode := 1
var state := "play"           # play / failed / delivered
var state_timer := 0.0
var elapsed := 0.0
var _jump_was_held := false

var _cargo_label: Label
var _info_label: Label
var _center_label: Label
var _stamina_bar: ProgressBar
var _debug_label: Label


func _ready() -> void:
	_build_environment()
	rig = CameraRigScript.new()
	add_child(rig)
	_build_hud()
	start_stage()


func start_stage() -> void:
	if world:
		remove_child(world)
		world.queue_free()
	huskies.clear()
	ropes.clear()
	cargos.clear()
	world = Node3D.new()
	add_child(world)

	level = LevelScript.new()
	world.add_child(level)
	sled = SledScript.new()
	world.add_child(sled)
	sled.global_transform = level.start_transform

	for seat in 4:
		var h := HuskyScript.new()
		h.setup(seat, T.PLAYER_COLORS[seat])
		world.add_child(h)
		var hook: Vector3 = sled.hook_for_seat(seat)
		var rope_len := T.ROPE_WHEEL_LENGTH if seat % 2 == 0 else T.ROPE_LEADER_LENGTH
		var side := -0.55 if seat < 2 else 0.55
		h.global_position = sled.to_global(Vector3(side, 0.05, hook.z - rope_len + 0.4))
		h.global_rotation = sled.global_rotation
		huskies.append(h)
		var rope := RopeScript.new()
		rope.setup(h, sled, hook, rope_len)
		world.add_child(rope)
		ropes.append(rope)

	# 화물: 아래층 4개 + 위층 2개 (높이 쌓일수록 잘 떨어짐)
	var y1: float = sled.BED_TOP + T.CARGO_SIZE.y * 0.5 + 0.01
	var y2: float = y1 + T.CARGO_SIZE.y + 0.01
	var slots := [Vector3(-0.23, y1, -0.3), Vector3(0.23, y1, -0.3), Vector3(-0.23, y1, 0.3),
			Vector3(0.23, y1, 0.3), Vector3(-0.23, y2, 0.0), Vector3(0.23, y2, 0.0)]
	for i in T.CARGO_COUNT:
		var c := CargoScript.new()
		c.setup(sled, CARGO_COLORS[i % CARGO_COLORS.size()])
		world.add_child(c)
		c.global_position = sled.to_global(slots[i])
		c.lost.connect(_on_cargo_lost)
		cargos.append(c)

	rig.sled = sled
	_set_controlled(controlled)
	state = "play"
	elapsed = 0.0
	_center_label.text = ""


func _set_controlled(i: int) -> void:
	if not huskies.is_empty():
		huskies[controlled].set_highlight(false)
	controlled = i
	rig.target_husky = huskies[i]
	rig.snap_to_target()


func cargo_left() -> int:
	var n := 0
	for c in cargos:
		if not c.is_lost:
			n += 1
	return n


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_1, KEY_2, KEY_3, KEY_4:
				_set_controlled(event.physical_keycode - KEY_1)
			KEY_B:
				bot_mode = (bot_mode + 1) % BOT_MODES.size()
			KEY_R:
				start_stage()
			KEY_ESCAPE:
				Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _physics_process(delta: float) -> void:
	# 내 입력 (카메라 기준 이동)
	var raw := Vector2(
		float(Input.is_physical_key_pressed(KEY_D)) - float(Input.is_physical_key_pressed(KEY_A)),
		float(Input.is_physical_key_pressed(KEY_W)) - float(Input.is_physical_key_pressed(KEY_S)))
	var move: Vector3 = rig.flat_right() * raw.x + rig.flat_forward() * raw.y
	var sprint := Input.is_physical_key_pressed(KEY_SHIFT)
	var jump_held := Input.is_physical_key_pressed(KEY_SPACE)
	var jump := jump_held and not _jump_was_held
	_jump_was_held = jump_held

	for i in huskies.size():
		if i == controlled or bot_mode == 1:
			huskies[i].set_input(move, sprint, jump)
		else:
			huskies[i].set_input(Vector3.ZERO, false, false)

	match state:
		"play":
			elapsed += delta
			if cargo_left() == 0 or sled.global_position.y < T.VOID_Y:
				_fail()
			elif level.is_at_goal(sled.global_position):
				_deliver()
		"failed":
			state_timer -= delta
			if state_timer <= 0.0:
				start_stage()   # 실패하면 바로 재시작
		"delivered":
			state_timer -= delta
			if state_timer <= 0.0:
				start_stage()


func _on_cargo_lost(_cargo) -> void:
	pass


func _fail() -> void:
	state = "failed"
	state_timer = 1.2
	_center_label.text = "All cargo lost..."


func _deliver() -> void:
	state = "delivered"
	state_timer = 4.0
	var left := cargo_left()
	var stars := 3 if left == T.CARGO_COUNT else (2 if left >= 4 else 1)
	_center_label.text = "Delivered!  %s\n%d / %d cargo   %.1f s" % ["★".repeat(stars) + "☆".repeat(3 - stars), left, T.CARGO_COUNT, elapsed]


func _process(_delta: float) -> void:
	if huskies.is_empty():
		return
	var h = huskies[controlled]
	_cargo_label.text = "Cargo %d / %d     %.1f s" % [cargo_left(), T.CARGO_COUNT, elapsed]
	_info_label.text = "You: P%d %s\nBots: %s  [B]" % [controlled + 1, SEAT_NAMES[controlled], BOT_MODES[bot_mode]]
	_stamina_bar.value = h.stamina
	_stamina_bar.modulate = Color(1, 0.5, 0.4) if h.exhausted else Color.WHITE
	var dbg := "Sled speed %.1f m/s%s\n" % [sled.linear_velocity.length(), "  ICE" if sled.on_ice else ""]
	for i in ropes.size():
		var hh = huskies[i]
		dbg += "P%d rope %4.0f N%s%s\n" % [i + 1, ropes[i].tension_smooth, "  HANGING" if hh.hanging else "", "  DOWN" if hh.knocked else ""]
	_debug_label.text = dbg


# ---------------------------------------------------------------- 화면 구성

func _build_environment() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.45, 0.62, 0.85)
	sky_mat.sky_horizon_color = Color(0.82, 0.88, 0.95)
	sky_mat.ground_bottom_color = Color(0.2, 0.24, 0.32)
	sky_mat.ground_horizon_color = Color(0.7, 0.76, 0.85)
	sky.sky_material = sky_mat
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, 35, 0)
	sun.shadow_enabled = true
	sun.light_energy = 1.1
	add_child(sun)


func _build_hud() -> void:
	var hud := CanvasLayer.new()
	add_child(hud)
	_cargo_label = _label(hud, 30, Vector2(24, 18), Vector2(600, 50))
	_info_label = _label(hud, 20, Vector2(1100, 18), Vector2(480, 60))
	_info_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_center_label = _label(hud, 44, Vector2(0, 260), Vector2(1600, 140))
	_center_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_debug_label = _label(hud, 16, Vector2(24, 70), Vector2(400, 140))

	_stamina_bar = ProgressBar.new()
	_stamina_bar.max_value = T.STAMINA_MAX
	_stamina_bar.show_percentage = false
	_stamina_bar.position = Vector2(650, 840)
	_stamina_bar.size = Vector2(300, 18)
	var bg := StyleBoxFlat.new()
	bg.bg_color = Color(0, 0, 0, 0.35)
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color(0.45, 0.85, 1.0)
	_stamina_bar.add_theme_stylebox_override("background", bg)
	_stamina_bar.add_theme_stylebox_override("fill", fill)
	hud.add_child(_stamina_bar)

	var help := _label(hud, 16, Vector2(24, 790), Vector2(1000, 100))
	help.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	help.text = "WASD move   Shift sprint   Space jump   Right-drag look   Hold Tab sled view\n1-4 switch husky   B bot mode   R restart"


func _label(parent: Node, size: int, pos: Vector2, box: Vector2) -> Label:
	var l := Label.new()
	l.position = pos
	l.size = box
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.8))
	l.add_theme_constant_override("outline_size", 6)
	parent.add_child(l)
	return l
