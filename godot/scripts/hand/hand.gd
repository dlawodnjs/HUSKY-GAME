extends Node
## The player's hand. The mouse cursor is the hand: it raycasts into the room,
## knows what it is holding, recognises gestures, and tells the husky.
## There is no owner character and no menu between the hand and the dog.

signal feedback(text: String)

const GestureRecognizer := preload("res://scripts/hand/gesture_recognizer.gd")
const Husky := preload("res://scripts/husky/husky.gd")
const Ball := preload("res://scripts/toys/ball.gd")

enum Item { EMPTY, TREAT, BALL }

const ITEM_NAMES := ["빈 손", "간식", "공"]
const RAY_MASK := 2 | 4  # husky parts + ball
const LIFT_PARTS := ["back", "belly", "butt"]
const OFFER_STILL := 0.7
const SIGNAL_STILL := 0.5
## A resting cursor only counts as a gesture shortly after the hand moved there;
## otherwise a forgotten cursor would "signal" whenever the dog walks under it.
const GESTURE_STALE := 2.0

var camera: Camera3D
var husky: Husky
var ball: Ball

var item: int = Item.EMPTY
var pressed := false
var mode := ""  # "", "touch", "lift", "throw"
var hover_part := ""
var hover_point := Vector3.ZERO
var air_point := Vector3.ZERO
var floor_point := Vector3.ZERO
var over_ball := false
var last_gesture := "-"

var _rec := GestureRecognizer.new()
var _mouse := Vector2.ZERO
var _t := 0.0
var _press_part := ""
var _offered := false
var _signaled := false


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		_mouse = mb.position
		match mb.button_index:
			MOUSE_BUTTON_LEFT:
				if mb.pressed:
					_on_press()
				else:
					_on_release()
			MOUSE_BUTTON_RIGHT:
				if mb.pressed:
					feedback.emit(husky.point_at(floor_point))
					last_gesture = "point"
			MOUSE_BUTTON_WHEEL_UP:
				if mb.pressed:
					cycle_item(-1)
			MOUSE_BUTTON_WHEEL_DOWN:
				if mb.pressed:
					cycle_item(1)
	elif event is InputEventKey:
		var key := event as InputEventKey
		if not key.pressed or key.echo:
			return
		match key.keycode:
			KEY_1:
				set_item(Item.EMPTY)
			KEY_2:
				set_item(Item.TREAT)
			KEY_3:
				set_item(Item.BALL)
			KEY_SPACE:
				feedback.emit(husky.stop_command())
				last_gesture = "stop"


func _physics_process(delta: float) -> void:
	_t += delta
	_mouse = get_viewport().get_mouse_position()
	_rec.add_sample(_mouse, _t)
	_raycast()
	_update_continuous(delta)


func set_item(i: int) -> void:
	if i == Item.BALL and not has_ball():
		feedback.emit("공이 손에 없어요. 바닥의 공을 클릭해 집으세요")
		return
	if item == Item.BALL and i != Item.BALL and has_ball():
		# Put the ball down at the hand's floor point instead of losing it.
		ball.drop_at(floor_point + Vector3(0, 0.1, 0))
	item = i
	mode = "" if mode != "lift" else mode


func cycle_item(step: int) -> void:
	var options := [Item.EMPTY, Item.TREAT]
	if has_ball():
		options.append(Item.BALL)
	var idx := options.find(item)
	set_item(options[(idx + step + options.size()) % options.size()])


func has_ball() -> bool:
	return ball != null and ball.state == Ball.State.IN_HAND


func item_name() -> String:
	return ITEM_NAMES[item]


func _raycast() -> void:
	if camera == null:
		return
	var origin := camera.project_ray_origin(_mouse)
	var dir := camera.project_ray_normal(_mouse)
	hover_part = ""
	over_ball = false
	var space := camera.get_world_3d().direct_space_state
	if space != null:
		var q := PhysicsRayQueryParameters3D.create(origin, origin + dir * 30.0, RAY_MASK)
		q.collide_with_areas = true
		q.collide_with_bodies = true
		var hit := space.intersect_ray(q)
		if not hit.is_empty():
			var col: Object = hit["collider"]
			if col is Area3D and (col as Area3D).has_meta("part"):
				hover_part = String((col as Area3D).get_meta("part"))
				hover_point = hit["position"]
			elif col == ball:
				over_ball = true
				hover_point = hit["position"]
	var fp: Variant = Plane(Vector3.UP, 0.0).intersects_ray(origin, dir)
	if fp != null:
		floor_point = fp
	# "Hand in the air": where the ray crosses an upright plane through the dog,
	# facing the camera. Raising the mouse raises the hand above the dog's head.
	var n := camera.global_transform.basis.z
	n.y = 0.0
	if n.length() > 0.001 and husky != null:
		var ap: Variant = Plane(n.normalized(), husky.global_position).intersects_ray(origin, dir)
		if ap != null:
			air_point = ap
	if hover_part != "":
		air_point = hover_point


