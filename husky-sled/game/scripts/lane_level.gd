extends "res://scripts/level_base.gd"
## 1-4 세 갈래 길 (그레이박스).
##
##   시작 평원 → [ 왼쪽 길 | 가운데 길(썰매 전용) | 오른쪽 길 ] → 합류 → 다리 → 도착 평원
##
## - 가운데 길은 폭 2.2m의 평평한 길이고 "썰매 전용"이다. 입구와 칸막이 위에 반투명 막이 있어서
##   썰매와 화물은 지나가지만 허스키는 못 들어간다. (막이 없으면 네 마리가 가운데로 걸어가서 쉽게 클리어됨)
##   칸막이 자체는 낮은 벽이라서 썰매는 옆 길로 나가지 못한다.
## - 허스키 길은 구멍(공허)이 뚫려 있다. 왼쪽 구멍은 달리기 점프, 오른쪽 구멍은 더 넓어서 점프대가 있다.
##   빠지면 줄에 매달리고, 같은 팀이 끌어올려야 한다.
## - 왼쪽 길은 좌 휠견/좌 리더견, 오른쪽 길은 우 휠견/우 리더견이 줄을 잡고 있으므로
##   양쪽 팀이 속도와 박자를 맞추지 않으면 썰매가 칸막이에 부딪혀서 화물이 떨어진다.
## - 가운데 길 중간에 빙판이 있어서 썰매가 잘 안 멈춘다.

const LANE_START := -14.0
const LANE_END := -64.0
const DIVIDER_END := -60.0          # 이 지점부터 칸막이가 없어져서 양쪽 길의 허스키가 가운데로 합류한다
const CENTER_HALF := 1.1            # 가운데 길 폭의 절반
const SIDE_INNER := 1.3             # 옆 길 안쪽 가장자리 (칸막이 두께 0.2 포함)
const SIDE_OUTER := 3.5             # 옆 길 바깥 가장자리
const LEFT_GAP := Vector2(-31.8, -36.0)    # (구멍 시작 z, 끝 z) 4.2m: 달리면서 점프하면 건넘
const RIGHT_GAP := Vector2(-45.8, -50.8)   # 5.0m: 달리면서 점프대에서 점프 (썰매를 끌고 달리면 팀 속도가 약 5m/s라서 이보다 넓으면 못 건넘)
const BRIDGE_END := -78.0
const PLAZA_END := -106.0
const WALL_HEIGHT := 0.9            # 썰매는 못 넘는 높이
const CURTAIN_HEIGHT := 3.0
const WALL_DEPTH := 4.0             # 칸막이가 땅 아래로 내려가는 깊이
const SHELF_WIDTH := 0.6            # 선반 폭(z 방향). 0이면 선반 없음
const SHELF_DEPTH := -0.9           # 선반 윗면 높이 (허스키 점프 높이 약 1.4m보다 낮아서 올라올 수 있음)
const RAMP_ANGLE := 12.0
const RAMP_LENGTH := 2.6


