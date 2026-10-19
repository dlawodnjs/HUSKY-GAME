extends CharacterBody3D
## Gray-box puppy. The body is built from primitive meshes and animated
## procedurally: every pose value eases toward a target each frame, so any
## reaction can interrupt any other without a visible snap.
##
## Pose is decided in layers each physics frame, later layers winning:
## defaults -> autonomous behaviour -> hand attention -> treat lure ->
## held sit -> touch -> timed reaction -> being lifted.

signal reacted(reaction: String, detail: String)
signal message(text: String)

const Bond := preload("res://scripts/husky/bond.gd")
const Brain := preload("res://scripts/husky/brain.gd")
const Reactions := preload("res://scripts/husky/reactions.gd")
const LookAt := preload("res://scripts/husky/look_at.gd")
const Ball := preload("res://scripts/toys/ball.gd")

const LAYER_WORLD := 1
const LAYER_PARTS := 2
const LAYER_BODY := 8
const ROOM_MIN := Vector2(-2.3, -1.8)  # x, z
const ROOM_MAX := Vector2(2.3, 0.95)
const PUPPY_SCALE := 0.6
const ADULT_SCALE := 1.0
const WALK_SPEED := 0.6
const RUN_SPEED := 1.7
const TOUCH_TIMEOUT := 0.5
const REACT_INTERVAL := 1.2

var bond: Bond = Bond.new()
var brain: Brain = Brain.new()
var reactions: Reactions = Reactions.new()
var look: LookAt = LookAt.new()

var is_puppy := true
var camera_point := Vector3(0, 1.0, 1.85)
var front_spot := Vector3(0, 0, 0.75)
var bed_spot := Vector3(-1.9, 0, -1.4)
var window_point := Vector3(0, 1.3, -2.0)
var slipper: Node3D
var ball: Ball

var happiness := 0.5
var idle_input_time := 0.0
var last_response_ms := 0.0

var rig: Node3D
var body_pivot: Node3D
var neck: Node3D
var head: Node3D
var snout_tip: Node3D
var mouth_anchor: Node3D
var tail_root: Node3D
var tail_tilt: Node3D
var legs := {}
var ears: Array[Node3D] = []
var eyes: Array[Node3D] = []
var emote_label: Label3D
var body_shape: BoxShape3D

var pose := {}
var pose_target := {}

var _move_target := Vector3.ZERO
var _has_move_target := false
var _arrived := false
var _move_speed := WALK_SPEED
var _speed_now := 0.0
var _step_phase := 0.0
var _t := 0.0

var _look_target := Vector3.ZERO
var _look_weight := 0.3
var _look_tilt := 0.0
var _attention_point := Vector3.ZERO
var _attention_timer := 0.0

var _touching := false
var _touch_timer := 0.0
var _touch_part := ""
var _touch_pose := {}
var _touch_side := 0.0
var _react_cooldown := 0.0

var _reaction := ""
var _reaction_timer := 0.0
var _reaction_point := Vector3.ZERO

var _lifted := false
var _lift_point := Vector3.ZERO
var _lure_point := Vector3.ZERO
var _lure_timer := 0.0
var _sit_hold := 0.0
var _sit_since := -1.0
var _pending_input_usec := 0

var _last_behavior := -1
var _bs := {}  # scratch state for the running behaviour
var _moment_timer := 4.0
var _emote_timer := 0.0
var _rng := RandomNumberGenerator.new()


func _ready() -> void:
	_rng.randomize()
	motion_mode = CharacterBody3D.MOTION_MODE_FLOATING
	collision_layer = LAYER_BODY
	collision_mask = LAYER_WORLD
	for key in ["sit", "lie", "belly", "crouch", "ear_back", "eye_open", "tail_height", "wag_amp", "wag_speed", "lean", "kick", "paw", "shake", "head_down", "lift", "scale"]:
		pose[key] = 0.0
	pose["eye_open"] = 1.0
	pose["tail_height"] = 0.9
	pose["scale"] = PUPPY_SCALE
	pose_target = pose.duplicate()
	_build_body()


# ---------------------------------------------------------------- frame loop

func _physics_process(delta: float) -> void:
	_t += delta
	idle_input_time += delta
	bond.decay(delta)
	_attention_timer -= delta
	_lure_timer -= delta
	_sit_hold -= delta
	_react_cooldown -= delta
	_emote_timer -= delta
	if _emote_timer <= 0.0 and emote_label.visible:
		emote_label.visible = false

	if _touching:
		_touch_timer -= delta
		if _touch_timer <= 0.0:
			_end_touch()

	var ctx := {
		"interacting": _touching or _lifted or _lure_timer > 0.0,
		"hand_active": _attention_timer > 0.0,
		"ball_free": ball != null and ball.state == Ball.State.FREE,
		"idle_input_time": idle_input_time,
	}
	var b: int = brain.tick(delta, ctx)
	if b != _last_behavior:
		_enter_behavior(b)

	_reset_pose_targets()
	if _reaction_timer > 0.0:
		_reaction_timer -= delta
		if _reaction_timer <= 0.0:
			_reaction = ""
	if not _touching and not _lifted and _reaction == "" and _lure_timer <= 0.0 and _sit_hold <= 0.0:
		_run_behavior(delta)
	_attention_layer()
	_lure_layer()
	_sit_layer()
	_touch_layer()
	_reaction_layer(delta)
	_lift_layer(delta)

	_update_locomotion(delta)
	_update_mood(delta)
	_apply_pose(delta)
	look.update(neck, head, _look_target, _look_weight, delta, 12.0, _look_tilt)
	neck.rotation.x -= pose["head_down"] * 0.7
	_update_emote_position()

	if _pending_input_usec > 0:
		last_response_ms = (Time.get_ticks_usec() - _pending_input_usec) / 1000.0
		_pending_input_usec = 0


