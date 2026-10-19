extends SceneTree
## Headless tests. Run from the repo root:
##   godot --headless --path godot --fixed-fps 60 -s res://tests/run_tests.gd
## Unit tests run first, then the main scene plays a scripted scenario that
## exercises every interaction path. Exit code 1 if any check fails.

const GestureRecognizer := preload("res://scripts/hand/gesture_recognizer.gd")
const Bond := preload("res://scripts/husky/bond.gd")
const Brain := preload("res://scripts/husky/brain.gd")
const Reactions := preload("res://scripts/husky/reactions.gd")
const Ball := preload("res://scripts/toys/ball.gd")

const SMOKE_FRAMES := 900
const DT := 1.0 / 60.0

var _checks := 0
var _failures := 0
var _frames := 0
var _main: Node


func _initialize() -> void:
	print("== unit tests ==")
	_test_gestures()
	_test_brain()
	_test_bond()
	_test_sit_learning()
	_test_reactions()
	print("== smoke test: main scene, %d frames ==" % SMOKE_FRAMES)
	_main = (load("res://scenes/main.tscn") as PackedScene).instantiate()
	root.add_child(_main)


func _process(_delta: float) -> bool:
	_frames += 1
	_scenario(_frames)
	if _frames >= SMOKE_FRAMES:
		_finish()
	return false


func check(cond: bool, what: String) -> void:
	_checks += 1
	if cond:
		print("  ok   ", what)
	else:
		_failures += 1
		printerr("  FAIL ", what)


func _finish() -> void:
	print("== %d checks, %d failed ==" % [_checks, _failures])
	quit(1 if _failures > 0 else 0)


# ---------------------------------------------------------------- unit tests

func _test_gestures() -> void:
	var g := GestureRecognizer.new()
	var t := 0.0
	var p := Vector2(100, 100)
	g.press(p, t)
	for i in 18:
		t += DT
		p += Vector2(400.0 * DT, 0)
		g.add_sample(p, t)
	check(g.classify(t) == GestureRecognizer.Kind.STROKE, "straight drag at 400px/s is a stroke")
	check(g.stroke_dir.x > 0.9, "stroke direction points right")
	g.release(p, t)
	check(g.classify(t) == GestureRecognizer.Kind.NONE, "released pointer is no gesture")

	t += 1.0
	var c := Vector2(300, 300)
	g.press(c + Vector2(15, 0), t)
	for i in 30:
		t += DT
		var a := TAU * 1.5 * float(i + 1) / 30.0
		g.add_sample(c + Vector2(cos(a), sin(a)) * 15.0, t)
	check(g.classify(t) == GestureRecognizer.Kind.SCRATCH, "small fast circles are a scratch")
	g.release(c, t)

	t += 1.0
	var q := Vector2(500, 200)
	g.press(q, t)
	for i in 30:
		t += DT
		g.add_sample(q, t)
	check(g.classify(t) == GestureRecognizer.Kind.HOLD_STILL, "pressing still for 0.5s is a hold")
	check(g.still_duration(t) >= 0.45, "still duration measured")
	g.release(q, t)

	t += 0.6
	check(not g.press(q, t), "a lone click is not a double click")
	g.release(q, t)
	t += 0.15
	check(g.press(q, t), "two quick clicks are a double click")
	g.release(q, t)
	t += 0.15
	check(not g.press(q, t), "a third click starts over")
	g.release(q, t)


func _test_brain() -> void:
	var b := Brain.new(1)
	var ctx := {"idle_input_time": 0.0}
	b.needs = {"hunger": 0.1, "sleepy": 0.95, "bored": 0.1, "curious": 0.1, "affection": 0.1}
	check(b.best_behavior(ctx) == Brain.Behavior.SLEEP, "very sleepy dog chooses to sleep")
	b.needs = {"hunger": 0.1, "sleepy": 0.05, "bored": 0.1, "curious": 0.1, "affection": 0.95}
	check(b.best_behavior(ctx) == Brain.Behavior.SEEK_ATTENTION, "affection-starved dog seeks attention")
	b.needs = {"hunger": 0.1, "sleepy": 0.05, "bored": 0.95, "curious": 0.1, "affection": 0.1}
	check(b.best_behavior({"ball_free": true}) == Brain.Behavior.FETCH, "bored dog with a free ball goes to fetch")
	check(b.best_behavior({"ball_free": false}) != Brain.Behavior.FETCH, "no fetch without a free ball")

	b.needs = {"hunger": 0.1, "sleepy": 0.95, "bored": 0.1, "curious": 0.1, "affection": 0.1}
	b.set_behavior(Brain.Behavior.IDLE)
	b.tick(0.1, ctx)
	check(b.current == Brain.Behavior.IDLE, "hysteresis: no switch before min duration")
	for i in 25:
		b.tick(0.1, ctx)
	check(b.current == Brain.Behavior.SLEEP, "switches to sleep after min duration")
	b.set_behavior(Brain.Behavior.IDLE)
	for i in 40:
		b.tick(0.1, {"interacting": true})
	check(b.current == Brain.Behavior.IDLE, "no autonomous switch while being touched")


