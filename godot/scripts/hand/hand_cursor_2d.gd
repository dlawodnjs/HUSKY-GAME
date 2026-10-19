extends Control
## Draws the hand cursor. The fingertip is the touch point; the shape shows
## what the hand is doing (open, pressing, holding a treat or the ball).

const SKIN := Color(1.0, 0.86, 0.74)
const LINE := Color(0.36, 0.26, 0.2)
const BALL := Color(0.95, 0.35, 0.25)
const BONE := Color(0.96, 0.9, 0.78)

var hand: Node  # hand.gd; untyped to keep the cursor independent


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_preset(Control.PRESET_FULL_RECT)
	Input.mouse_mode = Input.MOUSE_MODE_HIDDEN


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	var p := get_viewport().get_mouse_position()
	var item := 0
	var pressing := false
	var mode := ""
	var over_dog := false
	if hand != null:
		item = int(hand.get("item"))
		pressing = bool(hand.get("pressed"))
		mode = String(hand.get("mode"))
		over_dog = String(hand.get("hover_part")) != ""
	var fist := item != 0 or mode == "lift"
	var palm := p + Vector2(0, 24)

	if over_dog and item == 0:
		draw_arc(p, 9.0, 0.0, TAU, 20, Color(1, 1, 1, 0.8), 2.0)

	draw_circle(palm, 16.0, LINE)
	draw_circle(palm, 14.0, SKIN)
	if fist:
		for i in 4:
			var k := palm + Vector2(-9.0 + i * 6.0, -12.0)
			draw_circle(k, 4.5, LINE)
			draw_circle(k, 3.3, SKIN)
	else:
		var press_shrink := 4.0 if pressing else 0.0
		for i in 4:
			var x := -9.0 + i * 6.0
			var tip_y := -1.0 + absf(i - 1.5) * 3.0 + press_shrink
			_finger(palm + Vector2(x, -8.0), p + Vector2(x, tip_y))
	_finger(palm + Vector2(10.0, 4.0), palm + Vector2(20.0, -6.0))

	if item == 1:
		var c := palm + Vector2(0, -12)
		draw_rect(Rect2(c + Vector2(-8, -2), Vector2(16, 4)), BONE)
		for dx in [-8.0, 8.0]:
			draw_circle(c + Vector2(dx, -2.5), 3.2, BONE)
			draw_circle(c + Vector2(dx, 2.5), 3.2, BONE)
	elif item == 2:
		draw_circle(palm + Vector2(0, -14), 9.0, LINE)
		draw_circle(palm + Vector2(0, -14), 8.0, BALL)


func _finger(from: Vector2, to: Vector2) -> void:
	draw_line(from, to, LINE, 8.0)
	draw_circle(to, 4.0, LINE)
	draw_line(from, to, SKIN, 5.6)
	draw_circle(to, 2.8, SKIN)