# ---------------------------------------------------------------- public API (called by the hand / HUD)

func mark_input() -> void:
	idle_input_time = 0.0
	_pending_input_usec = Time.get_ticks_usec()


## The hand is near: dogs look at a moving hand.
func notice_hand(point: Vector3, close: bool) -> void:
	if brain.current == Brain.Behavior.SLEEP and not close:
		return
	_attention_point = point
	_attention_timer = 0.8 if close else 0.4


func touch_begin(part: String) -> bool:
	mark_input()
	if _lifted:
		return false
	if brain.current == Brain.Behavior.SLEEP:
		_wake(true)
	if _rng.randf() < bond.flinch_chance():
		_start_reaction("flinch", 0.7)
		emote("움찔")
		reacted.emit("flinch", part)
		return false
	_touching = true
	_touch_timer = TOUCH_TIMEOUT
	_touch_part = part
	_touch_pose = {}
	_react_cooldown = 0.0
	_has_move_target = false
	if brain.current == Brain.Behavior.CHEW or brain.current == Brain.Behavior.ZOOMIES:
		brain.set_behavior(Brain.Behavior.IDLE)
	return true


func pet(part: String, with_grain: bool, hand_point: Vector3, dt: float) -> void:
	if not _touching and not touch_begin(part):
		return
	_touch_timer = TOUCH_TIMEOUT
	_touch_part = part
	_touch_side = signf(to_local(hand_point).x)
	notice_hand(hand_point, true)
	var e: float = bond.enjoyment(part, with_grain)
	bond.on_touch(part, e, dt)
	happiness = clampf(happiness + e * 0.25 * dt, 0.0, 1.0)
	if _react_cooldown <= 0.0:
		_react_cooldown = REACT_INTERVAL
		_apply_touch_reaction(reactions.pick(Reactions.pet_pool(e)), part)


func scratch(part: String, hand_point: Vector3, dt: float) -> void:
	if not _touching and not touch_begin(part):
		return
	_touch_timer = TOUCH_TIMEOUT
	_touch_part = part
	notice_hand(hand_point, true)
	var e: float = bond.enjoyment(part, true) + 0.15
	bond.on_touch(part, e, dt)
	happiness = clampf(happiness + e * 0.3 * dt, 0.0, 1.0)
	if _react_cooldown <= 0.0:
		_react_cooldown = REACT_INTERVAL
		_apply_touch_reaction(reactions.pick(Reactions.scratch_pool(part, e)), part)


func touch_end() -> void:
	if _touching:
		_touch_timer = minf(_touch_timer, 0.15)


func offer_hand(point: Vector3) -> String:
	mark_input()
	if _lifted or brain.current == Brain.Behavior.SLEEP:
		return ""
	notice_hand(point, true)
	var r := ""
	if bond.bond < 0.3:
		r = reactions.pick("offer_stranger")
		_go_to(_point_toward(point, 0.28), WALK_SPEED * 0.6)
		emote("킁킁")
	else:
		r = reactions.pick("offer_friend")
		_start_reaction(r, 1.2, point)
		emote({"head_bump": "부비부비", "lick_hand": "핥짝", "paw_up": "손!"}.get(r, "♪"))
		bond.on_touch("head", 0.5, 0.5)
	reacted.emit(r, "hand")
	return r


func treat_hover(point: Vector3) -> void:
	idle_input_time = 0.0
	if _lifted:
		return
	if brain.current == Brain.Behavior.SLEEP:
		_wake(false)
		emote("킁킁?")
	_lure_point = point
	_lure_timer = 0.3


func treat_give(point: Vector3) -> String:
	mark_input()
	if snout_tip.global_position.distance_to(point) > 0.4 * pose["scale"] / PUPPY_SCALE:
		return ""
	var r := reactions.pick("treat_eat")
	_start_reaction(r, 0.9, point)
	emote({"gobble": "냠냠!", "gentle_take": "오물오물", "crunch": "와작와작"}.get(r, "냠"))
	brain.needs["hunger"] = maxf(0.0, float(brain.needs["hunger"]) - 0.1)
	happiness = minf(1.0, happiness + 0.2)
	bond.on_touch("head", 0.3, 1.0)
	reacted.emit(r, "treat")
	if pose["sit"] > 0.6 and _sit_since >= 0.0:
		var since := _t - _sit_since
		_sit_since = -1.0
		if bond.reward_sit(since):
			return "앉아 성공! 숙련도 %d%%" % int(round(bond.skill_sit * 100.0))
		return "칭찬이 늦었어요 (%.1f초). 앉은 뒤 1초 안에 주세요" % since
	return "간식을 먹었다"


func hand_signal_sit() -> String:
	mark_input()
	if bond.sit_stage() >= 1 and _rng.randf() < bond.obey_chance(happiness):
		_hold_sit(3.0)
		emote("!")
		return "손 신호만으로 앉았다"
	_start_reaction(reactions.pick("confused"), 0.9)
	emote("?")
	return "" if bond.sit_stage() == 0 else "못 본 척한다"


