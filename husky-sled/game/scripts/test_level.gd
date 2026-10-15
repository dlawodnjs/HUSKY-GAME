extends Node3D
## 물리 테스트용 맵 (그레이박스). 앞쪽(-Z)으로 진행한다.
##   시작 평원(나무, 점프대) → 좁은 절벽길(양옆이 공허) → 빙판 → 내리막 → 아래 평원의 도착 지점
## 맵 밖은 바닥이 없는 공허라서, 허스키가 떨어지면 줄에 매달린다.

const START := Vector3(0, 0.05, 4)
const GOAL := Vector3(0, -4, -116)
const GOAL_RADIUS := 4.0

var start_transform := Transform3D(Basis.IDENTITY, START)

var _no_friction := PhysicsMaterial.new()   # 지형 마찰 0: 썰매/허스키 마찰은 스크립트가 직접 계산
var _snow: StandardMaterial3D
var _cliff: StandardMaterial3D
var _ice: StandardMaterial3D


func _init() -> void:
	_no_friction.friction = 0.0
	_snow = _mat(Color(0.93, 0.95, 1.0), 0.95)
	_cliff = _mat(Color(0.62, 0.68, 0.78), 1.0)
	_ice = _mat(Color(0.62, 0.84, 0.98), 0.15)

	# 시작 평원 (z 10 ~ -30, 폭 40)
	_ground(Vector3(40, 4, 40), Vector3(0, -2, -10))
	# 좁은 절벽길 (z -30 ~ -45, 폭 8)
	_ground(Vector3(8, 4, 15), Vector3(0, -2, -37.5))
	# 넓은 평원 + 빙판 (z -45 ~ -60)
	_ground(Vector3(30, 4, 15), Vector3(0, -2, -52.5))
	var ice := _ground(Vector3(14, 0.04, 10), Vector3(0, 0.02, -52), _ice)
	ice.set_meta("ice", true)
	# 내리막 (z -60 ~ -80, 4m 내려감)
	var angle := atan2(4.0, 20.0)
	var slope := StaticBody3D.new()
	var normal := Vector3(0, cos(angle), -sin(angle))
	slope.position = Vector3(0, -2, -70) - normal * 0.5
	slope.rotation.x = -angle
	_add_box(slope, Vector3(20, 1, 20.4 + 0.6), _snow)
	add_child(slope)
	# 아래 평원 (z -80 ~ -125)
	_ground(Vector3(30, 4, 45), Vector3(0, -6, -102.5))

	# 나무
	for p in [Vector3(-6, 0, -8), Vector3(5, 0, -12), Vector3(-2, 0, -20), Vector3(9, 0, -24),
			Vector3(-12, 0, -16), Vector3(-6, -4, -95), Vector3(7, -4, -100)]:
		_tree(p)
	# 점프대 (시작 평원 오른쪽)
	var ramp := StaticBody3D.new()
	ramp.position = Vector3(12, 0.45, -6)
	ramp.rotation.x = deg_to_rad(18)
	_add_box(ramp, Vector3(4, 0.3, 4), _mat(Color(0.75, 0.6, 0.45), 0.8))
	add_child(ramp)

	_goal_marker()


func is_at_goal(pos: Vector3) -> bool:
	return Vector2(pos.x - GOAL.x, pos.z - GOAL.z).length() < GOAL_RADIUS and absf(pos.y - GOAL.y) < 2.0


func _ground(size: Vector3, pos: Vector3, mat: StandardMaterial3D = null) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.position = pos
	_add_box(body, size, mat if mat else _snow)
	# 옆면(절벽)은 다른 색으로 보이게 살짝 작은 상자를 아래에 하나 더
	if mat == null:
		var side := MeshInstance3D.new()
		var bm := BoxMesh.new()
		bm.size = size + Vector3(0.02, -0.3, 0.02)
		side.mesh = bm
		side.position.y = -0.16
		side.material_override = _cliff
		body.add_child(side)
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
	tm.inner_radius = GOAL_RADIUS - 0.25
	tm.outer_radius = GOAL_RADIUS
	ring.mesh = tm
	ring.position = GOAL + Vector3(0, 0.05, 0)
	ring.material_override = _mat(Color(1, 0.75, 0.15), 0.6)
	add_child(ring)
	var pole := MeshInstance3D.new()
	var pm := CylinderMesh.new()
	pm.top_radius = 0.06
	pm.bottom_radius = 0.06
	pm.height = 3.5
	pole.mesh = pm
	pole.position = GOAL + Vector3(GOAL_RADIUS, 1.75, 0)
	pole.material_override = _mat(Color(0.3, 0.3, 0.3), 0.6)
	add_child(pole)
	var flag := MeshInstance3D.new()
	var fm := BoxMesh.new()
	fm.size = Vector3(1.2, 0.7, 0.04)
	flag.mesh = fm
	flag.position = GOAL + Vector3(GOAL_RADIUS + 0.6, 3.1, 0)
	flag.material_override = _mat(Color(0.9, 0.2, 0.2), 0.7)
	add_child(flag)


func _mat(c: Color, rough: float) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = rough
	return m
