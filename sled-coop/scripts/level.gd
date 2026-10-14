extends Node2D
## 코스 1개. 중심선(CENTERLINE) 점들을 따라 양쪽에 눈벽을 세운다.
## 점 목록만 바꾸면 새로운 코스를 만들 수 있다. (y가 작을수록 화면 위쪽)

const TRACK_WIDTH := 300.0
const CENTERLINE := [
	Vector2(0, 250), Vector2(0, -500), Vector2(250, -900), Vector2(750, -1050),
	Vector2(1150, -850), Vector2(1450, -500), Vector2(1900, -450), Vector2(2250, -800),
	Vector2(2300, -1400), Vector2(2000, -1800), Vector2(1500, -1950),
]
## 나무: [구간 번호, 구간 안 위치(0~1), 중심선에서 옆으로 떨어진 거리]
const TREES := [
	[0, 0.55, 60.0], [1, 0.6, -70.0], [2, 0.45, 60.0], [3, 0.5, -40.0],
	[4, 0.3, 80.0], [5, 0.5, 0.0], [6, 0.4, -70.0], [7, 0.35, 50.0],
	[7, 0.75, -60.0], [8, 0.5, 0.0], [9, 0.3, 70.0],
]
## 빙판(마찰이 거의 없는 구역): [구간 번호, 구간 안 위치, 반지름]
const ICE := [[2, 0.55, 150.0], [6, 0.65, 170.0], [8, 0.2, 140.0]]
const TREE_RADIUS := 22.0
const GOAL_RADIUS := 120.0

var start_position: Vector2
var start_direction: Vector2
var goal_position: Vector2
var left_pts := PackedVector2Array()
var right_pts := PackedVector2Array()
var tree_pts: Array[Vector2] = []
var ice_spots: Array = []  # [Vector2 위치, float 반지름]
var speckles := PackedVector2Array()


func _init() -> void:
	_build_edges()
	start_direction = (CENTERLINE[1] - CENTERLINE[0]).normalized()
	start_position = _point_on(0, 0.1, 0.0)
	goal_position = _point_on(CENTERLINE.size() - 2, 0.75, 0.0)
	for t in TREES:
		tree_pts.append(_point_on(t[0], t[1], t[2]))
	for s in ICE:
		ice_spots.append([_point_on(s[0], s[1], 0.0), s[2]])
	_build_collision()
	_build_speckles()


func is_on_ice(pos: Vector2) -> bool:
	for s in ice_spots:
		if pos.distance_to(s[0]) < s[1]:
			return true
	return false


func is_at_goal(pos: Vector2) -> bool:
	return pos.distance_to(goal_position) < GOAL_RADIUS


func _point_on(seg: int, t: float, lateral: float) -> Vector2:
	var a: Vector2 = CENTERLINE[seg]
	var b: Vector2 = CENTERLINE[seg + 1]
	return a.lerp(b, t) + (b - a).normalized().orthogonal() * lateral


func _seg_normal(seg: int) -> Vector2:
	return (CENTERLINE[seg + 1] - CENTERLINE[seg]).normalized().orthogonal()


func _build_edges() -> void:
	var half := TRACK_WIDTH * 0.5
	var n := CENTERLINE.size()
	for i in n:
		var p: Vector2 = CENTERLINE[i]
		var offset: Vector2
		if i == 0:
			offset = _seg_normal(0) * half
		elif i == n - 1:
			offset = _seg_normal(n - 2) * half
		else:
			# 꺾이는 지점은 두 구간 법선의 평균 방향으로 벌려서 폭을 유지
			var n1 := _seg_normal(i - 1)
			var m := (n1 + _seg_normal(i)).normalized()
			offset = m * half / maxf(m.dot(n1), 0.5)
		left_pts.append(p + offset)
		right_pts.append(p - offset)