func command_sit() -> String:
	mark_input()
	if bond.sit_stage() < 2:
		_start_reaction(reactions.pick("confused"), 0.9)
		emote("?")
		return "아직 말로는 몰라요 (앉아 숙련도 %d%%)" % int(round(bond.skill_sit * 100.0))
	if _rng.randf() < bond.obey_chance(happiness):
		_hold_sit(3.0)
		emote("!")
		return "\"앉아!\" 앉았다"
	_start_reaction("ear_turn_only", 1.0, camera_point)
	emote("…")
	return "들었으면서 못 들은 척한다"


func call_name() -> String:
	mark_input()
	if brain.current == Brain.Behavior.SLEEP:
		_wake(false)
	if _rng.randf() < bond.come_chance():
		var r := reactions.pick("called_come")
		brain.set_behavior(Brain.Behavior.SEEK_ATTENTION)
		_enter_behavior(brain.current)
		_bs["run"] = r == "run_to_you"
		emote("!")
		reacted.emit(r, "name")
		return "이름을 듣고 달려온다"
	var r2 := reactions.pick("called_ignore")
	_start_reaction(r2, 1.0, camera_point)
	reacted.emit(r2, "name")
	return "귀만 쫑긋하고 하던 일을 한다"


func point_at(point: Vector3) -> String:
	mark_input()
	if _rng.randf() < 0.3 + bond.skill_point * 0.6:
		bond.skill_point = minf(1.0, bond.skill_point + 0.05)
		brain.set_behavior(Brain.Behavior.SNIFF)
		_enter_behavior(brain.current)
		_bs["target"] = _clamp_room(point)
		_go_to(_bs["target"], WALK_SPEED)
		return "가리킨 곳으로 간다"
	bond.skill_point = minf(1.0, bond.skill_point + 0.02)
	_start_reaction("head_tilt", 1.0, _attention_point)
	return "손가락만 쳐다본다"


func stop_command() -> String:
	mark_input()
	var mischief := brain.current == Brain.Behavior.CHEW or brain.current == Brain.Behavior.ZOOMIES
	if mischief:
		var timely := brain.time_in_behavior <= 2.5
		bond.scold(timely)
		brain.set_behavior(Brain.Behavior.IDLE)
		_start_reaction("guilty", 1.6, camera_point)
		emote("…")
		return "멈췄다 (제때 혼냄)" if timely else "멈췄지만 왜 혼나는지 모르는 눈치다 (늦게 혼냄)"
	bond.scold(false)
	_start_reaction("head_tilt", 1.0, camera_point)
	return "혼날 일이 없었는데… 신뢰가 조금 떨어졌다"


func lift_start(point: Vector3) -> String:
	mark_input()
	if not is_puppy:
		_start_reaction("too_heavy", 1.0, camera_point)
		emote("끙…")
		return "다 커서 이제 들어 올릴 수 없어요"
	if brain.current == Brain.Behavior.SLEEP:
		_wake(true)
	_lifted = true
	_lift_point = point
	_has_move_target = false
	if ball != null and ball.state == Ball.State.IN_MOUTH:
		ball.drop_at(mouth_anchor.global_position)
	emote("♪" if bond.bond > 0.3 else "낑")
	return ""


func lift_update(point: Vector3) -> void:
	_lift_point = point


func lift_end() -> void:
	if not _lifted:
		return
	_lifted = false
	var p := _clamp_room(global_position)
	global_position = Vector3(p.x, 0.0, p.z)


func set_puppy(v: bool) -> void:
	is_puppy = v
	pose_target["scale"] = PUPPY_SCALE if v else ADULT_SCALE


func is_lifted() -> bool:
	return _lifted


func current_activity() -> String:
	if _lifted:
		return "lifted"
	if _reaction != "":
		return "reaction:" + _reaction
	if _touching:
		return "touched:" + _touch_part
	if _lure_timer > 0.0:
		return "following treat"
	return brain.behavior_name()


func emote(text: String, duration: float = 1.4) -> void:
	emote_label.text = text
	emote_label.visible = true
	_emote_timer = duration


# ---------------------------------------------------------------- behaviours

func _enter_behavior(b: int) -> void:
	_last_behavior = b
	_bs = {}
	_has_move_target = false
	_arrived = false


