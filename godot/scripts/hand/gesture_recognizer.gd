extends RefCounted
## Turns raw pointer samples (screen space) into hand gestures.
## Pure logic with no scene access, so it can be unit tested with synthetic input.

enum Kind { NONE, STROKE, SCRATCH, HOLD_STILL }

const HISTORY := 1.5            # seconds of samples kept
const STROKE_WINDOW := 0.2      # seconds used to measure stroke speed/direction
const STROKE_MIN_SPEED := 120.0 # px/s
const SCRATCH_WINDOW := 0.6     # seconds used to detect small circles
const SCRATCH_MIN_TURN := TAU * 1.1
const SCRATCH_MAX_RADIUS := 45.0
const SCRATCH_MIN_SEGMENT := 1.5
const HOLD_TIME := 0.4
const STILL_RADIUS := 6.0
const DOUBLE_CLICK_TIME := 0.35
const DOUBLE_CLICK_DIST := 24.0

var pressed := false
var press_time := 0.0
var stroke_dir := Vector2.ZERO
var stroke_speed := 0.0

var _samples: Array = []  # [{"t": float, "p": Vector2}]
var _last_click_t := -100.0
var _last_click_p := Vector2.ZERO


func add_sample(p: Vector2, t: float) -> void:
	_samples.append({"t": t, "p": p})
	while _samples.size() > 2 and t - float(_samples[0]["t"]) > HISTORY:
		_samples.pop_front()


## Returns true when this press completes a double click.
func press(p: Vector2, t: float) -> bool:
	pressed = true
	press_time = t
	add_sample(p, t)
	var is_double := t - _last_click_t <= DOUBLE_CLICK_TIME and p.distance_to(_last_click_p) <= DOUBLE_CLICK_DIST
	_last_click_t = -100.0 if is_double else t
	_last_click_p = p
	return is_double


func release(p: Vector2, t: float) -> void:
	add_sample(p, t)
	pressed = false
	stroke_speed = 0.0


## Classifies the gesture in progress. Only pressed gestures count.
func classify(t: float) -> int:
	if not pressed:
		return Kind.NONE
	if _is_scratch(t):
		return Kind.SCRATCH
	_measure_stroke(t)
	if stroke_speed >= STROKE_MIN_SPEED:
		return Kind.STROKE
	if t - press_time >= HOLD_TIME and still_duration(t) >= HOLD_TIME:
		return Kind.HOLD_STILL
	return Kind.NONE


## How long the pointer has stayed within STILL_RADIUS of where it is now.
func still_duration(t: float, radius: float = STILL_RADIUS) -> float:
	if _samples.is_empty():
		return 0.0
	var last: Vector2 = _samples[-1]["p"]
	var since := t
	for i in range(_samples.size() - 1, -1, -1):
		var s: Dictionary = _samples[i]
		if (s["p"] as Vector2).distance_to(last) > radius:
			break
		since = float(s["t"])
	return t - since


## Average screen velocity over the last `window` seconds.
func velocity(t: float, window: float = 0.1) -> Vector2:
	var recent := _recent(t, window)
	if recent.size() < 2:
		return Vector2.ZERO
	var dt := float(recent[-1]["t"]) - float(recent[0]["t"])
	if dt <= 0.0:
		return Vector2.ZERO
	return ((recent[-1]["p"] as Vector2) - (recent[0]["p"] as Vector2)) / dt


func _recent(t: float, window: float) -> Array:
	var out: Array = []
	for s in _samples:
		if t - float(s["t"]) <= window + 0.0001:
			out.append(s)
	return out


func _measure_stroke(t: float) -> void:
	var recent := _recent(t, STROKE_WINDOW)
	if recent.size() < 2:
		stroke_speed = 0.0
		return
	var path := 0.0
	for i in range(1, recent.size()):
		path += (recent[i]["p"] as Vector2).distance_to(recent[i - 1]["p"])
	var dt := float(recent[-1]["t"]) - float(recent[0]["t"])
	stroke_speed = path / dt if dt > 0.0 else 0.0
	var disp: Vector2 = (recent[-1]["p"] as Vector2) - (recent[0]["p"] as Vector2)
	if disp.length() > 0.5:
		stroke_dir = disp.normalized()


func _is_scratch(t: float) -> bool:
	var recent := _recent(t, SCRATCH_WINDOW)
	if recent.size() < 6:
		return false
	var centroid := Vector2.ZERO
	for s in recent:
		centroid += s["p"]
	centroid /= recent.size()
	for s in recent:
		if (s["p"] as Vector2).distance_to(centroid) > SCRATCH_MAX_RADIUS:
			return false
	var turn := 0.0
	var prev_seg := Vector2.ZERO
	var anchor: Vector2 = recent[0]["p"]
	for i in range(1, recent.size()):
		var p: Vector2 = recent[i]["p"]
		var seg := p - anchor
		if seg.length() < SCRATCH_MIN_SEGMENT:
			continue
		if prev_seg != Vector2.ZERO:
			turn += prev_seg.angle_to(seg)
		prev_seg = seg
		anchor = p
	return absf(turn) >= SCRATCH_MIN_TURN
