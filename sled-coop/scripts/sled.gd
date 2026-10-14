extends RigidBody2D
## 썰매. 로컬 좌표 +X 방향이 앞쪽이다.
## 마찰(미끄러움)은 game.gd 에서 매 프레임 조절한다.

const HALF_LENGTH := 32.0
const HALF_WIDTH := 18.0


func _init() -> void:
	gravity_scale = 0.0
	mass = 3.0
	can_sleep = false
	linear_damp_mode = RigidBody2D.DAMP_MODE_REPLACE
	angular_damp_mode = RigidBody2D.DAMP_MODE_REPLACE
	angular_damp = 3.0
	collision_layer = 2
	collision_mask = 1  # 벽, 나무와만 부딪힘 (허스키와는 안 부딪힘)

	var mat := PhysicsMaterial.new()
	mat.friction = 0.05
	mat.bounce = 0.3
	physics_material_override = mat

	var rect := RectangleShape2D.new()
	rect.size = Vector2(HALF_LENGTH * 2.0, HALF_WIDTH * 2.0)
	var shape := CollisionShape2D.new()
	shape.shape = rect
	add_child(shape)


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	# 그림자
	draw_rect(Rect2(-HALF_LENGTH + 3, -HALF_WIDTH + 4, HALF_LENGTH * 2, HALF_WIDTH * 2), Color(0, 0, 0, 0.15))
	# 썰매 날(러너)
	var runner := Color(0.25, 0.2, 0.18)
	for side in [-1.0, 1.0]:
		var y: float = side * (HALF_WIDTH - 2.0)
		draw_line(Vector2(-HALF_LENGTH - 6, y), Vector2(HALF_LENGTH + 2, y), runner, 4.0)
		draw_arc(Vector2(HALF_LENGTH + 2, y - side * 6.0), 6.0, -PI / 2 * side, PI / 2 * side, 6, runner, 4.0)
	# 바구니
	draw_rect(Rect2(-HALF_LENGTH, -HALF_WIDTH + 3, HALF_LENGTH * 2 - 4, HALF_WIDTH * 2 - 6), Color(0.62, 0.42, 0.25))
	for i in 5:
		var x := -HALF_LENGTH + 6.0 + i * 12.0
		draw_line(Vector2(x, -HALF_WIDTH + 3), Vector2(x, HALF_WIDTH - 3), Color(0.5, 0.33, 0.19), 2.0)
	# 화물
	draw_rect(Rect2(-HALF_LENGTH + 6, -10, 30, 20), Color(0.85, 0.3, 0.25))
	draw_line(Vector2(-HALF_LENGTH + 21, -10), Vector2(-HALF_LENGTH + 21, 10), Color.WHITE, 3.0)
	draw_line(Vector2(-HALF_LENGTH + 6, 0), Vector2(-HALF_LENGTH + 36, 0), Color.WHITE, 3.0)
