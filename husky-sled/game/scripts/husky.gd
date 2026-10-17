extends RigidBody3D
## 허스키 한 마리 = 플레이어 한 명.
## - 이동은 "목표 속도로 맞추려는 힘"을 주는 방식이라 줄, 다른 허스키, 썰매와의 힘겨루기가 물리로 자연스럽게 나온다.
## - 입력은 set_input()으로만 받는다. (나중에 네트워크에서 받은 입력도 그대로 넣으면 됨)
## - 앞쪽은 -Z 방향.

const T = preload("res://scripts/tuning.gd")
const SledScript = preload("res://scripts/sled.gd")

signal knocked_down(husky)

var seat := 0                 # 0 좌 휠견, 1 좌 리더견, 2 우 휠견, 3 우 리더견
var is_wheel := true
var player_color := Color.WHITE

# 입력
var move := Vector3.ZERO      # 월드 기준 수평 방향 (길이 0~1)
var sprint_held := false
var jump_requested := false

# 상태
var stamina := T.STAMINA_MAX
var exhausted := false
var sprinting := false
var grounded := false
var knocked := false
var knock_timer := 0.0
var hanging := false
var rope_taut := false        # 줄 스크립트가 매 프레임 알려줌
var rope_pull_dir := Vector3.ZERO

var _yaw := 0.0
var _vel_before_step := Vector3.ZERO
var _stand_up := false
var _visual: Node3D
var _body_mat: StandardMaterial3D
var _nameplate: Label3D
var _highlight := false


func setup(p_seat: int, color: Color) -> void:
	seat = p_seat
	is_wheel = seat % 2 == 0
	player_color = color


func _init() -> void:
	mass = T.HUSKY_MASS
	can_sleep = false
	axis_lock_angular_x = true
	axis_lock_angular_z = true
	contact_monitor = true
	max_contacts_reported = 8
	collision_layer = 4
	collision_mask = 1 | 2 | 4 | 8 | 32   # 32 = 썰매 전용 막
	var mat := PhysicsMaterial.new()
	mat.friction = 0.0   # 접지력은 스크립트의 힘으로 처리
	mat.bounce = 0.05
	physics_material_override = mat

	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.3
	capsule.height = 1.05
	var shape := CollisionShape3D.new()
	shape.shape = capsule
	shape.rotation_degrees.x = 90.0   # 몸을 앞뒤로 눕힘
	shape.position.y = 0.32
	add_child(shape)
	body_entered.connect(_on_body_entered)


func _ready() -> void:
	_yaw = rotation.y
	_build_visual()


func set_input(p_move: Vector3, p_sprint: bool, p_jump: bool) -> void:
	move = Vector3(p_move.x, 0, p_move.z).limit_length(1.0)
	sprint_held = p_sprint
	if p_jump:
		jump_requested = true


func set_highlight(on: bool) -> void:
	_highlight = on


func _physics_process(delta: float) -> void:
	_vel_before_step = linear_velocity
	_update_stamina(delta)

	if knocked:
		knock_timer -= delta
		if knock_timer <= 0.0:
			_stand_up = true
		jump_requested = false
		return

	var has_input := move.length() > 0.05
	hanging = not grounded and rope_taut and rope_pull_dir.y > 0.5

	# 수평 이동: 목표 속도와의 차이만큼 힘을 주되, 낼 수 있는 힘에는 한계가 있다.
	var speed := T.SPRINT_SPEED if sprinting else T.WALK_SPEED
	var max_force: float
	if has_input:
		max_force = T.SPRINT_FORCE if sprinting else T.WALK_FORCE
	else:
		max_force = T.IDLE_GRIP_FORCE
	if not grounded:
		max_force = max_force * T.AIR_CONTROL if has_input else 0.0
	var vh := Vector3(linear_velocity.x, 0, linear_velocity.z)
	var force := ((move * speed) - vh) * T.ACCEL_GAIN * mass
	apply_central_force(force.limit_length(max_force))

	# 매달려서 버둥거리기: 혼자서는 못 올라오지만 동료가 당길 때 조금 도움이 됨
	if hanging and has_input:
		apply_central_force(Vector3.UP * T.HANG_CLIMB_FORCE)

	if jump_requested and grounded:
		linear_velocity.y = T.JUMP_VELOCITY
	jump_requested = false

	# 몸 방향: 입력 방향으로 돌기
	if has_input:
		var target_yaw := atan2(-move.x, -move.z)
		_yaw = lerp_angle(_yaw, target_yaw, clampf(T.TURN_SPEED * delta, 0.0, 1.0))
	angular_velocity.y = wrapf(_yaw - rotation.y, -PI, PI) * 20.0


func _update_stamina(delta: float) -> void:
	var wants_sprint := sprint_held and move.length() > 0.05 and not knocked
	if exhausted and stamina >= T.STAMINA_MIN_TO_START:
		exhausted = false
	sprinting = wants_sprint and not exhausted and stamina > 0.0
	if sprinting:
		stamina = maxf(stamina - T.STAMINA_DRAIN * delta, 0.0)
		if stamina <= 0.0:
			exhausted = true
	else:
		stamina = minf(stamina + T.STAMINA_REGEN * delta, T.STAMINA_MAX)


