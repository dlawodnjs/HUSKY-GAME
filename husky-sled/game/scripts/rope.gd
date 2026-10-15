extends Node3D
## 허스키 1마리와 썰매를 잇는 줄 1개.
## - 늘어나지 않는 줄: 길이보다 멀어지면 아주 단단한 스프링 힘으로 당긴다. 느슨할 땐 힘 없음.
## - 줄은 지형이나 다른 줄과 부딪히지 않는다 (꼬임 없음).
## - 장력(걸리는 힘)이 클수록 줄이 붉어진다. 모든 줄에 항상 적용되는 기본 연출.

const T = preload("res://scripts/tuning.gd")
const SEGMENTS := 10

var husky: RigidBody3D
var sled: RigidBody3D
var anchor_local := Vector3.ZERO
var length := 2.0
var tension := 0.0            # 이번 스텝 장력 (N)
var tension_smooth := 0.0     # 색 표시용으로 부드럽게 따라가는 값

var _segments: Array[MeshInstance3D] = []
var _mat: StandardMaterial3D


func setup(p_husky: RigidBody3D, p_sled: RigidBody3D, p_anchor: Vector3, p_length: float) -> void:
	husky = p_husky
	sled = p_sled
	anchor_local = p_anchor
	length = p_length


func _ready() -> void:
	top_level = true
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = Color(0.35, 0.27, 0.2)
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.025
	mesh.bottom_radius = 0.025
	mesh.height = 1.0
	mesh.radial_segments = 6
	for i in SEGMENTS:
		var mi := MeshInstance3D.new()
		mi.mesh = mesh
		mi.material_override = _mat
		add_child(mi)
		_segments.append(mi)


func anchor_world() -> Vector3:
	return sled.to_global(anchor_local)


func harness_world() -> Vector3:
	return husky.global_position + Vector3.UP * 0.4


func _physics_process(delta: float) -> void:
	var a := anchor_world()
	var b := harness_world()
	var d := b - a
	var dist := d.length()
	tension = 0.0
	husky.rope_taut = false
	if dist > length and dist > 0.001:
		var n := d / dist
		var r := a - sled.global_position
		var anchor_vel: Vector3 = sled.linear_velocity + sled.angular_velocity.cross(r)
		var rel_speed: float = (husky.linear_velocity - anchor_vel).dot(n)
		var f := clampf(T.ROPE_STIFFNESS * (dist - length) + T.ROPE_DAMPING * rel_speed, 0.0, T.ROPE_MAX_FORCE)
		husky.apply_central_force(-n * f)
		sled.apply_force(n * f, r)
		tension = f
		husky.rope_taut = true
		husky.rope_pull_dir = -n
	tension_smooth = lerpf(tension_smooth, tension, clampf(T.ROPE_TENSION_SMOOTH * delta, 0.0, 1.0))


func _process(_delta: float) -> void:
	var a := anchor_world()
	var b := harness_world()
	var dist := a.distance_to(b)
	# 느슨하면 아래로 처지게 (대략적인 곡선)
	var sag := sqrt(maxf(length * length - dist * dist, 0.0)) * 0.45
	var prev := a
	for i in SEGMENTS:
		var t := float(i + 1) / SEGMENTS
		var p := a.lerp(b, t) + Vector3.DOWN * sag * 4.0 * t * (1.0 - t)
		var seg := _segments[i]
		var mid := (prev + p) * 0.5
		var seg_len := prev.distance_to(p)
		if seg_len > 0.0001:
			var up := (p - prev) / seg_len
			var basis_x := up.cross(Vector3.FORWARD if absf(up.z) < 0.9 else Vector3.RIGHT).normalized()
			var basis_z := basis_x.cross(up)
			seg.global_transform = Transform3D(Basis(basis_x, up * seg_len, basis_z), mid)
		prev = p
	var red := clampf(tension_smooth / T.ROPE_TENSION_RED, 0.0, 1.0)
	_mat.albedo_color = Color(0.35, 0.27, 0.2).lerp(Color(0.95, 0.12, 0.08), red)
