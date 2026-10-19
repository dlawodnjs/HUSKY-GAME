extends Node3D
## Builds the gray-box room and wires the husky, the hand and the HUD together.
## The room is the main screen: the camera sits where the owner would be.

const Husky := preload("res://scripts/husky/husky.gd")
const Ball := preload("res://scripts/toys/ball.gd")
const Hand := preload("res://scripts/hand/hand.gd")
const HandCursor := preload("res://scripts/hand/hand_cursor_2d.gd")
const Hud := preload("res://scripts/ui/hud.gd")

const CAMERA_POS := Vector3(0, 1.0, 1.85)
const CAMERA_LOOK := Vector3(0, 0.18, -0.3)
const BED_POS := Vector3(-1.9, 0, -1.4)
const SLIPPER_POS := Vector3(1.8, 0.03, -1.2)
const WINDOW_POS := Vector3(0.6, 1.4, -1.99)

var camera: Camera3D
var husky: Husky
var ball: Ball
var hand: Hand
var hud: Hud
var slipper: Node3D


func _ready() -> void:
	_build_environment()
	_build_room()

	camera = Camera3D.new()
	camera.fov = 50.0
	add_child(camera)
	camera.global_position = CAMERA_POS
	camera.look_at(CAMERA_LOOK, Vector3.UP)
	camera.current = true

	ball = Ball.new()
	ball.name = "Ball"
	add_child(ball)
	ball.global_position = Vector3(0.55, 0.1, 0.2)

	husky = Husky.new()
	husky.name = "Husky"
	add_child(husky)
	husky.global_position = Vector3.ZERO
	husky.rotation.y = PI  # face the owner
	husky.camera_point = CAMERA_POS
	husky.bed_spot = BED_POS
	husky.window_point = WINDOW_POS
	husky.slipper = slipper
	husky.ball = ball

	hand = Hand.new()
	hand.name = "Hand"
	hand.camera = camera
	hand.husky = husky
	hand.ball = ball
	add_child(hand)

	hud = Hud.new()
	hud.husky = husky
	hud.hand = hand
	add_child(hud)

	var cursor_layer := CanvasLayer.new()
	cursor_layer.layer = 10
	add_child(cursor_layer)
	var cursor := HandCursor.new()
	cursor.hand = hand
	cursor_layer.add_child(cursor)

	hud.show_message("아기 허스키가 왔어요. 손을 가까이 대 보세요")


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var key := event as InputEventKey
		if not key.pressed or key.echo:
			return
		match key.keycode:
			KEY_F1:
				hud.toggle_debug()
			KEY_F2:
				husky.set_puppy(not husky.is_puppy)
				hud.show_message("아기로 돌아갔다" if husky.is_puppy else "성견이 되었다 (크기만 바뀜)")
			KEY_ESCAPE:
				Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if Input.mouse_mode == Input.MOUSE_MODE_HIDDEN else Input.MOUSE_MODE_HIDDEN


func _build_environment() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.8, 0.77, 0.72)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.86, 0.83, 0.8)
	env.ambient_light_energy = 0.35
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, -30, 0)
	sun.light_energy = 0.4
	sun.shadow_enabled = true
	add_child(sun)


func _build_room() -> void:
	var floor_mat := Husky._toon(Color(0.62, 0.5, 0.4))
	var wall_mat := Husky._toon(Color(0.78, 0.74, 0.68))
	_static_box("Floor", Vector3(6, 0.2, 5), Vector3(0, -0.1, -0.3), floor_mat)
	_static_box("WallBack", Vector3(6, 2.6, 0.2), Vector3(0, 1.3, -2.1), wall_mat)
	_static_box("WallLeft", Vector3(0.2, 2.6, 5), Vector3(-2.7, 1.3, -0.3), wall_mat)
	_static_box("WallRight", Vector3(0.2, 2.6, 5), Vector3(2.7, 1.3, -0.3), wall_mat)
	_static_box("FrontStop", Vector3(6, 1.0, 0.2), Vector3(0, 0.5, 1.25), null)

	var glass := StandardMaterial3D.new()
	glass.albedo_color = Color(0.75, 0.88, 1.0)
	glass.emission_enabled = true
	glass.emission = Color(0.7, 0.85, 1.0)
	glass.emission_energy_multiplier = 0.6
	_deco(_box_mesh(Vector3(1.2, 0.8, 0.04)), glass, WINDOW_POS)

	var rug := CylinderMesh.new()
	rug.top_radius = 1.2
	rug.bottom_radius = 1.2
	rug.height = 0.01
	_deco(rug, Husky._toon(Color(0.7, 0.62, 0.5)), Vector3(0, 0.005, 0.0))

	var bed := CylinderMesh.new()
	bed.top_radius = 0.42
	bed.bottom_radius = 0.46
	bed.height = 0.1
	_deco(bed, Husky._toon(Color(0.62, 0.42, 0.34)), BED_POS + Vector3(0, 0.05, 0))

	slipper = _deco(_box_mesh(Vector3(0.12, 0.06, 0.26)), Husky._toon(Color(0.3, 0.6, 0.62)), SLIPPER_POS)
	slipper.name = "Slipper"


func _static_box(node_name: String, size: Vector3, pos: Vector3, mat: Material) -> void:
	var body := StaticBody3D.new()
	body.name = node_name
	body.collision_layer = 1
	body.collision_mask = 0
	var shape := BoxShape3D.new()
	shape.size = size
	var cs := CollisionShape3D.new()
	cs.shape = shape
	body.add_child(cs)
	if mat != null:
		var mi := MeshInstance3D.new()
		mi.mesh = _box_mesh(size)
		mi.material_override = mat
		body.add_child(mi)
	add_child(body)
	body.global_position = pos


func _deco(mesh: Mesh, mat: Material, pos: Vector3) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = mat
	add_child(mi)
	mi.global_position = pos
	return mi


func _box_mesh(size: Vector3) -> BoxMesh:
	var m := BoxMesh.new()
	m.size = size
	return m
