// --- js/data.js ---
// Global state and constants

const ActionType = {
    FEED: 0, WALK: 1, TRAIN: 2, PLAY: 3, REST: 4,
    ADVANCED_TRAIN: 5, OBSTACLE_COURSE: 6, SLED_PULLING: 7,
    WORK_GUARD: 8, WORK_MODEL: 9,
    BATH: 10, PUZZLE: 11, CAFE: 12, NIGHT_WALK: 13, TRUFFLE: 14, GUARD_TRAINING: 15,
    NOSEWORK: 16
};

const actionNamesKR = {
    [ActionType.FEED]: "밥 주기",
    [ActionType.WALK]: "산책 가기",
    [ActionType.TRAIN]: "훈련 하기",
    [ActionType.PLAY]: "놀아 주기",
    [ActionType.REST]: "휴식 하기",
    [ActionType.ADVANCED_TRAIN]: "고급 훈련",
    [ActionType.OBSTACLE_COURSE]: "장애물 달리기",
    [ActionType.SLED_PULLING]: "썰매 끌기",
    [ActionType.WORK_GUARD]: "집지키기 알바",
    [ActionType.WORK_MODEL]: "모델 알바",
    [ActionType.BATH]: "목욕 시키기",
    [ActionType.PUZZLE]: "실타래 퍼즐 풀기",
    [ActionType.CAFE]: "애견 카페 방문",
    [ActionType.NIGHT_WALK]: "야간 산책",
    [ActionType.TRUFFLE]: "트러플 찾기 알바",
    [ActionType.GUARD_TRAINING]: "특수 구조 훈련",
    [ActionType.NOSEWORK]: "노즈워크 놀이"
};

const days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

// Initial global state
let state = {
    gold: 300, // Reduced initial gold for harder difficulty
    hunger: 0,
    stamina: 50,
    stress: 0,
    obedience: 10,
    wildness: 30,
    affection: 20,
    strength: 10,
    gluttony: 20,
    charisma: 10,
    agility: 15,
    intelligence: 10,
    sociality: 10,
    courage: 10,
    scent: 10,
    hygiene: 50,
    fatigue: 0,
    currentWeek: 1,
    currentDayIndex: 0,
    maxWeeks: 48,
    isAdult: false,
    tournamentWins: 0,
    gameOverReason: "",
    consecutiveHighStressWeeks: 0,
    furniture: []
};

const statNamesKR = {
    obedience: "복종", wildness: "야성", affection: "친밀도", strength: "근력", gluttony: "식탐",
    charisma: "매력", agility: "민첩성", intelligence: "지능", sociality: "사회성",
    courage: "용기", scent: "후각", hygiene: "청결도"
};

// Husky animation and positioning state
const huskyState = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    direction: 1, // 1 for right, -1 for left
    dirString: 'right', // 8-way direction
    animation: 'idle', // idle, walkHorizontal, walkDiagonal, interact, dragged, tired
    expression: 'neutral',
    isDragging: false,
    isPaused: false,
    pauseTimer: 0,
    interactionTimer: 0,
    frameIndex: 0,
    frameTimer: 0
};

// Husky animation frame definitions
const frames = {
    idle: {
        bodyParts: ['body-dark', 'body-light'],
        legs: ['leg-frame-0', 'leg-frame-2']
    },
    walk1: {
        bodyParts: ['body-dark', 'body-light'],
        legs: ['leg-frame-1']
    },
    walk2: {
        bodyParts: ['body-dark', 'body-light'],
        legs: ['leg-frame-3']
    },
    dragged: {
        bodyParts: ['body-dark', 'body-light'],
        legs: ['leg-frame-dragged']
    },
    happy: {
        bodyParts: ['body-dark', 'body-light'],
        legs: ['leg-frame-0', 'leg-frame-2']
    },
    curious: {
        bodyParts: ['body-dark', 'body-light'],
        legs: ['leg-frame-0', 'leg-frame-2']
    },
    tired: {
        bodyParts: ['body-dark', 'body-light'],
        legs: ['leg-frame-0', 'leg-frame-2']
    }
};

// Minigame states
let minigameTimer = null;
let minigameTimeLeft = 5.0;
let minigameScore = 0;
let minigameType = 0;

// Drag variables
let dragStartX = 0;
let dragStartY = 0;
let charStartX = 0;
let charStartY = 0;

// Husky Dialogs
const huskyDialogs = {
    tired: ["너무 피곤해요...", "조금 쉬고 싶어요.", "하품이 자꾸 나와요.", "눈이 감겨요..."],
    stressed: ["스트레스 받아요!", "건드리지 마세요!", "아우우우! 기분 안 좋아요!", "혼자 있고 싶어요."],
    hungry: ["배가 고파요! 밥 주세요!", "꼬르륵...", "먹을 거 없나요?", "밥그릇이 비었어요."],
    happy: ["주인님 최고!", "기분 좋아요!", "멍멍! 신나요!", "꼬리 붕붕~"],
    neutral: ["오늘도 좋은 하루!", "뭐 재밌는 일 없나요?", "멍멍!", "산책가고 싶어요.", "여기는 아늑하네요."]
};
