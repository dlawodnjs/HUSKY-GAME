extends Node3D
## 맵 공통 도구. 맵 스크립트는 이 파일을 extends 해서 _init()에서 땅과 장애물을 쌓는다.
## 앞쪽은 -Z. 맵 밖은 바닥이 없는 공허라서, 허스키가 떨어지면 줄에 매달린다.
## 맵이 꼭 채워야 하는 값: level_name, start_transform, goal_pos, goal_radius

var level_name := ""
var start_transform := Transform3D(Basis.IDENTITY, Vector3(0, 0.05, 4))
var goal_pos := Vector3.ZERO
var goal_radius := 4.0

var _no_friction := PhysicsMaterial.new()   # 지형 마찰 0: 썰매/허스키 마찰은 스크립트가 직접 계산
var _snow: StandardMaterial3D
var _cliff: StandardMaterial3D
var _ice: StandardMaterial3D


func _init() -> void:
	_no_friction.friction = 0.0
	_snow = _mat(Color(0.93, 0.95, 1.0), 0.95)
	_cliff = _mat(Color(0.62, 0.68, 0.78), 1.0)
	_ice = _mat(Color(0.62, 0.84, 0.98), 0.15)


func is_at_goal(pos: Vector3) -> bool:
	return Vector2(pos.x - goal_pos.x, pos.z - goal_pos.z).length() < goal_radius and absf(pos.y - goal_pos.y) < 2.0


## 땅 한 덩어리. 윗면 0.3m는 top_mat 색이고 그 아래 옆면은 절벽 색으로 보인다.
func _ground(size: Vector3, pos: Vector3, top_mat: StandardMaterial3D = null, cliff := true) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.position = pos
	_add_box(body, size, top_mat if top_mat else _snow)
	if cliff:
		var side := MeshInstance3D.new()
		var bm := BoxMesh.new()
		bm.size = size + Vector3(0.02, -0.3, 0.02)
		side.mesh = bm
		side.position.y = -0.16
		side.material_override = _cliff
		body.add_child(side)
	add_child(body)
	return body


## 썰매 전용 막. 허스키만 막고(충돌 레이어 32) 썰매와 화물은 그냥 통과한다. 반투명하게 보인다.
func _dog_curtain(size: Vector3, pos: Vector3) -> void:
	var body := StaticBody3D.new()
	body.position = pos
	body.collision_layer = 32
	body.collision_mask = 0
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = size
	shape.shape = box
	body.add_child(shape)
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = size
	mi.mesh = bm
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.45, 0.75, 1.0, 0.22)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.emission_enabled = true
	m.emission = Color(0.3, 0.6, 1.0)
	m.emission_energy_multiplier = 0.35
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	mi.material_override = m
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	body.add_child(mi)
	add_child(body)


## 빙판 조각. 부딪히지 않는 평평한 표시라서 턱이 생기지 않는다.
## 썰매가 바닥을 조사할 때(레이캐스트, 충돌 레이어 16)만 감지되어서 마찰이 줄어든다.
## pos.y는 그 자리 땅 윗면 높이.
func _ice_patch(size: Vector2, pos: Vector3) -> void:
	var body := StaticBody3D.new()
	body.position = pos
	body.collision_layer = 16
	body.collision_mask = 0
	body.set_meta("ice", true)
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(size.x, 0.02, size.y)
	shape.shape = box
	shape.position.y = -0.009        # 윗면이 땅보다 1mm 위라서 레이가 먼저 맞음
	body.add_child(shape)
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(size.x, 0.01, size.y)
	mi.mesh = bm
	mi.position.y = -0.002
	mi.material_override = _ice
	body.add_child(mi)
	add_child(body)


## 허스키는 뛰어넘을 수 있고 썰매는 못 넘는 낮은 벽
func _wall(size: Vector3, pos: Vector3, mat: StandardMaterial3D = null) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.position = pos
	_add_box(body, size, mat if mat else _cliff)
	add_child(body)
	return body


## 경사로. 낮은 쪽 끝(z_low, 높이 0)에서 시작해서 -Z 방향으로 올라간다.
func _ramp_up(x: float, width: float, z_low: float, length: float, angle: float, mat: StandardMaterial3D) -> StaticBody3D:
	var thick := 0.3
	var run := length * cos(angle)
	var rise := length * sin(angle)
	var body := StaticBody3D.new()
	body.rotation.x = angle
	body.position = Vector3(x, rise * 0.5 - thick * 0.5 * cos(angle), z_low - run * 0.5 - thick * 0.5 * sin(angle))
	_add_box(body, Vector3(width, thick, length), mat)
	add_child(body)
	return body


func _add_box(body: StaticBody3D, size: Vector3, mat: StandardMaterial3D) -> void:
	body.physics_material_override = _no_friction
	body.collision_layer = 1
	body.collision_mask = 0
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = size
	shape.shape = box
	body.add_child(shape)
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = size
	mi.mesh = bm
	mi.material_override = mat
	body.add_child(mi)


func _tree(pos: Vector3) -> void:
	var body := StaticBody3D.new()
	body.position = pos
	body.physics_material_override = _no_friction
	body.collision_layer = 1
	body.collision_mask = 0
	var shape := CollisionShape3D.new()
	var cyl := CylinderShape3D.new()
	cyl.radius = 0.6
	cyl.height = 4.0
	shape.shape = cyl
	shape.position.y = 2.0
	body.add_child(shape)
	var trunk := MeshInstance3D.new()
	var tm := CylinderMesh.new()
	tm.top_radius = 0.25
	tm.bottom_radius = 0.3
	tm.height = 1.2
	trunk.mesh = tm
	trunk.position.y = 0.6
	trunk.material_override = _mat(Color(0.4, 0.28, 0.18), 1.0)
	body.add_child(trunk)
	for i in 3:
		var cone := MeshInstance3D.new()
		var cm := CylinderMesh.new()
		cm.top_radius = 0.0
		cm.bottom_radius = 1.4 - i * 0.35
		cm.height = 1.6
		cone.mesh = cm
		cone.position.y = 1.6 + i * 0.9
		cone.material_override = _mat(Color(0.16, 0.45, 0.3).lightened(i * 0.06), 1.0)
		body.add_child(cone)
	add_child(body)


func _goal_marker() -> void:
	var ring := MeshInstance3D.new()
	var tm := TorusMesh.new()
	tm.inner_radius = goal_radius - 0.25
	tm.outer_radius = goal_radius
	ring.mesh = tm
	ring.position = goal_pos + Vector3(0, 0.05, 0)
	ring.material_override = _mat(Color(1, 0.75, 0.15), 0.6)
	add_child(ring)
	var pole := MeshInstance3D.new()
	var pm := CylinderMesh.new()
	pm.top_radius = 0.06
	pm.bottom_radius = 0.06
	pm.height = 3.5
	pole.mesh = pm
	pole.position = goal_pos + Vector3(goal_radius, 1.75, 0)
	pole.material_override = _mat(Color(0.3, 0.3, 0.3), 0.6)
	add_child(pole)
	var flag := MeshInstance3D.new()
	var fm := BoxMesh.new()
	fm.size = Vector3(1.2, 0.7, 0.04)
	flag.mesh = fm
	flag.position = goal_pos + Vector3(goal_radius + 0.6, 3.1, 0)
	flag.material_override = _mat(Color(0.9, 0.2, 0.2), 0.7)
	add_child(flag)


func _mat(c: Color, rough: float) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = rough
	return m
