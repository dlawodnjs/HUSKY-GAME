extends RefCounted
## Utility AI: every behaviour scores itself from the husky's needs and context,
## and the best one wins (with hysteresis so the dog doesn't flicker between ideas).

enum Behavior { IDLE, WANDER, SNIFF, SLEEP, FOLLOW_HAND, SEEK_ATTENTION, FETCH, ZOOMIES, HOWL, CHEW }

const NAMES := {
	Behavior.IDLE: "idle",
	Behavior.WANDER: "wander",
	Behavior.SNIFF: "sniff",
	Behavior.SLEEP: "sleep",
	Behavior.FOLLOW_HAND: "follow_hand",
	Behavior.SEEK_ATTENTION: "seek_attention",
	Behavior.FETCH: "fetch",
	Behavior.ZOOMIES: "zoomies",
	Behavior.HOWL: "howl",
	Behavior.CHEW: "chew",
}
const MIN_DURATION := {
	Behavior.IDLE: 2.0,
	Behavior.WANDER: 3.0,
	Behavior.SNIFF: 3.0,
	Behavior.SLEEP: 12.0,
	Behavior.FOLLOW_HAND: 1.5,
	Behavior.SEEK_ATTENTION: 6.0,
	Behavior.FETCH: 2.0,
	Behavior.ZOOMIES: 4.0,
	Behavior.HOWL: 2.5,
	Behavior.CHEW: 4.0,
}
const HYSTERESIS := 0.12

var needs := {"hunger": 0.2, "sleepy": 0.1, "bored": 0.3, "curious": 0.5, "affection": 0.4}
var current: int = Behavior.IDLE
var time_in_behavior := 0.0
var finished := false

var _rng := RandomNumberGenerator.new()
var _noise := {}


func _init(seed_value: int = -1) -> void:
	if seed_value >= 0:
		_rng.seed = seed_value
	else:
		_rng.randomize()


## ctx keys: interacting, hand_active, ball_free, idle_input_time
func tick(dt: float, ctx: Dictionary) -> int:
	_update_needs(dt, ctx)
	time_in_behavior += dt
	if bool(ctx.get("interacting", false)):
		return current
	if int(time_in_behavior) != int(time_in_behavior - dt):
		_reroll_noise()
	var best := best_behavior(ctx)
	var min_time: float = MIN_DURATION.get(current, 2.0)
	var can_switch := finished or time_in_behavior >= min_time
	if best != current and can_switch and score(best, ctx) > score(current, ctx) + (0.0 if finished else HYSTERESIS):
		set_behavior(best)
	elif finished and best == current:
		set_behavior(best)
	return current


func set_behavior(b: int) -> void:
	current = b
	time_in_behavior = 0.0
	finished = false


func mark_finished() -> void:
	finished = true


func best_behavior(ctx: Dictionary) -> int:
	var best: int = Behavior.IDLE
	var best_score := -INF
	for b in NAMES.keys():
		var s := score(b, ctx) + float(_noise.get(b, 0.0))
		if s > best_score:
			best_score = s
			best = b
	return best


func score(b: int, ctx: Dictionary) -> float:
	var hunger: float = needs["hunger"]
	var sleepy: float = needs["sleepy"]
	var bored: float = needs["bored"]
	var curious: float = needs["curious"]
	var affection: float = needs["affection"]
	var idle_input: float = ctx.get("idle_input_time", 0.0)
	match b:
		Behavior.IDLE:
			return 0.2
		Behavior.WANDER:
			return 0.1 + curious * 0.35
		Behavior.SNIFF:
			return curious * 0.45 + hunger * 0.1
		Behavior.SLEEP:
			return sleepy * 1.3 - 0.25 + (0.35 if idle_input > 45.0 else 0.0)
		Behavior.FOLLOW_HAND:
			return 0.12 + affection * 0.5 if bool(ctx.get("hand_active", false)) else -1.0
		Behavior.SEEK_ATTENTION:
			return affection * 0.95 - 0.2 + (0.2 if idle_input > 12.0 else 0.0)
		Behavior.FETCH:
			return 0.25 + bored * 0.7 if bool(ctx.get("ball_free", false)) else -1.0
		Behavior.ZOOMIES:
			return bored * 0.65 - sleepy * 0.6 - 0.05
		Behavior.HOWL:
			return bored * 0.3 + affection * 0.25 - 0.3
		Behavior.CHEW:
			return bored * 0.8 - 0.3
	return -1.0


func behavior_name(b: int = -1) -> String:
	return NAMES.get(current if b < 0 else b, "?")


func _update_needs(dt: float, ctx: Dictionary) -> void:
	var interacting := bool(ctx.get("interacting", false))
	var active := current in [Behavior.WANDER, Behavior.ZOOMIES, Behavior.FETCH]
	_add("hunger", dt * 0.002)
	if current == Behavior.SLEEP:
		_add("sleepy", -dt * 0.03)
		_add("bored", -dt * 0.01)
	else:
		_add("sleepy", dt * (0.006 if active else 0.003))
	if interacting:
		_add("affection", -dt * 0.06)
		_add("bored", -dt * 0.05)
	else:
		_add("affection", dt * 0.01)
		if current not in [Behavior.FETCH, Behavior.ZOOMIES, Behavior.CHEW]:
			_add("bored", dt * 0.012)
		else:
			_add("bored", -dt * 0.04)
	if current in [Behavior.WANDER, Behavior.SNIFF]:
		_add("curious", -dt * 0.03)
	else:
		_add("curious", dt * 0.008)


func _add(key: String, amount: float) -> void:
	needs[key] = clampf(float(needs[key]) + amount, 0.0, 1.0)


func _reroll_noise() -> void:
	for b in NAMES.keys():
		_noise[b] = _rng.randf_range(-0.04, 0.04)
