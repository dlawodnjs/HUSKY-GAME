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
    
    scheduleList: document.getElementById('schedule-list'),
    scheduleOptions: document.getElementById('schedule-options'),
    currentEditDay: document.getElementById('current-edit-day'),
    btnUndoSchedule: document.getElementById('btn-undo-schedule'),
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

let weeklySchedule = [];

function renderScheduleUI() {
    ui.scheduleList.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const li = document.createElement('li');
        if (i < weeklySchedule.length) {
            const actionId = weeklySchedule[i];
            li.innerHTML = `<span>${days[i]}</span> <strong>${actionNamesKR[actionId]}</strong>`;
            li.classList.add('filled');
        } else if (i === weeklySchedule.length) {
            li.innerHTML = `<span>${days[i]}</span> <span>선택 중...</span>`;
            li.classList.add('active-day');
        } else {
            li.innerHTML = `<span>${days[i]}</span> <span>미선택</span>`;
            li.classList.add('empty');
        }
        ui.scheduleList.appendChild(li);
    }
    
    const currentDayIndex = weeklySchedule.length;
    if (currentDayIndex < 7) {
        ui.currentEditDay.innerText = `현재 선택: ${days[currentDayIndex]}`;
        ui.currentEditDay.style.color = 'var(--primary-color)';
        
        let availableActions = [
            ActionType.FEED, ActionType.WALK, ActionType.TRAIN, ActionType.PLAY, 
            ActionType.REST, ActionType.BATH, ActionType.WORK_GUARD
        ];
        
        if (state.isAdult) {
            availableActions.push(
                ActionType.ADVANCED_TRAIN, ActionType.OBSTACLE_COURSE, ActionType.SLED_PULLING,
                ActionType.WORK_MODEL, ActionType.PUZZLE, ActionType.CAFE, 
                ActionType.NIGHT_WALK, ActionType.TRUFFLE, ActionType.GUARD_TRAINING
            );
        }
        
        ui.scheduleOptions.innerHTML = '';
        availableActions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'btn-action';
            btn.innerText = actionNamesKR[action];
            btn.onclick = () => {
                weeklySchedule.push(action);
                renderScheduleUI();
            };
            ui.scheduleOptions.appendChild(btn);
        });
    } else {
        ui.currentEditDay.innerText = `주간 스케줄 선택 완료!`;
        ui.currentEditDay.style.color = '#10b981';
        ui.scheduleOptions.innerHTML = '<p style="text-align: center; color: #6b7280; grid-column: 1 / -1; margin-top: 20px;">모든 요일의 스케줄이 채워졌습니다.<br><strong>1주일 실행</strong> 버튼을 눌러주세요.</p>';
    }
    
    ui.btnUndoSchedule.disabled = weeklySchedule.length === 0;
    ui.btnExecute.disabled = weeklySchedule.length < 7;
}

// Add event listener for undo button
ui.btnUndoSchedule.addEventListener('click', () => {
    if (weeklySchedule.length > 0) {
        weeklySchedule.pop();
        renderScheduleUI();
    }
});

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
