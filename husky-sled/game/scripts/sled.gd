extends RigidBody3D
## 썰매. 앞쪽은 -Z.
## 바닥과의 마찰은 물리 재질 대신 직접 계산한다 (지형 재질의 마찰이 0이라 물리엔진 마찰은 생기지 않음):
##   앞뒤로는 아주 잘 미끄러지고(관성 큼), 옆으로는 조금 더 버틴다(드리프트).
## 빙판(ice 메타가 붙은 바닥)에서는 마찰이 크게 줄어든다.

const T = preload("res://scripts/tuning.gd")

const BED_TOP := 0.39
const HALF_WIDTH := 0.5
const HALF_LENGTH := 1.0
## 줄 고리 위치 (썰매 기준). 왼쪽 고리에 좌 휠견+좌 리더견, 오른쪽 고리에 우 휠견+우 리더견.
const HOOK_LEFT := Vector3(-0.35, 0.35, -1.08)
const HOOK_RIGHT := Vector3(0.35, 0.35, -1.08)

var grounded := false
var on_ice := false
var ground_normal := Vector3.UP


func _init() -> void:
	mass = T.SLED_MASS
	can_sleep = false
	collision_layer = 2
	collision_mask = 1 | 4 | 8
	var mat := PhysicsMaterial.new()
	mat.friction = 0.9   # 짐칸 위 화물이 버티는 마찰. 지형과는 낮은 쪽(0)이 적용됨
	mat.bounce = 0.15
	physics_material_override = mat

	# 날(러너) 2개, 바닥판, 낮은 난간
	_add_box(Vector3(0.08, 0.2, 2.1), Vector3(-0.42, 0.1, 0))
	_add_box(Vector3(0.08, 0.2, 2.1), Vector3(0.42, 0.1, 0))
	_add_box(Vector3(1.0, 0.18, 2.0), Vector3(0, 0.3, 0))
	_add_box(Vector3(0.06, 0.12, 1.9), Vector3(-0.5, 0.45, 0))
	_add_box(Vector3(0.06, 0.12, 1.9), Vector3(0.5, 0.45, 0))
	_add_box(Vector3(1.0, 0.12, 0.06), Vector3(0, 0.45, 1.0))
	_add_box(Vector3(1.0, 0.12, 0.06), Vector3(0, 0.45, -1.0))


func _ready() -> void:
	_build_visual()


func hook_for_seat(seat: int) -> Vector3:
	return HOOK_LEFT if seat < 2 else HOOK_RIGHT


func _physics_process(delta: float) -> void:
	_probe_ground()
	angular_damp = 0.4 if on_ice else 2.0
	if not grounded:
		return
	var friction_scale := T.ICE_FRICTION_SCALE if on_ice else 1.0
	var normal_force := (mass + T.CARGO_COUNT * T.CARGO_MASS) * 9.8 * maxf(ground_normal.y, 0.0)
	var fwd := (-global_basis.z).slide(ground_normal).normalized()
	var side := global_basis.x.slide(ground_normal).normalized()
	var v := linear_velocity
	# 마찰은 속도를 0으로 만드는 데까지만 (반대로 밀지 않게)
	var max_fwd := T.SLED_FORWARD_FRICTION * friction_scale * normal_force
	var max_side := T.SLED_SIDE_FRICTION * friction_scale * normal_force
	var f_fwd := -clampf(v.dot(fwd) * mass / delta, -max_fwd, max_fwd)
	var f_side := -clampf(v.dot(side) * mass / delta, -max_side, max_side)
	apply_central_force(fwd * f_fwd + side * f_side)


func _probe_ground() -> void:
	var from := global_position + global_basis.y * 0.3
	var query := PhysicsRayQueryParameters3D.create(from, from - global_basis.y * 0.55, 1)
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	grounded = not hit.is_empty()
	if grounded:
		ground_normal = hit["normal"]
		on_ice = hit["collider"].has_meta("ice")
	else:
		on_ice = false


func _add_box(size: Vector3, pos: Vector3) -> void:
	var box := BoxShape3D.new()
	box.size = size
	var shape := CollisionShape3D.new()
	shape.shape = box
	shape.position = pos
	add_child(shape)


func _build_visual() -> void:
	var wood := StandardMaterial3D.new()
	wood.albedo_color = Color(0.62, 0.42, 0.25)
	var dark := StandardMaterial3D.new()
	dark.albedo_color = Color(0.3, 0.22, 0.16)
	for child in get_children():
		if child is CollisionShape3D:
			var mi := MeshInstance3D.new()
			var bm := BoxMesh.new()
			bm.size = (child.shape as BoxShape3D).size
			mi.mesh = bm
			mi.position = child.position
			mi.material_override = dark if child.position.y < 0.2 else wood
			add_child(mi)
	# 앞쪽으로 말려 올라간 날
	for x in [-0.42, 0.42]:
		var curl := TorusMesh.new()
		curl.inner_radius = 0.12
		curl.outer_radius = 0.2
		var mi := MeshInstance3D.new()
		mi.mesh = curl
		mi.material_override = dark
		mi.position = Vector3(x, 0.2, -1.05)
		mi.rotation_degrees = Vector3(0, 0, 90)
		add_child(mi)
