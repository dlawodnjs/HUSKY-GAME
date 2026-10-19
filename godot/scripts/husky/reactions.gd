extends RefCounted
## Picks which reaction to play for a gesture. Every pool has variants and the
## same reaction never plays twice in a row, so repeated petting doesn't feel canned.

const POOLS := {
	"pet_love": ["lean_in", "eyes_close", "tail_thump", "melt_down"],
	"pet_ok": ["soft_wag", "look_up", "sigh"],
	"pet_dislike": ["shake_off", "turn_head", "step_away"],
	"scratch_good": ["leg_kick", "lean_in", "groan_happy"],
	"scratch_ok": ["soft_wag", "look_up", "sigh"],
	"offer_stranger": ["sniff_hand", "sniff_hand_slow"],
	"offer_friend": ["head_bump", "lick_hand", "paw_up"],
	"treat_eat": ["gobble", "gentle_take", "crunch"],
	"called_come": ["run_to_you", "trot_to_you"],
	"called_ignore": ["ear_turn_only", "glance_back"],
	"confused": ["head_tilt", "head_tilt_other", "blink"],
	"idle_moment": ["yawn", "sniff_floor", "shake_body", "look_window", "chase_tail", "scratch_self"],
}

var last := ""
var _rng := RandomNumberGenerator.new()


func _init(seed_value: int = -1) -> void:
	if seed_value >= 0:
		_rng.seed = seed_value
	else:
		_rng.randomize()


func pick(pool_name: String) -> String:
	var pool: Array = POOLS.get(pool_name, [])
	if pool.is_empty():
		return ""
	var choices: Array = []
	for r in pool:
		if r != last or pool.size() == 1:
			choices.append(r)
	var chosen: String = choices[_rng.randi_range(0, choices.size() - 1)]
	last = chosen
	return chosen


static func pet_pool(enjoy: float) -> String:
	if enjoy > 0.45:
		return "pet_love"
	if enjoy > -0.1:
		return "pet_ok"
	return "pet_dislike"


static func scratch_pool(part: String, enjoy: float) -> String:
	if part in ["chin", "ear_back", "butt"] and enjoy > 0.2:
		return "scratch_good"
	if enjoy > -0.1:
		return "scratch_ok"
	return "pet_dislike"