func _test_bond() -> void:
	var bd := Bond.new(7)
	var fav: String = bd.favourites[0]
	check(bd.enjoyment(fav, true) > bd.enjoyment("tail", true), "favourite spot beats the tail")
	check(bd.enjoyment(fav, false) < bd.enjoyment(fav, true), "against the grain feels worse")
	var before := bd.bond
	for i in 120:
		bd.on_touch(fav, bd.enjoyment(fav, true), DT)
	check(bd.bond > before, "petting the favourite spot raises bond")
	var flinch0 := bd.flinch_chance()
	var trust0 := bd.trust
	for i in 4:
		bd.scold(false)
	check(bd.trust < trust0 - 0.2, "unjustified scolding drops trust fast")
	check(bd.flinch_chance() > flinch0, "a scolded dog flinches more")
	bd.remember("vet", 0.5)
	check(is_equal_approx(bd.memory("vet"), 0.5), "memories are stored")
	bd.decay(100.0)
	check(bd.memory("vet") == 0.0, "memories fade")


func _test_sit_learning() -> void:
	var bd := Bond.new(3)
	check(bd.sit_stage() == 0, "starts needing a treat lure")
	check(not bd.reward_sit(1.6), "praise after 1.6s teaches nothing")
	check(bd.skill_sit == 0.0, "late praise leaves skill unchanged")
	for i in 5:
		bd.reward_sit(0.5)
	check(bd.sit_stage() == 1, "five timely rewards unlock the hand signal")
	for i in 5:
		bd.reward_sit(0.4)
	check(bd.sit_stage() == 2, "ten timely rewards unlock the voice command")


func _test_reactions() -> void:
	var r := Reactions.new(5)
	var prev := ""
	var repeated := false
	for i in 200:
		var x := r.pick("pet_love")
		if x == prev:
			repeated = true
		prev = x
	check(not repeated, "the same reaction never plays twice in a row")
	check(Reactions.pet_pool(0.8) == "pet_love", "high enjoyment -> love pool")
	check(Reactions.pet_pool(-0.5) == "pet_dislike", "low enjoyment -> dislike pool")
	check(Reactions.scratch_pool("chin", 0.5) == "scratch_good", "a good chin scratch -> leg kick pool")


# ---------------------------------------------------------------- smoke scenario

func _scenario(f: int) -> void:
	if _main == null:
		return
	var husky = _main.get("husky")
	var hand = _main.get("hand")
	var hud = _main.get("hud")
	var ball = _main.get("ball")
	if husky == null:
		return
	var head: Vector3 = husky.head.global_position
	match f:
		5:
			check(husky.rig != null and husky.legs.size() == 4, "husky body built (4 legs)")
		10:
			print("  call: ", husky.call_name())
		100:
			check(husky.bond.bond > 0.2, "petting in the scene raised bond")
		200:
			print("  treat: ", husky.treat_give(husky.snout_tip.global_position))
		210:
			husky.offer_hand(head)
		220:
			print("  lift: '", husky.lift_start(head + Vector3(0, 0.2, 0)), "'")
			check(husky.is_lifted(), "puppy can be lifted")
		250:
			husky.lift_end()
			check(not husky.is_lifted(), "puppy put back down")
			check(absf(husky.global_position.y) < 0.001, "puppy back on the floor")
		260:
			husky.set_puppy(false)
		300:
			print("  adult lift: ", husky.lift_start(head))
			check(not husky.is_lifted(), "adult is too heavy to lift")
		310:
			ball.pick_up()
			check(hand.has_ball(), "ball in hand")
		312:
			hand.call("_throw", Vector2(0, -900))
			check(ball.state == Ball.State.FREE, "thrown ball is free")
		330:
			print("  stop: ", husky.stop_command())
			print("  point: ", husky.point_at(Vector3(1.0, 0.0, -1.0)))
			print("  sit cmd: ", husky.command_sit())
		340:
			hud.toggle_debug()
			print(hud.debug_text())
		400:
			husky.brain.needs["sleepy"] = 1.0
			husky.brain.set_behavior(Brain.Behavior.SLEEP)
		420:
			husky.call("_start_reaction", "head_tilt", 0.6, Vector3.ZERO)
		890:
			check(husky.global_position.distance_to(husky.bed_spot) < 0.35, "interrupted walk to bed still arrives")
			check(float(husky.pose["lie"]) > 0.5, "sleeping husky lies down on the bed")
		899:
			var pos: Vector3 = husky.global_position
			check(is_finite(pos.x) and is_finite(pos.z), "husky position stays finite")
			check(pos.x >= -2.31 and pos.x <= 2.31 and pos.z >= -1.81 and pos.z <= 0.96, "husky stays inside the room")
			check(husky.last_response_ms < 100.0, "input-to-response under 100 ms (%.1f)" % husky.last_response_ms)
	if f >= 30 and f < 90:
		husky.pet("head", true, head, DT)
	elif f >= 100 and f < 130:
		husky.scratch("chin", head, DT)
	elif f >= 140 and f < 200:
		husky.treat_hover(head + Vector3(0, 0.3, 0))
	elif f >= 220 and f < 250:
		husky.lift_update(head + Vector3(0.2, 0.25, 0))
