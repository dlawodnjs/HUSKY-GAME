extends SceneTree
## Renders the sandbox and saves screenshots of key moments, for reviewing
## poses without opening the editor. Needs a display (or Xvfb):
##   xvfb-run -s "-screen 0 1280x720x24" godot --path godot --rendering-driver opengl3 \
##     --fixed-fps 60 -s res://tools/capture_screens.gd -- --out=/tmp/shots

const Hand := preload("res://scripts/hand/hand.gd")
const Brain := preload("res://scripts/husky/brain.gd")
const DT := 1.0 / 60.0

var _main: Node
var _frame := 0
var _out := "user://shots"


func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="):
			_out = arg.substr(6)
	DirAccess.make_dir_recursive_absolute(_out)
	_main = (load("res://scenes/main.tscn") as PackedScene).instantiate()
	root.add_child(_main)


func _process(_delta: float) -> bool:
	_frame += 1
	var husky = _main.get("husky")
	var hand = _main.get("hand")
	var hud = _main.get("hud")
	var cam: Camera3D = _main.get("camera")
	var head: Vector3 = husky.head.global_position
	match _frame:
		90:
			_shot("01_idle")
		100:
			Input.warp_mouse(cam.unproject_position(head))
		150:
			_shot("02_petting_head")
		160:
			hand.set_item(Hand.Item.TREAT)
		230:
			_shot("03_treat_lure_sit")
		240:
			hand.set_item(Hand.Item.EMPTY)
			husky.lift_start(head + Vector3(0, 0.3, 0))
		280:
			_shot("04_lifted")
		290:
			husky.lift_end()
			husky.brain.needs["sleepy"] = 1.0
			husky.brain.set_behavior(Brain.Behavior.SLEEP)
		720:
			_shot("05_sleeping")
		730:
			husky.set_puppy(false)
			husky.call_name()
			hud.toggle_debug()
		900:
			_shot("06_adult_called_debug")
			quit(0)
	if _frame >= 100 and _frame < 150:
		var t := float(_frame) * 0.25
		var p := head + Vector3(sin(t) * 0.05, 0.02, 0)
		Input.warp_mouse(cam.unproject_position(p))
		husky.pet("head", true, p, DT)
	elif _frame >= 160 and _frame < 230:
		Input.warp_mouse(cam.unproject_position(head + Vector3(0, 0.35, 0.05)))
	return false


func _shot(shot_name: String) -> void:
	var img := root.get_texture().get_image()
	var path := _out.path_join(shot_name + ".png")
	img.save_png(path)
	print("saved ", path)