func _run_behavior(delta: float) -> void:
	var tib := brain.time_in_behavior
	match brain.current:
		Brain.Behavior.IDLE:
			if not _bs.has("glance"):
				_bs["glance"] = 0.0
			_bs["glance"] = float(_bs["glance"]) - delta
			if float(_bs["glance"]) <= 0.0:
				_bs["glance"] = _rng.randf_range(1.5, 3.0)
				_bs["look"] = camera_point if _rng.randf() < 0.35 else _random_room_point() + Vector3(0, 0.3, 0)
			_look_target = _bs["look"]
			_look_weight = 0.7
			if tib > 4.0:
				pose_target["sit"] = 1.0
			_moment_timer -= delta
			if _moment_timer <= 0.0:
				_moment_timer = _rng.randf_range(5.0, 9.0)
				_play_moment()
			if tib > 7.0:
				brain.mark_finished()
		Brain.Behavior.WANDER:
			if not _bs.has("target"):
				_bs["target"] = _random_room_point()
			_keep_going(_bs["target"], WALK_SPEED)
			_look_ahead(0.4)
			if _arrived or tib > 10.0:
				brain.mark_finished()
		Brain.Behavior.SNIFF:
			if not _bs.has("target"):
				_bs["target"] = _clamp_room(global_position + Vector3(_rng.randf_range(-1, 1), 0, _rng.randf_range(-1, 1)))
				emote("킁킁")
			_keep_going(_bs["target"], WALK_SPEED * 0.5)
			pose_target["head_down"] = 0.9
			_look_ahead(0.2)
			if (_arrived and tib > 3.0) or tib > 9.0:
				brain.mark_finished()
		Brain.Behavior.SLEEP:
			_keep_going(bed_spot, WALK_SPEED * 0.7)
			if _arrived or global_position.distance_to(bed_spot) < 0.2:
				pose_target["lie"] = 1.0
				pose_target["eye_open"] = 0.0
				pose_target["wag_amp"] = 0.0
				_look_weight = 0.0
				if int(tib) % 7 == 0 and _emote_timer <= 0.0:
					emote("쿨…", 1.0)
			else:
				_look_ahead(0.3)
			if float(brain.needs["sleepy"]) < 0.1:
				brain.mark_finished()
		Brain.Behavior.FOLLOW_HAND:
			var p := Vector3(_attention_point.x, 0.0, _attention_point.z)
			if global_position.distance_to(p) > 0.5:
				_go_to(_point_toward(p, 0.35), WALK_SPEED * 1.4)
			if _attention_timer <= 0.0:
				brain.mark_finished()
		Brain.Behavior.SEEK_ATTENTION:
			_keep_going(front_spot, RUN_SPEED if bool(_bs.get("run", false)) else WALK_SPEED * 1.3)
			if _arrived or global_position.distance_to(front_spot) < 0.15:
				pose_target["sit"] = 1.0
				_look_target = camera_point
				_look_weight = 1.0
				_look_tilt = 0.3 if fmod(tib, 6.0) > 3.0 else 0.0
				if tib > 4.0 and not _bs.has("whined"):
					_bs["whined"] = true
					emote("끄응?")
			else:
				_look_ahead(0.5)
			if tib > 11.0:
				brain.mark_finished()
		Brain.Behavior.FETCH:
			_run_fetch(tib)
		Brain.Behavior.ZOOMIES:
			if not _bs.has("angle"):
				_bs["angle"] = atan2(global_position.z + 0.3, global_position.x)
				emote("우다다다!")
			_bs["angle"] = float(_bs["angle"]) + delta * 1.6
			var a: float = _bs["angle"]
			_go_to(Vector3(cos(a) * 1.3, 0.0, sin(a) * 1.0 - 0.3), RUN_SPEED)
			pose_target["ear_back"] = 0.6
			pose_target["wag_amp"] = 0.9
			_look_ahead(0.3)
			if tib > 4.5:
				brain.mark_finished()
		Brain.Behavior.HOWL:
			pose_target["sit"] = 1.0
			_look_target = global_position + Vector3(0, 3.0, -0.3)
			_look_weight = 1.0
			if not _bs.has("howled"):
				_bs["howled"] = true
				emote("아우우우~", 2.4)
			if tib > 2.6:
				brain.mark_finished()
		Brain.Behavior.CHEW:
			if slipper == null:
				brain.mark_finished()
				return
			var sp := Vector3(slipper.global_position.x, 0.0, slipper.global_position.z)
			if not _bs.has("target"):
				_bs["target"] = _point_toward(sp, 0.22)
			_keep_going(_bs["target"], WALK_SPEED)
			if _arrived:
				pose_target["lie"] = 0.7
				pose_target["head_down"] = 1.0
				_look_target = slipper.global_position
				_look_weight = 1.0
				slipper.rotation.y = sin(_t * 9.0) * 0.25
				if _emote_timer <= 0.0:
					emote("질겅질겅", 1.2)
			else:
				_look_ahead(0.5)
			if tib > 7.0:
				brain.mark_finished()


func _run_fetch(tib: float) -> void:
	if ball == null:
		brain.mark_finished()
		return
	if ball.state == Ball.State.IN_HAND:
		brain.mark_finished()
		return
	if ball.state == Ball.State.FREE:
		var bp := Vector3(ball.global_position.x, 0.0, ball.global_position.z)
		_go_to(bp, RUN_SPEED)
		_look_target = ball.global_position
		_look_weight = 1.0
		if snout_tip.global_position.distance_to(ball.global_position) < 0.22 or global_position.distance_to(bp) < 0.2:
			ball.hold_in(mouth_anchor)
			bond.skill_fetch = minf(1.0, bond.skill_fetch + 0.08)
			var bring := _rng.randf() < 0.25 + bond.skill_fetch * 0.75
			_bs["bring"] = bring
			_has_move_target = false
			if bring:
				_go_to(front_spot, RUN_SPEED * 0.8)
			else:
				_go_to(_far_point(), RUN_SPEED)
				emote("메롱~")
	elif ball.state == Ball.State.IN_MOUTH:
		pose_target["wag_amp"] = 1.0
		_look_ahead(0.4)
		if _arrived:
			ball.drop_at(mouth_anchor.global_position)
			if bool(_bs.get("bring", false)):
				emote("또 던져!")
				message.emit("공을 물어 와서 발밑에 놓았다")
			else:
				emote("헥헥")
			brain.mark_finished()
	if tib > 15.0:
		brain.mark_finished()


func _play_moment() -> void:
	var m := reactions.pick("idle_moment")
	if m == "chase_tail" and not is_puppy:
		m = "shake_body"
	_start_reaction(m, {"yawn": 1.6, "sniff_floor": 1.8, "shake_body": 0.9, "look_window": 2.5, "chase_tail": 2.2, "scratch_self": 1.6}.get(m, 1.5), window_point)
	match m:
		"yawn":
			emote("하아암~")
		"sniff_floor":
			emote("킁킁")
		"chase_tail":
			emote("빙글빙글")