func _build_collision() -> void:
	var mat := PhysicsMaterial.new()
	mat.friction = 0.1
	mat.bounce = 0.35

	var walls := StaticBody2D.new()
	walls.collision_layer = 1
	walls.collision_mask = 0
	walls.physics_material_override = mat
	add_child(walls)
	var n := left_pts.size()
	for i in n - 1:
		_add_segment(walls, left_pts[i], left_pts[i + 1])
		_add_segment(walls, right_pts[i], right_pts[i + 1])
	_add_segment(walls, left_pts[0], right_pts[0])
	_add_segment(walls, left_pts[n - 1], right_pts[n - 1])

	var trees := StaticBody2D.new()
	trees.collision_layer = 1
	trees.collision_mask = 0
	trees.physics_material_override = mat
	add_child(trees)
	for p in tree_pts:
		var circle := CircleShape2D.new()
		circle.radius = TREE_RADIUS
		var shape := CollisionShape2D.new()
		shape.shape = circle
		shape.position = p
		trees.add_child(shape)


func _add_segment(body: StaticBody2D, a: Vector2, b: Vector2) -> void:
	var seg := SegmentShape2D.new()
	seg.a = a
	seg.b = b
	var shape := CollisionShape2D.new()
	shape.shape = seg
	body.add_child(shape)


## 바닥에 눈 자국을 뿌려서 속도감(미끄러지는 느낌)을 보이게 한다.
func _build_speckles() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var bounds := Rect2(CENTERLINE[0], Vector2.ZERO)
	for p in CENTERLINE:
		bounds = bounds.expand(p)
	bounds = bounds.grow(TRACK_WIDTH)
	for i in 1800:
		speckles.append(Vector2(
			rng.randf_range(bounds.position.x, bounds.end.x),
			rng.randf_range(bounds.position.y, bounds.end.y)))


func _draw() -> void:
	var track := Color(0.96, 0.98, 1.0)
	var half := TRACK_WIDTH * 0.5
	var n := left_pts.size()
	for i in n - 1:
		draw_colored_polygon(PackedVector2Array([left_pts[i], left_pts[i + 1], right_pts[i + 1], right_pts[i]]), track)
	# 꺾이는 지점의 바깥쪽 빈틈 메우기 (양 끝점은 벽으로 막혀 있으니 제외)
	for i in range(1, n - 1):
		draw_circle(CENTERLINE[i], half, track)

	for s in ice_spots:
		draw_circle(s[0], s[1], Color(0.62, 0.84, 0.98, 0.75))
		draw_arc(s[0], s[1], 0, TAU, 48, Color(0.45, 0.7, 0.92), 3.0)
		draw_string(ThemeDB.fallback_font, s[0] + Vector2(-30, 6), "ICE", HORIZONTAL_ALIGNMENT_CENTER, 60, 20, Color(0.3, 0.55, 0.8))

	for p in speckles:
		draw_circle(p, 2.0, Color(0.7, 0.76, 0.84, 0.6))

	# 출발선, 도착 지점
	draw_line(_point_on(0, 0.2, -half), _point_on(0, 0.2, half), Color(0.3, 0.6, 0.3), 6.0)
	draw_circle(goal_position, GOAL_RADIUS, Color(1, 0.85, 0.2, 0.35))
	draw_arc(goal_position, GOAL_RADIUS, 0, TAU, 48, Color(0.9, 0.6, 0.1), 5.0)
	draw_string(ThemeDB.fallback_font, goal_position + Vector2(-60, 10), "GOAL", HORIZONTAL_ALIGNMENT_CENTER, 120, 32, Color(0.75, 0.45, 0.05))

	# 눈벽
	var wall := Color(0.68, 0.76, 0.86)
	draw_polyline(left_pts, wall, 14.0)
	draw_polyline(right_pts, wall, 14.0)
	draw_line(left_pts[0], right_pts[0], wall, 14.0)
	draw_line(left_pts[n - 1], right_pts[n - 1], wall, 14.0)

	# 나무
	for p in tree_pts:
		draw_circle(p + Vector2(4, 6), TREE_RADIUS + 4, Color(0, 0, 0, 0.15))
		draw_circle(p, TREE_RADIUS + 4, Color(0.13, 0.42, 0.27))
		draw_circle(p + Vector2(-4, -4), TREE_RADIUS * 0.6, Color(0.2, 0.55, 0.35))
		draw_circle(p + Vector2(-6, -7), 5.0, Color(1, 1, 1, 0.85))
