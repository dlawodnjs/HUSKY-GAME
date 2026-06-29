// --- js/ui.js ---

// DOM Elements
const screens = {
    title: document.getElementById('title-screen'),
    main: document.getElementById('main-screen'),
    ending: document.getElementById('ending-screen')
};

const ui = {
    timeDisplay: document.getElementById('time-display'),
    gold: document.getElementById('stat-gold'),
    hunger: document.getElementById('stat-hunger'),
    stamina: document.getElementById('stat-stamina'),
    stress: document.getElementById('stat-stress'),
    fatigue: document.getElementById('stat-fatigue'),
    obedience: document.getElementById('stat-obedience'),
    wildness: document.getElementById('stat-wildness'),
    affection: document.getElementById('stat-affection'),
    strength: document.getElementById('stat-strength'),
    gluttony: document.getElementById('stat-gluttony'),
    charisma: document.getElementById('stat-charisma'),
    agility: document.getElementById('stat-agility'),
    hygiene: document.getElementById('stat-hygiene'),
    intelligence: document.getElementById('stat-intelligence'),
    sociality: document.getElementById('stat-sociality'),
    courage: document.getElementById('stat-courage'),
    scent: document.getElementById('stat-scent'),
    huskyNameDisplay: document.getElementById('husky-name-display'),
    huskyStageDisplay: document.getElementById('husky-stage-display'),
    
    scheduleSelects: document.querySelectorAll('.schedule-select'),
    btnExecute: document.getElementById('btn-execute'),
    btnShop: document.getElementById('btn-shop'),
    btnCloseShop: document.getElementById('btn-close-shop'),
    
    shopModal: document.getElementById('shop-modal'),
    minigameEntranceModal: document.getElementById('minigame-entrance-modal'),
    btnEnterMinigame: document.getElementById('btn-enter-minigame'),
    btnSkipMinigame: document.getElementById('btn-skip-minigame'),
    minigameModal: document.getElementById('minigame-modal'),
    
    minigameTitle: document.getElementById('minigame-title'),
    minigameDesc: document.getElementById('minigame-desc'),
    minigameTimer: document.getElementById('minigame-timer'),
    minigameScore: document.getElementById('minigame-score'),
    btnMinigameClick: document.getElementById('btn-minigame-click'),
    
    endingTitle: document.getElementById('ending-title'),
    endingDesc: document.getElementById('ending-desc'),
    endingImage: document.getElementById('ending-image'),
    
    huskyField: document.getElementById('husky-field'),
    huskyChar: document.getElementById('husky-character'),
    speechBubble: document.getElementById('speech-bubble'),
    inlineEventPanel: document.getElementById('inline-event-panel'),
    inlineEventText: document.getElementById('inline-event-text')
};