func _wake(startled: bool) -> void:
	brain.needs["sleepy"] = maxf(0.0, float(brain.needs["sleepy"]) - 0.3)
	brain.set_behavior(Brain.Behavior.IDLE)
	_enter_behavior(brain.current)
	if startled and bond.trust < 0.5:
		_start_reaction("flinch", 0.6)
		emote("화들짝!")
	else:
		emote("하암…")


# ---------------------------------------------------------------- pose layers

func _reset_pose_targets() -> void:
	for key in pose_target.keys():
		if key != "scale":
			pose_target[key] = 0.0
	pose_target["eye_open"] = 1.0
	pose_target["ear_back"] = 0.1
	var confidence := clampf(bond.trust * 0.5 + happiness * 0.5, 0.0, 1.0)
	pose_target["tail_height"] = lerpf(2.1, 0.55, confidence)
	pose_target["wag_amp"] = 0.08 + happiness * 0.55
	pose_target["wag_speed"] = 5.0 + happiness * 9.0
	_look_target = global_position + global_transform.basis.z * -2.0 + Vector3(0, 0.3, 0)
	_look_weight = 0.3
	_look_tilt = 0.0


func _attention_layer() -> void:
	if _attention_timer > 0.0 and not _lifted and brain.current != Brain.Behavior.SLEEP:
		_look_target = _attention_point
		_look_weight = 1.0
		pose_target["ear_back"] = 0.0


func _lure_layer() -> void:
	if _lure_timer <= 0.0 or _lifted:
		return
	_look_target = _lure_point
	_look_weight = 1.0
	pose_target["ear_back"] = 0.0
	pose_target["wag_amp"] = 0.8
	var flat := Vector3(_lure_point.x, 0.0, _lure_point.z)
	var horiz := Vector2(flat.x - global_position.x, flat.z - global_position.z).length()
	var reach: float = 0.32 * pose["scale"] / PUPPY_SCALE
	if horiz > reach + 0.1:
		_go_to(_point_toward(flat, reach), WALK_SPEED * 1.5)
	else:
		_has_move_target = false
		_face_toward(flat)
		if _lure_point.y > head.global_position.y + 0.1:
			pose_target["sit"] = 1.0
			if pose["sit"] > 0.6 and _sit_since < 0.0:
				_sit_since = _t
		elif _lure_point.y < head.global_position.y - 0.25:
			pose_target["head_down"] = 0.6


func _sit_layer() -> void:
	if _sit_hold > 0.0:
		pose_target["sit"] = 1.0
		_has_move_target = false
		_look_target = camera_point
		_look_weight = 1.0


func _hold_sit(seconds: float) -> void:
	_sit_hold = seconds
	_sit_since = _t
	_has_move_target = false


func _touch_layer() -> void:
	if not _touching:
		return
	_has_move_target = false
	for key in _touch_pose.keys():
		pose_target[key] = _touch_pose[key]


func _apply_touch_reaction(r: String, part: String) -> void:
	_touch_pose = {}
	match r:
		"lean_in":
			_touch_pose = {"lean": 1.0, "eye_open": 0.5, "wag_amp": 0.8}
		"eyes_close":
			_touch_pose = {"eye_open": 0.05, "ear_back": 0.5, "wag_amp": 0.6}
		"tail_thump":
			_touch_pose = {"wag_amp": 1.0, "wag_speed": 15.0, "eye_open": 0.6}
		"melt_down":
			_touch_pose = {"lie": 1.0, "eye_open": 0.3, "wag_amp": 0.7}
			if bond.trust > 0.7:
				_touch_pose["belly"] = 1.0
				emote("배 만져 줘!")
		"soft_wag":
			_touch_pose = {"wag_amp": 0.5}
		"look_up":
			_attention_point = camera_point
			_attention_timer = 1.0
		"sigh":
			_touch_pose = {"eye_open": 0.4}
			emote("후우~")
		"leg_kick":
			_touch_pose = {"kick": 1.0, "eye_open": 0.3, "sit": 0.6}
			emote("다리가 저절로!")
		"groan_happy":
			_touch_pose = {"eye_open": 0.2, "lean": 0.6}
			emote("그르릉♪")
		"turn_head":
			_touch_pose = {"ear_back": 0.6}
			_attention_point = global_position + global_transform.basis.x * (-2.0 * _touch_side) + Vector3(0, 0.3, 0)
			_attention_timer = 1.0
		"shake_off":
			_end_touch()
			_start_reaction("shake_body", 0.9)
			emote("부르르")
		"step_away":
			_end_touch()
			_go_to(_point_away_from(camera_point, 0.6), WALK_SPEED)
			emote("싫어")
	reacted.emit(r, part)


func _end_touch() -> void:
	_touching = false
	_touch_pose = {}
	_touch_part = ""


func _start_reaction(r: String, duration: float, point: Vector3 = Vector3.ZERO) -> void:
	_reaction = r
	_reaction_timer = duration
	_reaction_point = point
	_has_move_target = false