func _init() -> void:
	super()   # 공통 재질(마찰 0 등)을 만든다. 꼭 있어야 함
	level_name = "1-4 Three Lanes"
	start_transform = Transform3D(Basis.IDENTITY, Vector3(0, 0.05, 6))
	goal_pos = Vector3(0, 0, -92)
	goal_radius = 4.0

	var sand := _mat(Color(0.96, 0.78, 0.5), 0.95)      # 썰매 길은 따뜻한 색으로 구분
	var wall_mat := _mat(Color(0.55, 0.62, 0.74), 1.0)
	var lane_len := LANE_START - LANE_END

	# 시작 평원 (z 12 ~ -14)
	_ground(Vector3(26, 4, 26), Vector3(0, -2, -1))

	# 가운데 길
	_ground(Vector3(CENTER_HALF * 2.0, 4, lane_len), Vector3(0, -2, (LANE_START + LANE_END) * 0.5), sand)
	_ice_patch(Vector2(CENTER_HALF * 2.0, 8), Vector3(0, 0, -24))

	# 옆 길: 구멍을 사이에 두고 땅을 둘로 나눈다
	var lane_x := (SIDE_INNER + SIDE_OUTER) * 0.5
	var lane_w := SIDE_OUTER - SIDE_INNER
	for side in [-1.0, 1.0]:
		var gap: Vector2 = LEFT_GAP if side < 0.0 else RIGHT_GAP
		for seg in [Vector2(LANE_START, gap.x), Vector2(gap.y, LANE_END)]:
			var seg_len: float = seg.x - seg.y
			var zc: float = (seg.x + seg.y) * 0.5
			_ground(Vector3(lane_w, 4, seg_len), Vector3(side * lane_x, -2, zc))
			# 바깥쪽 턱 (구멍 쪽 끝은 열어둠)
			_wall(Vector3(0.2, WALL_HEIGHT, seg_len), Vector3(side * (SIDE_OUTER + 0.1), WALL_HEIGHT * 0.5, zc), wall_mat)

		# 구멍 건너편 아래의 낮은 선반: 아슬아슬하게 못 건넌 허스키가 벽에 끼지 않고 점프로 올라올 수 있다.
		# (크게 빗나가면 선반 밖 공허로 떨어져서 줄에 매달림)
		if SHELF_WIDTH > 0.0:
			_ground(Vector3(lane_w, 4, SHELF_WIDTH), Vector3(side * lane_x, SHELF_DEPTH - 2.0, gap.y + SHELF_WIDTH * 0.5))

		# 가운데 길과 옆 길 사이 칸막이 (합류 지점 전까지)
		# 구멍 위에 떠 있으면 매달린 허스키가 밑으로 파고들어 끼므로, 아래까지 이어지는 수직 벽으로 만든다.
		var div_len := LANE_START - DIVIDER_END
		_wall(Vector3(0.2, WALL_HEIGHT + WALL_DEPTH, div_len), Vector3(side * (CENTER_HALF + 0.1), (WALL_HEIGHT - WALL_DEPTH) * 0.5, (LANE_START + DIVIDER_END) * 0.5), wall_mat)

	# 썰매 전용 막: 입구와 칸막이 위 (합류 지점부터는 없음)
	var curtain_len := LANE_START - DIVIDER_END
	_dog_curtain(Vector3(CENTER_HALF * 2.0 + 0.4, CURTAIN_HEIGHT, 0.2), Vector3(0, CURTAIN_HEIGHT * 0.5, LANE_START - 0.1))
	for side in [-1.0, 1.0]:
		_dog_curtain(Vector3(0.2, CURTAIN_HEIGHT + WALL_DEPTH, curtain_len), Vector3(side * (CENTER_HALF + 0.1), (CURTAIN_HEIGHT - WALL_DEPTH) * 0.5, (LANE_START + DIVIDER_END) * 0.5))

	# 오른쪽 구멍 앞 점프대
	_ramp_up(lane_x, lane_w - 0.2, RIGHT_GAP.x + RAMP_LENGTH * cos(deg_to_rad(RAMP_ANGLE)), RAMP_LENGTH, deg_to_rad(RAMP_ANGLE), _mat(Color(0.82, 0.62, 0.42), 0.8))

	# 다리 (옆 길이 끝난 뒤 가운데만 이어짐, 낮은 난간)
	var bridge_len := LANE_END - BRIDGE_END
	_ground(Vector3(2.6, 4, bridge_len), Vector3(0, -2, (LANE_END + BRIDGE_END) * 0.5), sand)
	for side in [-1.0, 1.0]:
		_wall(Vector3(0.15, 0.6, bridge_len), Vector3(side * 1.375, 0.3, (LANE_END + BRIDGE_END) * 0.5), wall_mat)

	# 도착 평원
	_ground(Vector3(24, 4, BRIDGE_END - PLAZA_END), Vector3(0, -2, (BRIDGE_END + PLAZA_END) * 0.5))

	for p in [Vector3(-9, 0, 6), Vector3(8, 0, 2), Vector3(-7, 0, -8), Vector3(10, 0, -9), Vector3(-11, 0, -2),
			Vector3(-8, 0, -84), Vector3(9, 0, -86), Vector3(-9, 0, -98), Vector3(8, 0, -100), Vector3(0, 0, -103)]:
		_tree(p)

	_goal_marker()
