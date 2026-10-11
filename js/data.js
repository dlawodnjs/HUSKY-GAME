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

// --- Stats ---
// 성장 스탯: 엔딩을 결정하는 6가지 능력치 (0~100)
const growthStats = ['strength', 'intelligence', 'obedience', 'wildness', 'charisma', 'affection'];
// 컨디션: 매일 관리해야 하는 게이지 (0~100)
const conditionStats = ['stamina', 'hunger', 'stress', 'fatigue', 'hygiene'];

const statNamesKR = {
    strength: "운동", intelligence: "지능", obedience: "복종",
    wildness: "야성", charisma: "매력", affection: "친밀도",
    stamina: "체력", hunger: "배고픔", stress: "스트레스", fatigue: "피로도", hygiene: "청결도",
    feedCount: "밥 준 횟수"
};

const statDescKR = {
    strength: "근력·민첩·지구력. 산책, 썰매, 장애물로 오릅니다.",
    intelligence: "머리와 코. 퍼즐, 노즈워크, 트러플 찾기로 오릅니다.",
    obedience: "말을 잘 듣는 정도. 훈련으로 오릅니다.",
    wildness: "야생의 본능과 용기. 야간 산책, 놀이로 오릅니다.",
    charisma: "외모와 사교성. 목욕, 카페, 모델 알바로 오릅니다.",
    affection: "주인과의 유대. 밥, 놀이, 산책으로 오릅니다.",
    stamina: "0이 되면 쓰러집니다.",
    hunger: "높으면 예민해지고 100이면 기절합니다.",
    stress: "90 이상이 3주 계속되면 가출합니다.",
    fatigue: "80 이상이면 병에 걸립니다.",
    hygiene: "모델 알바와 슈퍼모델 엔딩에 필요합니다."
};

function createInitialState() {
    return {
        gold: 300,
        // 컨디션
        stamina: 50, hunger: 0, stress: 0, fatigue: 0, hygiene: 50,
        // 성장 스탯
        strength: 15, intelligence: 10, obedience: 10, wildness: 30, charisma: 10, affection: 20,
        feedCount: 0,
        currentWeek: 1,
        currentDayIndex: 0,
        maxWeeks: 48,
        isAdult: false,
        tournamentWins: 0,
        gameOverReason: "",
        gameOverType: "",
        consecutiveHighStressWeeks: 0,
        furniture: []
    };
}

let state = createInitialState();

// --- Endings ---
// conditions: { stat, min } 또는 { stat, max }. 여러 엔딩 조건을 동시에 만족하면
// 조건을 가장 여유 있게 넘긴 엔딩이 선택됩니다 (pickEnding 참고).
const endings = [
    { id: 'wolf', icon: '🐺', title: "야생의 늑대",
      desc: "야성이 극에 달해 주인의 말을 듣지 않고 자연으로 돌아갔습니다...",
      image: "assets/ending_wolf_1782580570989.jpg",
      conditions: [{ stat: 'wildness', min: 80 }, { stat: 'obedience', max: 30 }] },
    { id: 'truffle', icon: '🍄', title: "전설의 트러플 탐지견",
      desc: "뛰어난 머리와 야생의 코로 세계 최고의 트러플 탐지견이 되어 억만장자가 되었습니다!",
      conditions: [{ stat: 'intelligence', min: 70 }, { stat: 'wildness', min: 60 }] },
    { id: 'police', icon: '🚓', title: "천재 특수 경찰견",
      desc: "높은 지능과 복종심을 바탕으로 가장 존경받는 경찰견이 되었습니다.",
      conditions: [{ stat: 'intelligence', min: 70 }, { stat: 'obedience', min: 70 }] },
    { id: 'model', icon: '📸', title: "슈퍼모델 펫",
      desc: "매력과 청결함이 빛을 발해 전 세계 잡지 표지를 장식하는 모델이 되었습니다.",
      image: "assets/ending_model_1782580561321.jpg",
      conditions: [{ stat: 'charisma', min: 80 }, { stat: 'hygiene', min: 70 }] },
    { id: 'guard', icon: '🛡️', title: "명품 경비견",
      desc: "주인을 지키려는 본능이 강해져 아주 훌륭한 경비견으로 성장했습니다.",
      image: "assets/husky_adult.jpg",
      conditions: [{ stat: 'obedience', min: 70 }, { stat: 'strength', min: 70 }] },
    { id: 'sled', icon: '🛷', title: "썰매견 챔피언",
      desc: "강인한 체력과 야생의 투지로 썰매견 대회에서 우승을 차지했습니다!",
      image: "assets/ending_sled_1782580550640.jpg",
      conditions: [{ stat: 'strength', min: 80 }, { stat: 'wildness', min: 50 }] },
    { id: 'star', icon: '🌟', title: "우주 대스타 인싸견",
      desc: "동네의 모든 강아지와 사람들에게 사랑받는 최고의 인싸 허스키가 되었습니다.",
      conditions: [{ stat: 'charisma', min: 70 }, { stat: 'affection', min: 80 }] },
    { id: 'glutton', icon: '🍖', title: "뚱뚱보 먹보",
      desc: "세상의 모든 간식을 탐하는 뚱뚱한 허스키가 되었습니다. 그래도 귀엽습니다.",
      conditions: [{ stat: 'feedCount', min: 110 }, { stat: 'strength', max: 40 }] },
    { id: 'normal', icon: '🏠', title: "평범하고 행복한 반려견",
      desc: "특별한 특징 없이 무난하게 성장한 평범한 허스키입니다. 행복한 일상을 보냅니다.",
      image: "assets/ending_normal_1782580596536.jpg",
      hint: "48주를 무사히 보내고 다른 엔딩 조건을 만족하지 않으면 도달합니다.",
      conditions: [] },
    { id: 'collapse', icon: '🏥', title: "배드 엔딩: 입원", bad: true,
      desc: "체력이 바닥나서 쓰러졌습니다. 병원에 입원하게 되었습니다...",
      image: "assets/ending_destroyer_1782580583119.jpg",
      hint: "체력이 0이 되면 도달합니다." },
    { id: 'runaway', icon: '🧳', title: "배드 엔딩: 가출", bad: true,
      desc: "지속적인 스트레스로 인해 허스키가 가출해버렸습니다...",
      image: "assets/ending_destroyer_1782580583119.jpg",
      hint: "스트레스 90 이상이 3주 연속 이어지면 도달합니다." }
];

const CODEX_STORAGE_KEY = 'huskyMaker.codex';

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