func _reaction_layer(delta: float) -> void:
	if _reaction == "":
		return
	match _reaction:
		"flinch":
			pose_target["crouch"] = 1.0
			pose_target["ear_back"] = 1.0
			pose_target["tail_height"] = 2.4
			pose_target["eye_open"] = 0.7
			velocity = global_transform.basis.z * 0.4
		"shake_body":
			pose_target["shake"] = 1.0
		"yawn":
			_look_target = global_position + Vector3(0, 2.0, -0.5)
			_look_weight = 0.8
			pose_target["eye_open"] = 0.15
		"sniff_floor":
			pose_target["head_down"] = 1.0
		"look_window":
			_look_target = window_point
			_look_weight = 1.0
			pose_target["sit"] = 1.0
		"chase_tail":
			rotation.y += delta * 9.0
			pose_target["wag_amp"] = 1.0
		"scratch_self":
			pose_target["sit"] = 1.0
			pose_target["kick"] = 1.0
			pose_target["eye_open"] = 0.4
		"guilty":
			pose_target["crouch"] = 0.6
			pose_target["ear_back"] = 1.0
			pose_target["tail_height"] = 2.2
			pose_target["wag_amp"] = 0.05
			_look_target = _reaction_point
			_look_weight = 0.5
		"head_tilt", "head_tilt_other":
			_look_target = _reaction_point if _reaction_point != Vector3.ZERO else camera_point
			_look_weight = 1.0
			_look_tilt = 0.4 if _reaction == "head_tilt" else -0.4
		"blink":
			pose_target["eye_open"] = 0.0
		"too_heavy":
			_look_target = camera_point
			_look_weight = 1.0
			pose_target["wag_amp"] = 0.9
		"ear_turn_only", "glance_back":
			_look_target = _reaction_point
			_look_weight = 0.5 if _reaction == "ear_turn_only" else 0.9
			pose_target["ear_back"] = 0.4
		"gobble", "gentle_take", "crunch":
			_look_target = _reaction_point
			_look_weight = 1.0
			pose_target["head_down"] = 0.2
			pose_target["wag_amp"] = 1.0
		"head_bump", "lick_hand":
			_look_target = _reaction_point
			_look_weight = 1.0
			pose_target["lean"] = 0.8
			pose_target["eye_open"] = 0.5
		"paw_up":
			_look_target = _reaction_point
			_look_weight = 1.0
			pose_target["sit"] = 1.0
			pose_target["paw"] = 1.0


func _lift_layer(delta: float) -> void:
	if not _lifted:
		return
	pose_target["lift"] = 1.0
	_look_target = camera_point
	_look_weight = 1.0
	if bond.bond > 0.3:
		pose_target["wag_amp"] = 1.0
	else:
		pose_target["shake"] = 0.4
		pose_target["ear_back"] = 0.7
	var c := _clamp_room(_lift_point)
	var target := Vector3(c.x, clampf(_lift_point.y - 0.25, 0.15, 1.2), c.z)
	global_position = global_position.lerp(target, 1.0 - exp(-14.0 * delta))
	_face_toward(Vector3(camera_point.x, global_position.y, camera_point.z))


# ---------------------------------------------------------------- motion

## Re-issues a walk that a reaction or touch interrupted, until it arrives once.
func _keep_going(p: Vector3, speed: float) -> void:
	if not _arrived and not _has_move_target:
		_go_to(p, speed)


func _go_to(p: Vector3, speed: float) -> void:
	_move_target = _clamp_room(p)
	_move_speed = speed
	_has_move_target = true
	_arrived = false


func _update_locomotion(delta: float) -> void:
	if _lifted:
		_speed_now = 0.0
		return
	var vel := Vector3.ZERO
	if _reaction == "flinch":
		vel = velocity
	elif _has_move_target:
		var to := _move_target - global_position
		to.y = 0.0
		var dist := to.length()
		if dist > 0.06:
			# Stand up before walking off; the sit/lie targets blend this naturally.
			pose_target["sit"] = 0.0
			pose_target["lie"] = 0.0
			var ready_to_walk: bool = pose["sit"] < 0.35 and pose["lie"] < 0.35
			if ready_to_walk:
				vel = to / dist * _move_speed * clampf(dist / 0.3, 0.35, 1.0)
			_face_toward(_move_target, delta)
		else:
			_has_move_target = false
			_arrived = true
	velocity = Vector3(vel.x, 0.0, vel.z)
	move_and_slide()
	var pos := global_position
	pos.y = 0.0
	global_position = pos
	var real := get_real_velocity()
	_speed_now = Vector2(real.x, real.z).length()
	_step_phase += _speed_now * delta * 11.0 / maxf(pose["scale"], 0.3)


func _face_toward(p: Vector3, delta: float = 1.0 / 60.0) -> void:
	var to := p - global_position
	if Vector2(to.x, to.z).length() < 0.01:
		return
	rotation.y = lerp_angle(rotation.y, atan2(-to.x, -to.z), 1.0 - exp(-9.0 * delta))


func _look_ahead(weight: float) -> void:
	if _has_move_target:
		_look_target = _move_target + Vector3(0, 0.25, 0)
	_look_weight = weight


func _update_mood(delta: float) -> void:
	var baseline := 0.35 + bond.bond * 0.4
	happiness = move_toward(happiness, baseline, delta * 0.03)


