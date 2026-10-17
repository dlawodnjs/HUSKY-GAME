extends SceneTree
# 기초 물리 시나리오 테스트 (물리 테스트 맵). 사용법은 tests/README.md
# 물리 시나리오 테스트. --fixed-fps 120 으로 실행 (1프레임 = 1물리스텝)
var main
var t := 0.0
var idx := -1
var scen := []
var cur := {}
var start_pos := {}

func _initialize():
	main = load("res://scenes/main.tscn").instantiate()
	main.name = "Main"
	main.level_index = 0
	root.add_child(main)
	scen = [
		{"name": "glide_no_brake", "dur": 6.0, "setup": "brake", "brake": false},
		{"name": "glide_wheels_back", "dur": 6.0, "setup": "brake", "brake": true},
	] if OS.get_cmdline_user_args().has("brake") else [
		{"name": "all4_forward", "dur": 4.0, "moves": [F(), F(), F(), F()]},
		{"name": "3fwd_1idle(P1)", "dur": 4.0, "moves": [Z(), F(), F(), F()]},
		{"name": "3fwd_1back(P4)", "dur": 4.0, "moves": [F(), F(), F(), B()]},
		{"name": "all4_sprint", "dur": 3.0, "moves": [F(), F(), F(), F()], "sprint": true},
		{"name": "hang_then_rescue", "dur": 9.0, "setup": "cliff"},
		{"name": "knockdown", "dur": 1.5, "setup": "knock"},
		{"name": "slope_slide", "dur": 4.0, "setup": "slope"},
		{"name": "ice_glide", "dur": 5.0, "setup": "ice"},
		{"name": "glide_no_brake", "dur": 6.0, "setup": "brake", "brake": false},
		{"name": "glide_wheels_back", "dur": 6.0, "setup": "brake", "brake": true},
	]
	trim()

func trim():
	if OS.get_cmdline_user_args().has("first"): scen = [scen[0]]

func F(): return Vector3(0,0,-1)
func B(): return Vector3(0,0,1)
func Z(): return Vector3.ZERO

func place_team(origin: Vector3):
	var s = main.sled
	var off = origin - s.global_position
	s.global_position += off
	for h in main.huskies: h.global_position += off
	for c in main.cargos: c.global_position += off

func begin(i):
	idx = i; t = 0.0; cur = scen[i]
	main.start_stage()
	await process_frame
	match cur.get("setup", ""):
		"cliff": place_team(Vector3(-15.5, 0.05, -5))
		"knock": main.sled.linear_velocity = Vector3(0,0,-9)  # 썰매를 앞쪽 허스키에게 돌진
		"slope": place_team(Vector3(0, 0.1, -61.5))
		"ice": place_team(Vector3(0, 0.1, -44))
	start_pos = {"sled": main.sled.global_position, "h0": main.huskies[0].global_position}

func report():
	var s = main.sled
	var d = s.global_position - start_pos.sled
	var line = "%-18s sled moved (%.1f, %.1f, %.1f) speed %.2f  cargo %d/6" % [cur.name, d.x, d.y, d.z, s.linear_velocity.length(), main.cargo_left()]
	if cur.has("z_at_release"):
		line += "  glide after release %.1f m" % (cur.z_at_release - s.global_position.z)
	if cur.name.begins_with("3fwd_1idle"):
		line += "  idleP1 moved z %.1f" % (main.huskies[0].global_position.z - start_pos.h0.z)
	print(line)

func _process(delta):
	if idx == -1:
		main.set_physics_process(false)
		begin(0)
		return false
	t += delta
	var c = cur
	var hs = main.huskies
	match c.get("setup", ""):
		"cliff":
			# 0~2초: P2(좌 리더견)가 왼쪽 절벽으로 뛰어내림 / 나머지 가만히
			# 3초~: 나머지 3마리가 오른쪽으로 달려서 끌어올리기
			for i in 4:
				var mv = Vector3.ZERO
				var spr = false
				if i == 1 and t < 3.0: mv = Vector3(-1,0,0)
				elif i != 1 and t > 3.5 and t < 7.0: mv = Vector3(1,0,0); spr = true
				hs[i].set_input(mv, spr, false)
			if abs(t - 3.4) < 0.005:
				print("   [hang] t=3.4 P2 y=%.2f hanging=%s rope=%.0fN sled x=%.2f" % [hs[1].global_position.y, hs[1].hanging, main.ropes[1].tension, main.sled.global_position.x])
			if abs(t - 8.9) < 0.005:
				print("   [rescue] t=8.9 P2 y=%.2f x=%.2f grounded=%s" % [hs[1].global_position.y, hs[1].global_position.x, hs[1].grounded])
		"knock":
			for h in hs: h.set_input(Vector3.ZERO, false, false)
		"brake":
			# 3초 걸어서 끈 뒤: 모두 멈춤 / 휠견 2마리(P1, P3)만 뒤로 버팀
			if t < 3.0:
				for h in hs: h.set_input(F(), false, false)
			else:
				if abs(t - 3.0) < 0.005: cur["z_at_release"] = main.sled.global_position.z; print("   release speed %.2f" % main.sled.linear_velocity.length())
				for i in 4:
					var back = c.brake and i % 2 == 0
					hs[i].set_input(B() if back else Vector3.ZERO, false, false)
		"slope", "ice":
			for h in hs: h.set_input(F() if (c.setup == "ice" and t < 1.5) else Vector3.ZERO, c.setup == "ice", false)
		_:
			for i in 4: hs[i].set_input(c.moves[i], c.get("sprint", false), false)
	if t >= c.dur:
		report()
		if c.get("setup","") == "knock":
			print("   knocked: ", hs.map(func(h): return h.knocked))
		if idx + 1 < scen.size():
			begin(idx + 1)
		else:
			return true
	return false