// UI Functions
function updateStatsUI() {
    ui.gold.innerText = Math.floor(state.gold);
    ui.hunger.innerText = Math.floor(state.hunger);
    ui.stamina.innerText = Math.floor(state.stamina);
    ui.stress.innerText = Math.floor(state.stress);
    ui.fatigue.innerText = Math.floor(state.fatigue);
    
    ui.obedience.innerText = Math.floor(state.obedience);
    ui.wildness.innerText = Math.floor(state.wildness);
    ui.affection.innerText = Math.floor(state.affection);
    ui.strength.innerText = Math.floor(state.strength);
    ui.gluttony.innerText = Math.floor(state.gluttony);
    ui.charisma.innerText = Math.floor(state.charisma);
    ui.agility.innerText = Math.floor(state.agility);
    ui.hygiene.innerText = Math.floor(state.hygiene);
    ui.intelligence.innerText = Math.floor(state.intelligence);
    ui.sociality.innerText = Math.floor(state.sociality);
    ui.courage.innerText = Math.floor(state.courage);
    ui.scent.innerText = Math.floor(state.scent);
    
    let month = Math.ceil(state.currentWeek / 4);
    let weekOfMonth = ((state.currentWeek - 1) % 4) + 1;
    let dayStr = days[state.currentDayIndex];
    ui.timeDisplay.innerText = `${month}개월차 ${weekOfMonth}주차 ${dayStr}`;
    
    ui.huskyStageDisplay.innerText = state.isAdult ? '성견 허스키' : '아기 허스키';
    
    if (state.fatigue > 70 || state.stress > 70) {
        ui.fatigue.style.color = '#ef4444';
        ui.stress.style.color = '#ef4444';
    } else {
        ui.fatigue.style.color = '#374151';
        ui.stress.style.color = '#374151';
    }
    
    if (state.hunger > 70) {
        ui.hunger.style.color = '#ef4444';
    } else {
        ui.hunger.style.color = '#374151';
    }
    
    const fc = document.getElementById('furniture-container');
    if (fc) {
        fc.innerHTML = '';
        state.furniture.forEach(item => {
            const div = document.createElement('div');
            div.className = `furniture-item ${item}`;
            div.style.position = 'absolute';
            div.style.fontSize = '2rem';
            if (item === 'bed') { div.innerText = '🛏️'; div.style.left = '10%'; div.style.bottom = '10%'; }
            if (item === 'toybox') { div.innerText = '📦'; div.style.right = '10%'; div.style.bottom = '10%'; }
            if (item === 'feeder') { div.innerText = '🥣'; div.style.right = '20%'; div.style.top = '10%'; }
            fc.appendChild(div);
        });
    }
}

function refreshScheduleOptions() {
    ui.scheduleSelects.forEach(select => {
        const prevVal = select.value;
        if (select.options.length === 0) {
            select.innerHTML = `
                <option value="${ActionType.FEED}">밥 주기</option>
                <option value="${ActionType.WALK}">산책 가기</option>
                <option value="${ActionType.TRAIN}">훈련 하기</option>
                <option value="${ActionType.PLAY}">놀아 주기</option>
                <option value="${ActionType.REST}">휴식 하기</option>
                <option value="${ActionType.BATH}">목욕 시키기</option>
                <option value="${ActionType.WORK_GUARD}">집지키기 알바</option>
                <option value="${ActionType.ADVANCED_TRAIN}" class="adv-opt" style="display:none">고급 훈련</option>
                <option value="${ActionType.OBSTACLE_COURSE}" class="adv-opt" style="display:none">장애물 달리기</option>
                <option value="${ActionType.SLED_PULLING}" class="adv-opt" style="display:none">썰매 끌기</option>
                <option value="${ActionType.WORK_MODEL}" class="adv-opt" style="display:none">모델 알바</option>
                <option value="${ActionType.PUZZLE}" class="adv-opt" style="display:none">실타래 퍼즐 풀기</option>
                <option value="${ActionType.CAFE}" class="adv-opt" style="display:none">애견 카페 방문</option>
                <option value="${ActionType.NIGHT_WALK}" class="adv-opt" style="display:none">야간 산책</option>
                <option value="${ActionType.TRUFFLE}" class="adv-opt" style="display:none">트러플 찾기 알바</option>
                <option value="${ActionType.GUARD_TRAINING}" class="adv-opt" style="display:none">특수 구조 훈련</option>
            `;
        }

        const advTrain = select.querySelector(`option[value="${ActionType.ADVANCED_TRAIN}"]`);
        const obstacle = select.querySelector(`option[value="${ActionType.OBSTACLE_COURSE}"]`);
        const sled = select.querySelector(`option[value="${ActionType.SLED_PULLING}"]`);
        const model = select.querySelector(`option[value="${ActionType.WORK_MODEL}"]`);
        const puzzle = select.querySelector(`option[value="${ActionType.PUZZLE}"]`);
        const cafe = select.querySelector(`option[value="${ActionType.CAFE}"]`);
        const nightWalk = select.querySelector(`option[value="${ActionType.NIGHT_WALK}"]`);
        const truffle = select.querySelector(`option[value="${ActionType.TRUFFLE}"]`);
        const guardTraining = select.querySelector(`option[value="${ActionType.GUARD_TRAINING}"]`);

        if (advTrain) advTrain.style.display = state.obedience >= 30 ? 'block' : 'none';
        if (obstacle) obstacle.style.display = state.obedience >= 50 ? 'block' : 'none';
        if (sled) sled.style.display = state.obedience >= 80 ? 'block' : 'none';
        if (model) model.style.display = state.obedience >= 40 ? 'block' : 'none';
        if (puzzle) puzzle.style.display = state.intelligence >= 30 ? 'block' : 'none';
        if (cafe) cafe.style.display = state.sociality >= 40 ? 'block' : 'none';
        if (nightWalk) nightWalk.style.display = state.courage >= 50 ? 'block' : 'none';
        if (truffle) truffle.style.display = state.scent >= 70 ? 'block' : 'none';
        if (guardTraining) guardTraining.style.display = (state.intelligence >= 60 && state.courage >= 60) ? 'block' : 'none';
        
        const selectedOpt = select.querySelector(`option[value="${prevVal}"]`);
        if(selectedOpt && selectedOpt.style.display !== 'none') {
            select.value = prevVal;
        } else {
            select.value = ActionType.FEED;
        }
    });
}

