extends "res://scripts/level_base.gd"
## 물리 테스트용 맵 (그레이박스).
##   시작 평원(나무, 점프대) → 좁은 절벽길(양옆이 공허) → 빙판 → 내리막 → 아래 평원의 도착 지점


func _init() -> void:
	super()   # 공통 재질(마찰 0 등)을 만든다. 꼭 있어야 함
	level_name = "Physics Test"
	start_transform = Transform3D(Basis.IDENTITY, Vector3(0, 0.05, 4))
	goal_pos = Vector3(0, -4, -116)
	goal_radius = 4.0

	# 시작 평원 (z 10 ~ -30, 폭 40)
	_ground(Vector3(40, 4, 40), Vector3(0, -2, -10))
	# 좁은 절벽길 (z -30 ~ -45, 폭 8)
	_ground(Vector3(8, 4, 15), Vector3(0, -2, -37.5))
	# 넓은 평원 + 빙판 (z -45 ~ -60)
	_ground(Vector3(30, 4, 15), Vector3(0, -2, -52.5))
	_ice_patch(Vector2(14, 10), Vector3(0, 0, -52))
	# 내리막 (z -60 ~ -80, 4m 내려감)
	var angle := atan2(4.0, 20.0)
	var slope := StaticBody3D.new()
	var normal := Vector3(0, cos(angle), -sin(angle))
	slope.position = Vector3(0, -2, -70) - normal * 0.5
	slope.rotation.x = -angle
	_add_box(slope, Vector3(20, 1, 20.4 + 0.6), _snow)
	add_child(slope)
	# 아래 평원 (z -80 ~ -125)
	_ground(Vector3(30, 4, 45), Vector3(0, -6, -102.5))

	# 나무
	for p in [Vector3(-6, 0, -8), Vector3(5, 0, -12), Vector3(-2, 0, -20), Vector3(9, 0, -24),
			Vector3(-12, 0, -16), Vector3(-6, -4, -95), Vector3(7, -4, -100)]:
		_tree(p)
	# 점프대 (시작 평원 오른쪽)
	var ramp := StaticBody3D.new()
	ramp.position = Vector3(12, 0.45, -6)
	ramp.rotation.x = deg_to_rad(18)
	_add_box(ramp, Vector3(4, 0.3, 4), _mat(Color(0.75, 0.6, 0.45), 0.8))
	add_child(ramp)

	_goal_marker()
