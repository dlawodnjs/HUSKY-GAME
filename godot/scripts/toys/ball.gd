extends RigidBody3D
## A rubber ball that can be in the player's hand, rolling free, or in the husky's mouth.

enum State { IN_HAND, FREE, IN_MOUTH }

const RADIUS := 0.06
const LAYER_BALL := 4
const LAYER_WORLD := 1

var state: int = State.FREE
var _anchor: Node3D


func _ready() -> void:
	collision_layer = LAYER_BALL
	collision_mask = LAYER_WORLD
	mass = 0.2
	continuous_cd = true
	var mat := PhysicsMaterial.new()
	mat.bounce = 0.55
	mat.friction = 0.6
	physics_material_override = mat
	linear_damp = 0.3
	angular_damp = 0.8
	freeze_mode = RigidBody3D.FREEZE_MODE_KINEMATIC
	var shape := SphereShape3D.new()
	shape.radius = RADIUS
	var cs := CollisionShape3D.new()
	cs.shape = shape
	add_child(cs)
	var mesh := SphereMesh.new()
	mesh.radius = RADIUS
	mesh.height = RADIUS * 2.0
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.95, 0.35, 0.25)
	m.diffuse_mode = BaseMaterial3D.DIFFUSE_TOON
	mi.material_override = m
	add_child(mi)


func _physics_process(_delta: float) -> void:
	if state == State.IN_MOUTH and _anchor != null:
		global_position = _anchor.global_position


func pick_up() -> void:
	state = State.IN_HAND
	_anchor = null
	freeze = true
	visible = false


func throw_from(origin: Vector3, vel: Vector3) -> void:
	state = State.FREE
	_anchor = null
	visible = true
	global_position = origin
	freeze = false
	linear_velocity = vel
	angular_velocity = Vector3(vel.z, 0.0, -vel.x) * 8.0


func hold_in(anchor: Node3D) -> void:
	state = State.IN_MOUTH
	_anchor = anchor
	freeze = true
	visible = true
	global_position = anchor.global_position


func drop_at(p: Vector3) -> void:
	state = State.FREE
	_anchor = null
	visible = true
	global_position = Vector3(p.x, maxf(p.y, RADIUS + 0.02), p.z)
	freeze = false
	linear_velocity = Vector3(0, -0.5, 0)
