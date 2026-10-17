extends SceneTree
# 세 갈래 길(1-4) 시나리오 테스트. 사용법은 tests/README.md
# 모드: idle | naive | script | walk | split
var main
var mode := ""
var t := 0.0
var frames := 0
var last_print := -10.0
var result := ""
var stuck_t := 0.0
var prints := 0

func _initialize():
	mode = OS.get_cmdline_user_args()[0]
	main = load("res://scenes/main.tscn").instantiate(); main.name = "Main"; root.add_child(main)

func lane_x(i): return -2.4 if i < 2 else 2.4

func ctrl(i, h):
	var z = h.global_position.z
	var x = h.global_position.x
	var left = i < 2
	var tx = lane_x(i)
	if z < -58.0: tx = -0.6 if left else 0.6
	var sx = clampf((tx - x) * 2.0, -1.0, 1.0)
	var sprint = false
	var jump = false
	# 모두 같이 달리는 구간 (구멍 앞 몇 미터)
	if (z < -26.0 and z > -37.5) or (z < -40.5 and z > -53.0):
		sprint = true
	# 자기 쪽 구멍 앞에서 점프
	var gap = Vector2(-31.8, -36.0) if left else Vector2(-45.8, -51.8)
	if z <= gap.x + 0.7 and z > gap.x - 0.4 and h.grounded:
		jump = true
	if mode == "walk": sprint = false
	if mode == "split" and not left: sprint = false
	# 선반에 떨어졌으면 점프해서 올라온다
	if y_low(h) and h.grounded:
		jump = true
	return [Vector3(sx, 0, -1), sprint, jump]

func y_low(h): return h.global_position.y < -0.5 and h.global_position.y > -1.3

func _process(delta):
	frames += 1
	t += delta
	var m = main
	if frames == 2:
		m.set_physics_process(false)
	if frames < 3: return false
	var hs = m.huskies
	for i in 4:
		match mode:
			"idle": hs[i].set_input(Vector3.ZERO, false, false)
			"naive": hs[i].set_input(Vector3(0, 0, -1), false, false)
			"script", "walk", "split":
				var c = ctrl(i, hs[i])
				hs[i].set_input(c[0], c[1], c[2])
	# 상태 판정 (main의 _physics_process를 껐으므로 여기서 직접)
	if m.cargo_left() == 0:
		result = "FAIL: all cargo lost"
	elif m.sled.global_position.y < -40.0:
		result = "FAIL: sled fell into void"
	elif m.level.is_at_goal(m.sled.global_position):
		result = "DELIVERED cargo %d/6" % m.cargo_left()
	if t - last_print >= (0.5 if (m.sled.global_position.z < -24.0 and m.sled.global_position.z > -60.0) else 3.0):
		last_print = t
		var s = "t=%5.1f sled z=%6.1f x=%5.2f y=%5.2f v=%.1f cargo=%d |" % [t, m.sled.global_position.z, m.sled.global_position.x, m.sled.global_position.y, m.sled.linear_velocity.length(), m.cargo_left()]
		for i in 4:
			var h = hs[i]
			s += " P%d(%5.1f,%5.1f,%5.1f)%s%s" % [i+1, h.global_position.x, h.global_position.y, h.global_position.z, "H" if h.hanging else "", "K" if h.knocked else ""]
		prints += 1
		if prints <= 70: print(s)
	stuck_t = stuck_t + delta if (m.sled.linear_velocity.length() < 0.1 and t > 5.0) else 0.0
	if stuck_t > 8.0 and result == "": result = "STUCK at z=%.1f" % m.sled.global_position.z
	var limit = 3.0 if mode == "idle" else (30.0 if mode == "naive" else 90.0)
	if result != "" and mode != "idle" and mode != "naive":
		for hh in hs:
			if hh.global_position.y < -0.3:
				print("LOW ", hh.name, " seat ", hh.seat, " pos ", hh.global_position, " vel ", hh.linear_velocity, " grounded ", hh.grounded, " hanging ", hh.hanging, " taut ", hh.rope_taut, " pulldir ", hh.rope_pull_dir)
				for b in hh.get_colliding_bodies():
					var shp = b.get_child(0)
					print("   contact pos ", b.global_position, " layer ", b.collision_layer, " size ", (shp.shape.size if shp is CollisionShape3D and shp.shape is BoxShape3D else "?"))
	if result != "" or t > limit:
		print("RESULT [%s]: %s  (t=%.1f s, sled z=%.1f)" % [mode, result if result != "" else "timeout", t, m.sled.global_position.z])
		return true
	return false