func _integrate_forces(state: PhysicsDirectBodyState3D) -> void:
	# 발밑 판정: 위쪽을 향한 접촉이 있으면 땅에 서 있는 것 (썰매 위는 제외 → 썰매에 올라탈 수 없음)
	var g := false
	for i in state.get_contact_count():
		if state.get_contact_local_normal(i).y > 0.55 and not (state.get_contact_collider_object(i) is SledScript):
			g = true
			break
	grounded = g

	if _stand_up:
		# 일어나기: 똑바로 세우고 다시 회전 잠금
		_stand_up = false
		knocked = false
		state.transform.basis = Basis(Vector3.UP, _yaw)
		state.angular_velocity = Vector3.ZERO
		axis_lock_angular_x = true
		axis_lock_angular_z = true


func knock_down() -> void:
	if knocked:
		return
	knocked = true
	knock_timer = T.KNOCKDOWN_TIME
	axis_lock_angular_x = false
	axis_lock_angular_z = false
	apply_torque_impulse(Vector3(randf_range(-1, 1), 0, randf_range(-1, 1)).normalized() * 4.0)
	knocked_down.emit(self)


func _on_body_entered(body: Node) -> void:
	if knocked:
		return
	# 이번 물리 스텝에서 내 속도가 얼마나 확 바뀌었는지 = 받은 충격
	var hit := (linear_velocity - _vel_before_step).length()
	if body is SledScript and hit > T.KNOCKDOWN_SPEED_SLED:
		knock_down()
	elif body.get_script() == get_script() and hit > T.KNOCKDOWN_SPEED_HUSKY:
		knock_down()


# ---------------------------------------------------------------- 겉모습 (그레이박스용 임시 모델)

func _process(_delta: float) -> void:
	if _body_mat == null:
		return
	if _highlight:
		var pulse := 0.5 + 0.5 * sin(Time.get_ticks_msec() * 0.012)
		_body_mat.emission_enabled = true
		_body_mat.emission = Color(1, 0.95, 0.6) * (0.4 + pulse * 0.8)
	else:
		_body_mat.emission_enabled = false
	_nameplate.modulate.a = 0.55 if knocked else 1.0


func _build_visual() -> void:
	_visual = Node3D.new()
	add_child(_visual)
	_body_mat = _mat(Color(0.45, 0.5, 0.57))
	var white := _mat(Color(0.96, 0.96, 0.96))
	var dark := _mat(Color(0.12, 0.12, 0.14))

	var body := CapsuleMesh.new()
	body.radius = 0.3
	body.height = 1.05
	_add_mesh(body, _body_mat, Vector3(0, 0.38, 0), Vector3(90, 0, 0))
	var belly := CapsuleMesh.new()
	belly.radius = 0.22
	belly.height = 0.8
	_add_mesh(belly, white, Vector3(0, 0.3, 0.02), Vector3(90, 0, 0))
	var head := SphereMesh.new()
	head.radius = 0.26
	head.height = 0.48
	_add_mesh(head, _body_mat, Vector3(0, 0.68, -0.55))
	var snout := SphereMesh.new()
	snout.radius = 0.13
	snout.height = 0.2
	_add_mesh(snout, white, Vector3(0, 0.6, -0.78))
	var nose := SphereMesh.new()
	nose.radius = 0.045
	nose.height = 0.08
	_add_mesh(nose, dark, Vector3(0, 0.63, -0.9))
	for side in [-1.0, 1.0]:
		var ear := PrismMesh.new()
		ear.size = Vector3(0.14, 0.2, 0.08)
		_add_mesh(ear, _body_mat, Vector3(side * 0.13, 0.92, -0.52))
		var eye := SphereMesh.new()
		eye.radius = 0.04
		eye.height = 0.08
		_add_mesh(eye, dark, Vector3(side * 0.1, 0.74, -0.76))
		for z in [-0.3, 0.3]:
			var leg := CapsuleMesh.new()
			leg.radius = 0.07
			leg.height = 0.34
			_add_mesh(leg, _body_mat, Vector3(side * 0.17, 0.13, z))
	var tail := CapsuleMesh.new()
	tail.radius = 0.07
	tail.height = 0.42
	_add_mesh(tail, _body_mat, Vector3(0, 0.62, 0.58), Vector3(-40, 0, 0))

	# 이름표: 허스키 색은 그대로 두고 이름표를 플레이어 색으로 진하게
	_nameplate = Label3D.new()
	_nameplate.text = "P%d" % (seat + 1)
	_nameplate.font_size = 64
	_nameplate.outline_size = 18
	_nameplate.modulate = player_color
	_nameplate.outline_modulate = player_color.darkened(0.6)
	_nameplate.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_nameplate.no_depth_test = true   # 벽 너머에서도 보임
	_nameplate.fixed_size = true
	_nameplate.pixel_size = 0.0009
	_nameplate.position = Vector3(0, 1.35, 0)
	add_child(_nameplate)


func _add_mesh(mesh: Mesh, mat: Material, pos: Vector3, rot_deg := Vector3.ZERO) -> void:
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = mat
	mi.position = pos
	mi.rotation_degrees = rot_deg
	_visual.add_child(mi)


func _mat(c: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = 0.9
	return m
