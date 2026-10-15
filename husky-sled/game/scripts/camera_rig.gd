extends Node3D
## 카메라.
## - 기본(A): 내 허스키 뒤 3인칭.
## - Tab을 누르고 있으면(B): 썰매 위쪽에서 내려다보는 시점. 내 허스키는 반짝임.
## - 마우스 우클릭을 누르고 있을 때만 시야가 돈다 (로블록스 방식). 평소엔 커서가 자유롭다.

const LOOK_SENSITIVITY := 0.004
const BLEND_TIME := 0.25

var target_husky: Node3D
var sled: Node3D
var camera: Camera3D

var yaw_a := 0.0
var pitch_a := -0.35
var dist_a := 6.5
var yaw_b := 0.0
var pitch_b := deg_to_rad(-68.0)
var dist_b := 18.0
var blend := 0.0              # 0 = A, 1 = B
var looking := false
var _tab_was_held := false
var _pivot_a := Vector3.ZERO


func _ready() -> void:
	camera = Camera3D.new()
	camera.fov = 70.0
	add_child(camera)
	camera.make_current()


func snap_to_target() -> void:
	if target_husky:
		_pivot_a = target_husky.global_position
		yaw_a = target_husky.global_rotation.y


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT:
		looking = event.pressed
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED if looking else Input.MOUSE_MODE_VISIBLE
	elif event is InputEventMouseMotion and looking:
		var dx: float = -event.relative.x * LOOK_SENSITIVITY
		var dy: float = -event.relative.y * LOOK_SENSITIVITY
		if blend < 0.5:
			yaw_a += dx
			pitch_a = clampf(pitch_a + dy, -1.25, 0.3)
		else:
			yaw_b += dx


func _process(delta: float) -> void:
	if target_husky == null or sled == null or not is_instance_valid(target_husky):
		return
	var tab_held := Input.is_physical_key_pressed(KEY_TAB)
	if tab_held and not _tab_was_held:
		yaw_b = yaw_a   # 썰매 시점은 지금 보던 방향에서 시작
	_tab_was_held = tab_held
	blend = move_toward(blend, 1.0 if tab_held else 0.0, delta / BLEND_TIME)
	target_husky.set_highlight(blend > 0.5)

	_pivot_a = _pivot_a.lerp(target_husky.global_position, clampf(12.0 * delta, 0.0, 1.0))
	var ta := _orbit(_pivot_a + Vector3.UP * 1.1, yaw_a, pitch_a, dist_a, true)
	var tb := _orbit(sled.global_position, yaw_b, pitch_b, dist_b, false)
	var w := smoothstep(0.0, 1.0, blend)
	var q := ta.basis.get_rotation_quaternion().slerp(tb.basis.get_rotation_quaternion(), w)
	camera.global_transform = Transform3D(Basis(q), ta.origin.lerp(tb.origin, w))


## 이동 키 방향 계산용: 지금 카메라가 보는 수평 방향
func flat_forward() -> Vector3:
	var f := -camera.global_basis.z
	f.y = 0.0
	return f.normalized() if f.length() > 0.01 else Vector3.FORWARD


func flat_right() -> Vector3:
	var r := camera.global_basis.x
	r.y = 0.0
	return r.normalized() if r.length() > 0.01 else Vector3.RIGHT


func _orbit(pivot: Vector3, yaw: float, pitch: float, dist: float, avoid_walls: bool) -> Transform3D:
	var offset := Basis(Vector3.UP, yaw) * Basis(Vector3.RIGHT, pitch) * Vector3(0, 0, dist)
	var pos := pivot + offset
	if avoid_walls:
		# 지형에 가리면 카메라를 앞으로 당긴다
		var query := PhysicsRayQueryParameters3D.create(pivot, pos, 1)
		var hit := get_world_3d().direct_space_state.intersect_ray(query)
		if not hit.is_empty():
			pos = hit["position"] + (pivot - pos).normalized() * 0.3
	return Transform3D.IDENTITY.translated(pos).looking_at(pivot, Vector3.UP)