function showEvent(text) {
    ui.inlineEventText.innerText = text;
    ui.inlineEventPanel.classList.remove('hidden');
    
    if(window.eventPanelTimer) clearTimeout(window.eventPanelTimer);
    window.eventPanelTimer = setTimeout(() => {
        ui.inlineEventPanel.classList.add('hidden');
    }, 2500);
}

function spawnFloatingText(text, color) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.color = color;
    el.style.left = (Math.random() * 80 + 10) + '%';
    el.style.top = (Math.random() * 80 + 10) + '%';
    
    document.getElementById('particles').appendChild(el);
    
    setTimeout(() => {
        el.remove();
    }, 1500);
}

function showSpeechBubble(text) {
    ui.speechBubble.innerText = text;
    ui.speechBubble.classList.remove('hidden');
    
    if(window.speechBubbleTimer) clearTimeout(window.speechBubbleTimer);
    window.speechBubbleTimer = setTimeout(() => {
        ui.speechBubble.classList.add('hidden');
    }, 3000);
}

function renderHusky() {
    ui.huskyChar.style.transform = `translate(calc(-50% + ${huskyState.x}px), calc(-50% + ${huskyState.y}px))`;
    ui.speechBubble.style.transform = `translateX(-50%)`;
    
    let scale = 1.0;
    if (state.currentWeek <= 12) scale = 0.8;
    else if (state.currentWeek >= 26) scale = 1.3;
    
    let svgElement = document.querySelector('.husky-svg');
    if (svgElement) {
        svgElement.style.setProperty('--growth', scale);
    }
    
    ui.huskyChar.setAttribute('data-dir', huskyState.dirString);
    ui.huskyChar.setAttribute('data-anim', huskyState.animation);
    ui.huskyChar.setAttribute('data-frame', huskyState.frameIndex);
    ui.huskyChar.setAttribute('data-expr', huskyState.expression);
    
    ui.huskyChar.className = 'husky-character ' + (huskyState.isDragging ? 'dragging ' : '');
    if (huskyState.animation.startsWith('interact')) ui.huskyChar.classList.add('interact');
}

function updateHuskyExpressionFromStats() {
    if (huskyState.interactionTimer > 0 || huskyState.isDragging) return;
    
    if (state.stamina < 30 || state.fatigue > 70) {
        huskyState.expression = 'tired';
    } else if (state.stress > 70) {
        huskyState.expression = 'stressed';
    } else if (state.gluttony > 70) {
        huskyState.expression = 'hungry';
    } else if (state.affection > 80 && Math.random() < 0.1) {
        huskyState.expression = 'happy';
    } else {
        huskyState.expression = 'neutral';
    }
}