func _apply_pose(delta: float) -> void:
	var fast := 1.0 - exp(-10.0 * delta)
	var slow := 1.0 - exp(-4.0 * delta)
	for key in pose.keys():
		var rate := slow if key in ["scale", "lie", "belly", "tail_height", "wag_speed"] else fast
		if key == "eye_open":
			rate = 1.0 - exp(-18.0 * delta)
		pose[key] = lerpf(pose[key], pose_target[key], rate)

	var sit: float = pose["sit"]
	var lie: float = pose["lie"]
	var crouch: float = pose["crouch"]
	var s: float = pose["scale"]
	rig.scale = Vector3.ONE * s
	body_shape.size = Vector3(0.3, 0.5, 0.7) * s

	body_pivot.position = Vector3(0.0, 0.42 - sit * 0.06 - lie * 0.24 - crouch * 0.08, sit * 0.05)
	body_pivot.rotation = Vector3(sit * 0.5 - crouch * 0.08, 0.0, pose["lean"] * 0.14 * _touch_side)
	var breath := 1.5 if brain.current == Brain.Behavior.SLEEP else 4.0
	body_pivot.scale = Vector3(1.0, 1.0 + sin(_t * breath) * 0.018, 1.0)
	rig.rotation = Vector3(0.0, 0.0, pose["belly"] * 1.3 + sin(_t * 38.0) * 0.22 * pose["shake"])

	var moving := clampf(_speed_now / (RUN_SPEED * s), 0.0, 1.0)
	var swing := (0.25 + moving * 0.55) if _speed_now > 0.05 else 0.0
	var dangle: float = pose["lift"]
	var front_y := 0.36 - lie * 0.24 - crouch * 0.06
	var back_y := front_y - sit * 0.14
	var kick: float = pose["kick"] * (0.45 + 0.5 * sin(_t * 28.0))
	(legs["fl"] as Node3D).position.y = front_y
	(legs["fr"] as Node3D).position.y = front_y
	(legs["bl"] as Node3D).position.y = back_y
	(legs["br"] as Node3D).position.y = back_y
	(legs["fl"] as Node3D).rotation.x = sin(_step_phase) * swing + lie * 1.35 + sin(_t * 3.0) * 0.15 * dangle
	(legs["fr"] as Node3D).rotation.x = sin(_step_phase + PI) * swing + lie * 1.35 + pose["paw"] * 1.3 + sin(_t * 3.4) * 0.15 * dangle
	(legs["bl"] as Node3D).rotation.x = sin(_step_phase + PI) * swing - lie * 1.35 + sit * 1.25 + sin(_t * 3.1) * 0.15 * dangle
	(legs["br"] as Node3D).rotation.x = sin(_step_phase) * swing - lie * 1.35 + sit * 1.25 + kick + sin(_t * 2.8) * 0.15 * dangle

	tail_root.rotation.y = sin(_t * pose["wag_speed"]) * pose["wag_amp"]
	tail_tilt.rotation.x = pose["tail_height"]
	for ear in ears:
		ear.rotation.x = pose["ear_back"] * 1.0 + sin(_t * 30.0) * 0.3 * pose["shake"]
	for eye in eyes:
		eye.scale = Vector3(1.0, maxf(0.08, pose["eye_open"]), 1.0)


func _update_emote_position() -> void:
	emote_label.global_position = head.global_position + Vector3(0, 0.25, 0)


# ---------------------------------------------------------------- helpers

func _clamp_room(p: Vector3) -> Vector3:
	return Vector3(clampf(p.x, ROOM_MIN.x, ROOM_MAX.x), p.y, clampf(p.z, ROOM_MIN.y, ROOM_MAX.y))


func _random_room_point() -> Vector3:
	return Vector3(_rng.randf_range(ROOM_MIN.x, ROOM_MAX.x), 0.0, _rng.randf_range(ROOM_MIN.y, ROOM_MAX.y))


func _far_point() -> Vector3:
	var best := _random_room_point()
	for i in 4:
		var p := _random_room_point()
		if p.distance_to(front_spot) > best.distance_to(front_spot):
			best = p
	return best


## A point `gap` metres short of `p`, on the line from the dog to `p`.
func _point_toward(p: Vector3, gap: float) -> Vector3:
	var flat := Vector3(p.x, 0.0, p.z)
	var from := Vector3(global_position.x, 0.0, global_position.z)
	var d := flat - from
	if d.length() <= gap:
		return from
	return flat - d.normalized() * gap


func _point_away_from(p: Vector3, distance: float) -> Vector3:
	var d := Vector3(global_position.x - p.x, 0.0, global_position.z - p.z)
	if d.length() < 0.01:
		d = Vector3(0, 0, -1)
	return _clamp_room(global_position + d.normalized() * distance)


