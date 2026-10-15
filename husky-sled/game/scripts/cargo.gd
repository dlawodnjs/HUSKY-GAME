extends RigidBody3D
## 화물 상자 1개. 떨어지는 기준은 물리엔진뿐이다.
## 썰매 짐칸 범위를 벗어나면 "떨어짐"으로 처리하고, 한 번 떨어지면 손상되어 복구되지 않는다.

const T = preload("res://scripts/tuning.gd")

signal lost(cargo)

var sled: RigidBody3D
var is_lost := false
var _outside_time := 0.0
var _mat: StandardMaterial3D


func _init() -> void:
	mass = T.CARGO_MASS
	can_sleep = false
	collision_layer = 8
	collision_mask = 1 | 2 | 4 | 8
	var pm := PhysicsMaterial.new()
	pm.friction = T.CARGO_FRICTION
	pm.bounce = 0.1
	physics_material_override = pm
	var box := BoxShape3D.new()
	box.size = T.CARGO_SIZE
	var shape := CollisionShape3D.new()
	shape.shape = box
	add_child(shape)


func setup(p_sled: RigidBody3D, color: Color) -> void:
	sled = p_sled
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = color
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = T.CARGO_SIZE
	mi.mesh = bm
	mi.material_override = _mat
	add_child(mi)
	# 끈 무늬
	var strap := MeshInstance3D.new()
	var sm := BoxMesh.new()
	sm.size = Vector3(T.CARGO_SIZE.x + 0.01, T.CARGO_SIZE.y + 0.01, 0.06)
	strap.mesh = sm
	var strap_mat := StandardMaterial3D.new()
	strap_mat.albedo_color = Color(0.95, 0.9, 0.75)
	strap.material_override = strap_mat
	add_child(strap)


func _physics_process(delta: float) -> void:
	if is_lost or sled == null:
		return
	var p := sled.to_local(global_position)
	var outside := absf(p.x) > 0.62 or absf(p.z) > 1.15 or p.y < 0.25
	_outside_time = _outside_time + delta if outside else 0.0
	if _outside_time > 0.12 or global_position.y < T.VOID_Y:
		is_lost = true
		_mat.albedo_color = _mat.albedo_color.darkened(0.55)   # 손상 표시
		lost.emit(self)
