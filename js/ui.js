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
    statsPanel: document.getElementById('stats-panel'),
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
    endingNew: document.getElementById('ending-new'),

    codexModal: document.getElementById('codex-modal'),
    codexList: document.getElementById('codex-list'),
    codexCount: document.getElementById('codex-count'),
    btnCloseCodex: document.getElementById('btn-close-codex'),
    
    huskyField: document.getElementById('husky-field'),
    huskyChar: document.getElementById('husky-character'),
    speechBubble: document.getElementById('speech-bubble'),
    inlineEventPanel: document.getElementById('inline-event-panel'),
    inlineEventText: document.getElementById('inline-event-text')
};

// UI Functions
// 스탯 패널을 data.js의 스탯 목록으로 한 번 그려 둠
function renderStatsPanel() {
    const section = (title, keys) => `
        <h4 class="stats-section-title">${title}</h4>
        <div class="stats-list">
            ${keys.map(key => `
                <div class="stat-row" title="${statDescKR[key]}">
                    <span class="label">${statNamesKR[key]}</span>
                    <div class="stat-bar"><div class="stat-bar-fill" id="bar-${key}"></div></div>
                    <span class="value" id="stat-${key}"></span>
                </div>`).join('')}
        </div>`;
    ui.statsPanel.innerHTML = section('컨디션', conditionStats) + section('성장 스탯', growthStats);
}

// 컨디션 중 높을수록 나쁜 게이지
const badWhenHigh = ['hunger', 'stress', 'fatigue'];

function updateStatsUI() {
    ui.gold.innerText = Math.floor(state.gold);

    [...conditionStats, ...growthStats].forEach(key => {
        const value = Math.floor(state[key]);
        document.getElementById(`stat-${key}`).innerText = value;
        const bar = document.getElementById(`bar-${key}`);
        bar.style.width = `${value}%`;
        let danger = false;
        if (badWhenHigh.includes(key)) danger = value > 70;
        else if (conditionStats.includes(key)) danger = value < 30;
        bar.classList.toggle('danger', danger);
        bar.classList.toggle('growth', growthStats.includes(key));
    });
    
    let month = Math.ceil(state.currentWeek / 4);
    let weekOfMonth = ((state.currentWeek - 1) % 4) + 1;
    let dayStr = days[state.currentDayIndex];
    ui.timeDisplay.innerText = `${month}개월차 ${weekOfMonth}주차 ${dayStr}`;
    
    ui.huskyStageDisplay.innerText = state.isAdult ? '성견 허스키' : '아기 허스키';
    
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
            ActionType.REST, ActionType.BATH, ActionType.WORK_GUARD, ActionType.NOSEWORK
        ];
        
        if (state.isAdult) {
            if (state.obedience >= 30) availableActions.push(ActionType.ADVANCED_TRAIN);
            if (state.strength >= 30) availableActions.push(ActionType.OBSTACLE_COURSE);
            if (state.strength >= 40) availableActions.push(ActionType.SLED_PULLING);
            if (state.charisma >= 30) availableActions.push(ActionType.WORK_MODEL);
            if (state.intelligence >= 30) availableActions.push(ActionType.PUZZLE);
            if (state.charisma >= 20) availableActions.push(ActionType.CAFE);
            if (state.wildness >= 40) availableActions.push(ActionType.NIGHT_WALK);
            if (state.intelligence >= 40) availableActions.push(ActionType.TRUFFLE);
            if (state.intelligence >= 60 && state.obedience >= 50) availableActions.push(ActionType.GUARD_TRAINING);
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
    } else if (state.hunger > 70) {
        huskyState.expression = 'hungry';
    } else if (state.affection > 80 && Math.random() < 0.1) {
        huskyState.expression = 'happy';
    } else {
        huskyState.expression = 'neutral';
    }
}

// --- Ending Codex ---
function formatCondition(cond) {
    const value = Math.floor(state[cond.stat]);
    const met = isConditionMet(cond);
    const target = cond.min !== undefined ? `${cond.min} 이상` : `${cond.max} 이하`;
    // 진행도: min 조건은 목표 대비 현재값, max 조건은 충족 여부만
    const progress = cond.min !== undefined ? Math.min(value / cond.min, 1) * 100 : (met ? 100 : 0);
    return `
        <li class="codex-cond ${met ? 'met' : ''}">
            <span>${statNamesKR[cond.stat]} ${target}</span>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${progress}%"></div></div>
            <span class="codex-cond-value">${value}</span>
        </li>`;
}

function renderCodex() {
    const unlocked = loadCodex();
    ui.codexCount.innerText = `${endings.filter(e => unlocked.includes(e.id)).length} / ${endings.length}`;
    ui.codexList.innerHTML = endings.map(ending => {
        const open = unlocked.includes(ending.id);
        const conditions = ending.conditions && ending.conditions.length > 0
            ? `<ul class="codex-conds">${ending.conditions.map(formatCondition).join('')}</ul>`
            : `<p class="codex-hint">${ending.hint}</p>`;
        return `
            <div class="codex-card ${open ? 'unlocked' : 'locked'} ${ending.bad ? 'bad' : ''}">
                <div class="codex-icon">${open ? ending.icon : '❔'}</div>
                <div class="codex-body">
                    <h4>${open ? ending.title : '???'}</h4>
                    ${open ? `<p class="codex-desc">${ending.desc}</p>` : ''}
                    ${conditions}
                </div>
            </div>`;
    }).join('');
}

function openCodex() {
    renderCodex();
    ui.codexModal.classList.remove('hidden');
}
