extends RefCounted
## 손맛 튜닝 값 모음. 단위: 미터, 킬로그램, 초, 뉴턴.
## 플레이테스트하면서 여기 숫자만 바꾸면 된다.

# ---------- 허스키 ----------
const HUSKY_MASS := 20.0
const WALK_SPEED := 4.0            # 걷기 목표 속도 (m/s)
const SPRINT_SPEED := 7.0          # 달리기 목표 속도
const WALK_FORCE := 520.0          # 걸을 때 낼 수 있는 최대 힘 (N)
const SPRINT_FORCE := 820.0        # 달릴 때 낼 수 있는 최대 힘
const IDLE_GRIP_FORCE := 260.0     # 가만히 있을 때 버티는 힘. 이보다 세게 끌리면 질질 끌려감
const ACCEL_GAIN := 8.0            # 목표 속도로 얼마나 빨리 맞추는지
const AIR_CONTROL := 0.25          # 공중(매달림 포함)에서 낼 수 있는 힘 비율
const HANG_CLIMB_FORCE := 90.0     # 매달린 상태에서 이동 키로 버둥거릴 때 위로 주는 힘 (혼자서는 못 올라옴)
const JUMP_VELOCITY := 5.2
const TURN_SPEED := 10.0           # 몸이 이동 방향으로 도는 속도

const STAMINA_MAX := 100.0
const STAMINA_DRAIN := 28.0        # 달리는 동안 초당 소모 (약 3.5초 달리기)
const STAMINA_REGEN := 20.0        # 달리지 않을 때 초당 회복
const STAMINA_MIN_TO_START := 15.0 # 바닥난 뒤 이만큼 회복해야 다시 달릴 수 있음

const KNOCKDOWN_TIME := 1.5        # 넘어져 있는 시간
const KNOCKDOWN_SPEED_SLED := 3.5  # 썰매와 이 속도(m/s) 이상으로 부딪히면 넘어짐
const KNOCKDOWN_SPEED_HUSKY := 6.0 # 허스키끼리 이 속도 이상으로 부딪히면 넘어짐

# ---------- 썰매 ----------
const SLED_MASS := 70.0
const SLED_FORWARD_FRICTION := 0.04   # 앞뒤 마찰 계수 (낮을수록 미끄러움 = 관성 큼)
const SLED_SIDE_FRICTION := 0.35      # 옆 마찰 계수 (낮을수록 드리프트)
const ICE_FRICTION_SCALE := 0.15      # 빙판 위 마찰 배율

# ---------- 줄 (늘어나지 않는 줄을 아주 단단한 스프링으로 흉내) ----------
const ROPE_WHEEL_LENGTH := 2.2     # 휠견 줄 길이
const ROPE_LEADER_LENGTH := 4.2    # 리더견 줄 길이
const ROPE_STIFFNESS := 3000.0     # 줄 탄성 (클수록 단단함. 너무 크면 팽팽해지는 순간 충격이 커서 화물이 튐)
const ROPE_DAMPING := 250.0         # 줄 흔들림 억제
const ROPE_MAX_FORCE := 6000.0     # 한 번에 걸리는 최대 힘 (물리 폭주 방지)
const ROPE_TENSION_RED := 700.0    # 이 장력(N)에서 줄이 완전히 빨개짐
const ROPE_TENSION_SMOOTH := 6.0   # 색 변화 부드러움 (클수록 빠르게 따라감)

# ---------- 화물 ----------
const CARGO_COUNT := 6
const CARGO_MASS := 4.0
const CARGO_FRICTION := 0.8
const CARGO_SIZE := Vector3(0.42, 0.34, 0.42)

# ---------- 기타 ----------
const VOID_Y := -40.0              # 이 아래로 떨어진 물체는 공허로 간주
const PLAYER_COLORS := [Color("e53935"), Color("1e88e5"), Color("fdd835"), Color("43a047")]
