extends RigidBody2D
## 허스키 한 마리 = 플레이어 한 명.
## 회전은 물리로 하지 않고 facing 값으로 그림만 돌린다.

const RADIUS := 13.0

var slot := 0
var color := Color.WHITE
var label_text := "P1"
var role := "WHEEL"          # WHEEL(썰매 바로 앞, 브레이크 가능) / SWING / LEAD(맨 앞, 힘 보너스)
var can_brake := false
var facing := 0.0
var braking := false
var connected := true
var sync_flash := 0.0        # "같이 당기기" 버튼을 누른 직후 머리 위에 ! 표시


func _init() -> void:
	gravity_scale = 0.0
	mass = 1.0
	lock_rotation = true
	can_sleep = false
	linear_damp_mode = RigidBody2D.DAMP_MODE_REPLACE
	linear_damp = 4.0
	collision_layer = 4
	collision_mask = 1 | 4  # 벽/나무, 다른 허스키

	var mat := PhysicsMaterial.new()
	mat.friction = 0.2
	mat.bounce = 0.2
	physics_material_override = mat

	var circle := CircleShape2D.new()
	circle.radius = RADIUS
	var shape := CollisionShape2D.new()
	shape.shape = circle
	add_child(shape)


func _process(delta: float) -> void:
	sync_flash = maxf(sync_flash - delta, 0.0)
	modulate.a = 1.0 if connected else 0.4
	queue_redraw()


func _draw() -> void:
	var fur := Color(0.42, 0.46, 0.52)
	var white := Color(0.97, 0.97, 0.97)
	# 그림자
	draw_set_transform(Vector2(2, 4), facing, Vector2(1.5, 0.9))
	draw_circle(Vector2.ZERO, RADIUS, Color(0, 0, 0, 0.15))
	# 몸통
	draw_set_transform(Vector2.ZERO, facing, Vector2(1.45, 0.85))
	draw_circle(Vector2.ZERO, RADIUS, fur)
	draw_circle(Vector2(1, 0), RADIUS * 0.55, white)
	# 꼬리, 머리, 귀, 주둥이, 목줄
	draw_set_transform(Vector2.ZERO, facing)
	draw_arc(Vector2(-20, 0), 6.0, PI * 0.5, PI * 1.5, 8, fur, 4.0)
	draw_circle(Vector2(18, 0), 9.0, fur)
	draw_colored_polygon(PackedVector2Array([Vector2(13, -5), Vector2(15, -13), Vector2(19, -6)]), fur)
	draw_colored_polygon(PackedVector2Array([Vector2(13, 5), Vector2(15, 13), Vector2(19, 6)]), fur)
	draw_circle(Vector2(24, 0), 4.5, white)
	draw_circle(Vector2(28, 0), 1.8, Color.BLACK)
	draw_arc(Vector2(18, 0), 9.0, PI * 0.6, PI * 1.4, 8, color, 4.0)
	draw_set_transform(Vector2.ZERO)

	var font := ThemeDB.fallback_font
	draw_string(font, Vector2(-40, -28), label_text, HORIZONTAL_ALIGNMENT_CENTER, 80, 16, color)
	if braking:
		draw_string(font, Vector2(-40, 38), "BRAKE", HORIZONTAL_ALIGNMENT_CENTER, 80, 13, Color(0.8, 0.1, 0.1))
	if sync_flash > 0.0:
		draw_circle(Vector2(0, -48), 11.0, Color(1, 0.85, 0.2))
		draw_string(font, Vector2(-10, -42), "!", HORIZONTAL_ALIGNMENT_CENTER, 20, 18, Color.BLACK)
