extends RefCounted
## Head and neck tracking. Splits the turn between neck and head, clamps it to
## what a dog's neck can do, and eases toward the target so it never snaps.

const MAX_YAW := 1.15
const MAX_PITCH_UP := 0.75
const MAX_PITCH_DOWN := 0.9

var yaw := 0.0
var pitch := 0.0
var tilt := 0.0


## weight 0 = look straight ahead, 1 = look fully at target.
func update(neck: Node3D, head: Node3D, target: Vector3, weight: float, dt: float, speed: float = 12.0, tilt_target: float = 0.0) -> void:
	var parent := neck.get_parent_node_3d()
	var local := parent.to_local(target) - neck.position
	var want_yaw := 0.0
	var want_pitch := 0.0
	if local.length() > 0.01:
		want_yaw = clampf(atan2(-local.x, -local.z), -MAX_YAW, MAX_YAW)
		want_pitch = clampf(atan2(local.y, Vector2(local.x, local.z).length()), -MAX_PITCH_DOWN, MAX_PITCH_UP)
	var k := 1.0 - exp(-speed * dt)
	yaw = lerp_angle(yaw, want_yaw * weight, k)
	pitch = lerpf(pitch, want_pitch * weight, k)
	tilt = lerpf(tilt, tilt_target, 1.0 - exp(-6.0 * dt))
	neck.rotation = Vector3(pitch * 0.45, yaw * 0.5, 0.0)
	head.rotation = Vector3(pitch * 0.55, yaw * 0.5, tilt)