func _on_press() -> void:
	pressed = true
	var is_double := _rec.press(_mouse, _t)
	husky.mark_input()
	match item:
		Item.BALL:
			mode = "throw"
		Item.TREAT:
			var msg := husky.treat_give(air_point)
			if msg != "":
				feedback.emit(msg)
				last_gesture = "give treat"
		Item.EMPTY:
			if over_ball and ball.state == Ball.State.FREE:
				ball.pick_up()
				item = Item.BALL
				feedback.emit("공을 집었다. 드래그해서 위로 던지세요")
				last_gesture = "pick ball"
			elif hover_part != "":
				mode = "touch"
				_press_part = hover_part
			elif is_double:
				feedback.emit(husky.call_name())
				last_gesture = "clap"


func _on_release() -> void:
	match mode:
		"throw":
			_throw(_rec.velocity(_t, 0.12))
		"touch":
			husky.touch_end()
		"lift":
			husky.lift_end()
			last_gesture = "put down"
	mode = ""
	pressed = false
	_rec.release(_mouse, _t)


func _throw(v: Vector2) -> void:
	var basis := camera.global_transform.basis
	var fwd := -basis.z
	fwd.y = 0.0
	fwd = fwd.normalized()
	var flick := maxf(-v.y, 0.0)
	var vel := fwd * clampf(flick * 0.006, 0.6, 6.0) + basis.x * clampf(v.x * 0.004, -3.0, 3.0) + Vector3.UP * clampf(flick * 0.0025, 0.8, 3.5)
	var origin := camera.global_position + fwd * 0.6 + Vector3(0, -0.4, 0)
	ball.throw_from(origin, vel)
	item = Item.EMPTY
	feedback.emit("던졌다!" if flick > 300.0 else "툭 굴렸다")
	last_gesture = "throw"


func _update_continuous(delta: float) -> void:
	if husky == null:
		return
	var head_pos := husky.head.global_position
	var near := hover_part != "" or air_point.distance_to(head_pos) < 0.6
	if _rec.still_duration(_t) < 1.5 or pressed:
		husky.notice_hand(air_point, near)

	match mode:
		"touch":
			var g := _rec.classify(_t)
			var part := hover_part if hover_part != "" else _press_part
			if g == GestureRecognizer.Kind.SCRATCH and hover_part != "":
				husky.scratch(part, hover_point, delta)
				last_gesture = "scratch " + part
			elif g == GestureRecognizer.Kind.STROKE and hover_part != "":
				husky.pet(part, _with_grain(), hover_point, delta)
				last_gesture = "stroke " + part
			elif g == GestureRecognizer.Kind.HOLD_STILL and part in LIFT_PARTS:
				var msg := husky.lift_start(air_point)
				if msg != "":
					feedback.emit(msg)
				mode = "lift" if husky.is_lifted() else ""
				last_gesture = "lift"
		"lift":
			husky.lift_update(air_point)

	if item == Item.TREAT:
		husky.treat_hover(air_point)

	if item == Item.EMPTY and mode == "" and not pressed:
		var still := _rec.still_duration(_t)
		var flat := Vector2(air_point.x - head_pos.x, air_point.z - head_pos.z).length()
		if still < 0.1:
			_offered = false
			_signaled = false
		elif still > GESTURE_STALE:
			pass
		elif air_point.distance_to(head_pos) < 0.35 and still > OFFER_STILL and not _offered:
			_offered = true
			husky.offer_hand(air_point)
			last_gesture = "offer hand"
		elif air_point.y > head_pos.y + 0.18 and flat < 0.5 and still > SIGNAL_STILL and not _signaled:
			_signaled = true
			var msg := husky.hand_signal_sit()
			if msg != "":
				feedback.emit(msg)
			last_gesture = "hand signal: sit"


## Strokes from head toward tail go with the fur.
func _with_grain() -> bool:
	var head_s := camera.unproject_position(husky.head.global_position)
	var tail_s := camera.unproject_position(husky.tail_root.global_position)
	var grain := tail_s - head_s
	if grain.length() < 4.0:
		return true
	return _rec.stroke_dir.dot(grain.normalized()) > -0.3
