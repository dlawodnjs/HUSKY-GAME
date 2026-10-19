extends RefCounted
## The relationship between the player's hand and this husky.
## Bond and trust are hidden values; the game shows them through behaviour only.

const PARTS := ["head", "chin", "ear_back", "back", "belly", "butt", "tail"]
const SIT_REWARD_WINDOW := 1.0  # seconds: praise later than this teaches nothing
const SIT_SIGNAL_SKILL := 0.5   # hand signal works from here
const SIT_VOICE_SKILL := 1.0    # voice command works from here

var bond := 0.2        # 0..1, grows slowly with good interaction
var trust := 0.6       # 0..1, drops fast with bad interaction, recovers slowly
var scold_level := 0.0 # short-term memory of being scolded, decays
var part_pref := {}    # part -> -1..1 (hidden favourite spots + hand habits)
var favourites: Array = []
var memories: Array = []  # [{"kind": String, "strength": float}]
var skill_sit := 0.0
var skill_fetch := 0.0
var skill_point := 0.0

var _rng := RandomNumberGenerator.new()


func _init(seed_value: int = -1) -> void:
	if seed_value >= 0:
		_rng.seed = seed_value
	else:
		_rng.randomize()
	for part in PARTS:
		part_pref[part] = 0.1
	var pool := ["chin", "ear_back", "butt", "head", "back"]
	var first: String = pool[_rng.randi_range(0, pool.size() - 1)]
	pool.erase(first)
	var second: String = pool[_rng.randi_range(0, pool.size() - 1)]
	favourites = [first, second]
	part_pref[first] = 0.8
	part_pref[second] = 0.55
	part_pref["tail"] = -0.5  # most dogs dislike tail handling
	part_pref["belly"] = -0.1  # needs trust first


## How much this touch feels good, -1..1.
func enjoyment(part: String, with_grain: bool) -> float:
	var e: float = part_pref.get(part, 0.0)
	e += 0.15 if with_grain else -0.35
	e += (trust - 0.5) * 0.4
	if part == "belly":
		e += (trust - 0.6) * 1.2
	e -= scold_level * 0.2
	return clampf(e, -1.0, 1.0)


## Called while being touched. Habit: often-petted spots slowly become liked.
func on_touch(part: String, quality: float, dt: float) -> void:
	bond = clampf(bond + quality * 0.02 * dt, 0.0, 1.0)
	if quality > 0.0:
		trust = clampf(trust + 0.01 * dt, 0.0, 1.0)
		part_pref[part] = move_toward(float(part_pref.get(part, 0.0)), 1.0, 0.004 * dt)


func flinch_chance() -> float:
	return clampf(scold_level * 0.15 + (0.5 - trust) * 0.6, 0.0, 0.9)


## A scold right after mischief teaches; a late or unjustified one only hurts trust.
func scold(timely: bool) -> void:
	trust = clampf(trust - (0.01 if timely else 0.06), 0.0, 1.0)
	scold_level += 1.0
	remember("scolded", 1.0)


func reward_sit(seconds_since_sit: float) -> bool:
	if seconds_since_sit > SIT_REWARD_WINDOW:
		return false
	skill_sit = minf(1.0, skill_sit + 0.1)
	bond = minf(1.0, bond + 0.01)
	return true


## 0 = needs a treat lure, 1 = hand signal works, 2 = voice command works.
func sit_stage() -> int:
	if skill_sit >= SIT_VOICE_SKILL - 0.0001:
		return 2
	if skill_sit >= SIT_SIGNAL_SKILL - 0.0001:
		return 1
	return 0


## Even a trained husky sometimes pretends not to hear.
func obey_chance(happiness: float) -> float:
	return clampf(0.55 + bond * 0.3 + happiness * 0.1 - scold_level * 0.05, 0.3, 0.95)


func come_chance() -> float:
	return clampf(0.2 + bond * 0.8, 0.0, 0.97)


func remember(kind: String, strength: float) -> void:
	for m in memories:
		if m["kind"] == kind:
			m["strength"] = minf(1.0, float(m["strength"]) + strength)
			return
	memories.append({"kind": kind, "strength": minf(1.0, strength)})


func memory(kind: String) -> float:
	for m in memories:
		if m["kind"] == kind:
			return float(m["strength"])
	return 0.0


func decay(dt: float) -> void:
	scold_level = maxf(0.0, scold_level - dt * 0.05)
	for i in range(memories.size() - 1, -1, -1):
		memories[i]["strength"] = float(memories[i]["strength"]) - dt * 0.01
		if float(memories[i]["strength"]) <= 0.0:
			memories.remove_at(i)
