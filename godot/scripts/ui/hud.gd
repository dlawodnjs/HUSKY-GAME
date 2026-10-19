extends CanvasLayer
## Minimal HUD: the hand toolbar, voice buttons, a feedback line and an F1
## debug panel that exposes the hidden values the game itself never shows.

const Husky := preload("res://scripts/husky/husky.gd")
const Hand := preload("res://scripts/hand/hand.gd")

var husky: Husky
var hand: Hand

var _root: Control
var _toast: Label
var _debug: Label
var _slots: Array[Button] = []
var _toast_timer := 0.0
var _debug_timer := 0.0
var _last_reaction := "-"


func _ready() -> void:
	layer = 5
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var theme := Theme.new()
	theme.default_font = Husky._korean_font()
	theme.default_font_size = 18
	_root.theme = theme
	add_child(_root)

	_toast = Label.new()
	_place(_toast, Vector2(0.5, 0.0), Rect2(-400, 18, 800, 40))
	_toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast.add_theme_font_size_override("font_size", 22)
	_toast.add_theme_color_override("font_color", Color(0.15, 0.13, 0.12))
	_toast.add_theme_color_override("font_outline_color", Color(1, 1, 1))
	_toast.add_theme_constant_override("outline_size", 8)
	_toast.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_toast)

	var bar := HBoxContainer.new()
	_place(bar, Vector2(0.5, 1.0), Rect2(-340, -64, 680, 48))
	bar.alignment = BoxContainer.ALIGNMENT_CENTER
	bar.add_theme_constant_override("separation", 8)
	_root.add_child(bar)
	for i in Hand.ITEM_NAMES.size():
		var b := _button("%d %s" % [i + 1, Hand.ITEM_NAMES[i]])
		b.pressed.connect(_on_slot.bind(i))
		bar.add_child(b)
		_slots.append(b)
	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(24, 0)
	bar.add_child(spacer)
	var call_btn := _button("이름 부르기")
	call_btn.pressed.connect(func() -> void: show_message(husky.call_name()))
	bar.add_child(call_btn)
	var sit_btn := _button("\"앉아!\"")
	sit_btn.pressed.connect(func() -> void: show_message(husky.command_sit()))
	bar.add_child(sit_btn)

	_debug = Label.new()
	_debug.position = Vector2(14, 12)
	_debug.add_theme_font_size_override("font_size", 15)
	_debug.add_theme_color_override("font_color", Color(0.1, 0.1, 0.12))
	_debug.add_theme_color_override("font_outline_color", Color(1, 1, 1, 0.9))
	_debug.add_theme_constant_override("outline_size", 6)
	_debug.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_debug.visible = false
	_root.add_child(_debug)

	var hint := Label.new()
	_place(hint, Vector2(1.0, 1.0), Rect2(-420, -100, 400, 28))
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	hint.text = "F1 숨은 값 보기 · F2 아기/성견 · Space 안 돼!"
	hint.add_theme_font_size_override("font_size", 14)
	hint.add_theme_color_override("font_color", Color(0.25, 0.22, 0.2, 0.8))
	hint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(hint)

	if husky != null:
		husky.reacted.connect(func(r: String, d: String) -> void: _last_reaction = "%s (%s)" % [r, d])
		husky.message.connect(show_message)
	if hand != null:
		hand.feedback.connect(show_message)


func _process(delta: float) -> void:
	_toast_timer -= delta
	_toast.modulate.a = clampf(_toast_timer, 0.0, 1.0)
	if hand != null:
		for i in _slots.size():
			var active := hand.item == i
			_slots[i].modulate = Color(1, 1, 1) if active else Color(1, 1, 1, 0.55)
			_slots[i].disabled = i == Hand.Item.BALL and not hand.has_ball()
	_debug_timer -= delta
	if _debug.visible and _debug_timer <= 0.0:
		_debug_timer = 0.1
		_debug.text = debug_text()


func show_message(text: String) -> void:
	if text == "":
		return
	_toast.text = text
	_toast_timer = 2.8


func toggle_debug() -> void:
	_debug.visible = not _debug.visible


func debug_text() -> String:
	if husky == null:
		return ""
	var b := husky.bond
	var n := husky.brain.needs
	return "\n".join([
		"[숨은 값 — 실제 게임에서는 행동으로만 보임]",
		"지금: %s" % husky.current_activity(),
		"유대 %.2f · 신뢰 %.2f · 기분 %.2f · 혼남 %.1f" % [b.bond, b.trust, husky.happiness, b.scold_level],
		"배고픔 %.2f · 졸림 %.2f · 심심함 %.2f · 호기심 %.2f · 애정 %.2f" % [n["hunger"], n["sleepy"], n["bored"], n["curious"], n["affection"]],
		"앉아 %d%% (단계 %d) · 물어 오기 %d%% · 가리키기 %d%%" % [roundi(b.skill_sit * 100.0), b.sit_stage(), roundi(b.skill_fetch * 100.0), roundi(b.skill_point * 100.0)],
		"좋아하는 부위(비밀): %s" % ", ".join(PackedStringArray(b.favourites)),
		"마지막 반응: %s" % _last_reaction,
		"입력→반응: %.1f ms" % husky.last_response_ms,
		"손: %s · 부위: %s · 손짓: %s" % [hand.item_name(), hand.hover_part if hand.hover_part != "" else "-", hand.last_gesture],
		"크기: %s" % ("아기" if husky.is_puppy else "성견"),
	])


## Anchors `c` to a point of the screen (0..1 on each axis) and offsets it by `rect`.
func _place(c: Control, anchor: Vector2, rect: Rect2) -> void:
	c.anchor_left = anchor.x
	c.anchor_right = anchor.x
	c.anchor_top = anchor.y
	c.anchor_bottom = anchor.y
	c.offset_left = rect.position.x
	c.offset_top = rect.position.y
	c.offset_right = rect.end.x
	c.offset_bottom = rect.end.y


func _button(text: String) -> Button:
	var b := Button.new()
	b.text = text
	b.focus_mode = Control.FOCUS_NONE
	b.custom_minimum_size = Vector2(0, 44)
	return b


func _on_slot(i: int) -> void:
	hand.set_item(i)