static func _toon(c: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = 1.0
	m.diffuse_mode = BaseMaterial3D.DIFFUSE_TOON
	m.specular_mode = BaseMaterial3D.SPECULAR_TOON
	return m


func _node(parent: Node3D, pos: Vector3, node_name: String) -> Node3D:
	var n := Node3D.new()
	n.name = node_name
	n.position = pos
	parent.add_child(n)
	return n


func _mesh(parent: Node3D, mesh: Mesh, mat: Material, pos: Vector3, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = mat
	mi.position = pos
	mi.rotation = rot
	parent.add_child(mi)
	return mi


func _part_area(parent: Node3D, part: String, shape: Shape3D, pos: Vector3, rot: Vector3 = Vector3.ZERO) -> Area3D:
	var area := Area3D.new()
	area.name = "Part_" + part
	area.collision_layer = LAYER_PARTS
	area.collision_mask = 0
	area.monitoring = false
	area.set_meta("part", part)
	area.set_meta("husky", self)
	var cs := CollisionShape3D.new()
	cs.shape = shape
	area.add_child(cs)
	area.position = pos
	area.rotation = rot
	parent.add_child(area)
	return area


static func _sphere(r: float) -> SphereMesh:
	var m := SphereMesh.new()
	m.radius = r
	m.height = r * 2.0
	m.radial_segments = 16
	m.rings = 8
	return m


static func _capsule(r: float, h: float) -> CapsuleMesh:
	var m := CapsuleMesh.new()
	m.radius = r
	m.height = h
	m.radial_segments = 12
	m.rings = 4
	return m


static func _box(size: Vector3) -> BoxMesh:
	var m := BoxMesh.new()
	m.size = size
	return m


static func _sphere_shape(r: float) -> SphereShape3D:
	var s := SphereShape3D.new()
	s.radius = r
	return s


static func _box_shape(size: Vector3) -> BoxShape3D:
	var s := BoxShape3D.new()
	s.size = size
	return s


func _build_body() -> void:
	var dark := _toon(Color(0.32, 0.34, 0.39))
	var white := _toon(Color(0.94, 0.94, 0.96))
	var eye_mat := _toon(Color(0.36, 0.64, 0.96))
	var nose_mat := _toon(Color(0.08, 0.08, 0.1))
	var ear_inner := _toon(Color(0.95, 0.72, 0.74))

	var col := CollisionShape3D.new()
	body_shape = _box_shape(Vector3(0.3, 0.5, 0.7) * PUPPY_SCALE)
	col.shape = body_shape
	col.position = Vector3(0, 0.15, 0)
	add_child(col)

	rig = _node(self, Vector3.ZERO, "Rig")
	body_pivot = _node(rig, Vector3(0, 0.42, 0), "Body")
	_mesh(body_pivot, _capsule(0.15, 0.62), dark, Vector3.ZERO, Vector3(PI / 2.0, 0, 0))
	_mesh(body_pivot, _capsule(0.12, 0.5), white, Vector3(0, -0.05, 0), Vector3(PI / 2.0, 0, 0))
	_mesh(body_pivot, _sphere(0.12), white, Vector3(0, -0.02, -0.22))
	_part_area(body_pivot, "back", _box_shape(Vector3(0.26, 0.1, 0.5)), Vector3(0, 0.12, 0))
	_part_area(body_pivot, "belly", _box_shape(Vector3(0.22, 0.08, 0.4)), Vector3(0, -0.14, 0))
	_part_area(body_pivot, "butt", _sphere_shape(0.1), Vector3(0, 0.03, 0.27))

	neck = _node(body_pivot, Vector3(0, 0.06, -0.26), "Neck")
	_mesh(neck, _capsule(0.08, 0.22), dark, Vector3(0, 0.06, -0.02), Vector3(-0.5, 0, 0))
	head = _node(neck, Vector3(0, 0.14, -0.06), "Head")
	_mesh(head, _sphere(0.12), dark, Vector3.ZERO)
	_mesh(head, _sphere(0.1), white, Vector3(0, -0.025, -0.045))
	_mesh(head, _box(Vector3(0.1, 0.08, 0.13)), white, Vector3(0, -0.045, -0.13))
	_mesh(head, _sphere(0.022), nose_mat, Vector3(0, -0.015, -0.2))
	snout_tip = _node(head, Vector3(0, -0.04, -0.2), "SnoutTip")
	mouth_anchor = _node(head, Vector3(0, -0.075, -0.18), "Mouth")
	for side in [-1.0, 1.0]:
		var eye := _node(head, Vector3(0.05 * side, 0.025, -0.1), "Eye")
		_mesh(eye, _sphere(0.02), eye_mat, Vector3.ZERO)
		eyes.append(eye)
		var ear := _node(head, Vector3(0.065 * side, 0.09, 0.0), "Ear")
		var prism := PrismMesh.new()
		prism.size = Vector3(0.07, 0.11, 0.03)
		_mesh(ear, prism, dark, Vector3(0, 0.055, 0))
		var inner := PrismMesh.new()
		inner.size = Vector3(0.04, 0.07, 0.01)
		_mesh(ear, inner, ear_inner, Vector3(0, 0.045, -0.016))
		ears.append(ear)
		_part_area(head, "ear_back", _sphere_shape(0.05), Vector3(0.07 * side, 0.07, 0.05))
	_part_area(head, "chin", _sphere_shape(0.055), Vector3(0, -0.09, -0.1))
	_part_area(head, "head", _sphere_shape(0.12), Vector3.ZERO)

	tail_root = _node(body_pivot, Vector3(0, 0.08, 0.3), "TailRoot")
	tail_tilt = _node(tail_root, Vector3.ZERO, "TailTilt")
	_mesh(tail_tilt, _capsule(0.04, 0.28), dark, Vector3(0, 0.14, 0))
	_mesh(tail_tilt, _sphere(0.035), white, Vector3(0, 0.27, 0))
	var tail_shape := CapsuleShape3D.new()
	tail_shape.radius = 0.05
	tail_shape.height = 0.3
	_part_area(tail_tilt, "tail", tail_shape, Vector3(0, 0.14, 0))

	for key in ["fl", "fr", "bl", "br"]:
		var x := -0.09 if key.ends_with("l") else 0.09
		var z := -0.2 if key.begins_with("f") else 0.2
		var leg := _node(rig, Vector3(x, 0.36, z), "Leg_" + key)
		_mesh(leg, _capsule(0.045, 0.36), white, Vector3(0, -0.17, 0))
		_mesh(leg, _sphere(0.05), white, Vector3(0, -0.33, -0.01))
		legs[key] = leg

	emote_label = Label3D.new()
	emote_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	emote_label.no_depth_test = true
	emote_label.font_size = 48
	emote_label.outline_size = 12
	emote_label.pixel_size = 0.0022
	emote_label.modulate = Color(0.15, 0.15, 0.2)
	emote_label.outline_modulate = Color(1, 1, 1)
	emote_label.font = _korean_font()
	emote_label.visible = false
	add_child(emote_label)


static func _korean_font() -> SystemFont:
	var f := SystemFont.new()
	f.font_names = PackedStringArray(["Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans CJK KR", "Noto Sans KR", "NanumGothic", "sans-serif"])
	return f
