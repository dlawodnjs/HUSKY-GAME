// --- js/main.js ---

function init() {
    updateStatsUI();
    refreshScheduleOptions();

    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', resetGame);
    ui.btnExecute.addEventListener('click', executeWeek);

    ui.btnShop.addEventListener('click', () => ui.shopModal.classList.remove('hidden'));
    ui.btnCloseShop.addEventListener('click', () => ui.shopModal.classList.add('hidden'));
    
    ui.btnEnterMinigame.addEventListener('click', () => {
        ui.minigameEntranceModal.classList.add('hidden');
        startMinigame((Math.floor(state.currentWeek/4)) % 3);
    });
    
    ui.btnSkipMinigame.addEventListener('click', () => {
        ui.minigameEntranceModal.classList.add('hidden');
    });
    
    // Virtual Pet Pointer & Touch Events
    ui.huskyChar.addEventListener('pointerdown', startHuskyDrag);
    window.addEventListener('pointermove', updateHuskyDrag);
    window.addEventListener('pointerup', endHuskyDrag);
    
    ui.huskyChar.addEventListener('touchstart', startHuskyDrag, {passive: false});
    window.addEventListener('touchmove', updateHuskyDrag, {passive: false});
    window.addEventListener('touchend', endHuskyDrag);
    
    requestAnimationFrame(updateHuskyLoop);
    
    // Shop buttons Event Delegation
    document.querySelector('.shop-items').addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-buy');
        if (!btn) return;
        buyItem(btn.dataset.item, parseInt(btn.dataset.cost));
    });

    ui.btnMinigameClick.addEventListener('click', handleMinigameClick);
    
    // Show title screen first
    screens.title.style.display = 'flex';
    screens.title.classList.add('active');
    screens.main.classList.remove('active');
}

function startGame() {
    screens.title.classList.remove('active');
    setTimeout(() => {
        screens.title.style.display = 'none';
        screens.main.classList.add('active');
    }, 500); // Wait for fade out
    updateStatsUI();
    refreshScheduleOptions();
}

function resetGame() {
    state = {
        gold: 300, stamina: 50, stress: 0, obedience: 10, wildness: 30, affection: 20,
        strength: 10, gluttony: 20, charisma: 10, agility: 15, 
        intelligence: 10, sociality: 10, courage: 10, scent: 10, hygiene: 50,
        fatigue: 0, currentWeek: 1, currentDayIndex: 0, maxWeeks: 52, isAdult: false, 
        tournamentWins: 0, gameOverReason: "", consecutiveHighStressWeeks: 0, furniture: []
    };
    huskyState.expression = 'neutral';
    screens.ending.classList.remove('active');
    setTimeout(() => {
        screens.ending.style.display = 'none';
        screens.title.style.display = 'flex';
        setTimeout(() => screens.title.classList.add('active'), 10);
    }, 500);
    updateStatsUI();
    refreshScheduleOptions();
}

async function executeWeek() {
    try {
        ui.btnExecute.disabled = true;
        const actions = Array.from(ui.scheduleSelects).map(s => parseInt(s.value));
        const daySlots = document.querySelectorAll('.day-slot');
        
        let statsAtStartOfWeek = {
            obedience: state.obedience, wildness: state.wildness, affection: state.affection,
            strength: state.strength, gluttony: state.gluttony, charisma: state.charisma,
            agility: state.agility, intelligence: state.intelligence, sociality: state.sociality,
            courage: state.courage, scent: state.scent, hygiene: state.hygiene
        };

        for(let i=0; i<actions.length; i++) {
            state.currentDayIndex = i;
            
            daySlots.forEach((slot, idx) => {
                if(idx === i) slot.classList.add('active-day');
                else slot.classList.remove('active-day');
            });
            
            processAction(actions[i]);
            checkRandomEvents();
            checkSeasonalEvents();
            checkStaminaEvents();
            
            updateStatsUI();
            
            await new Promise(r => setTimeout(r, 1000));
            
            if(state.stamina <= 0 || state.gameOverReason !== "") break;
        }
        
        daySlots.forEach(slot => slot.classList.remove('active-day'));
        
        if(state.stamina > 0 && state.gameOverReason === "") {
            for (let key in statsAtStartOfWeek) {
                if (state[key] === statsAtStartOfWeek[key] && state[key] > 0) {
                    updateGrowthStat(key, -3);
                }
            }
            state.currentWeek++;
            state.currentDayIndex = 0;
            
            if(state.currentWeek === 26 && !state.isAdult) {
                state.isAdult = true;
                showEvent("드디어 성견이 되었습니다! 의젓한 모습이 믿음직스럽네요!");
            }
            
            checkPubertyEvents();
            checkGrowthEvents();
            
            if(state.currentWeek > state.maxWeeks) {
                triggerEnding();
            } else if(state.currentWeek % 4 === 0) {
                ui.minigameEntranceModal.classList.remove('hidden');
            }
        } else {
            triggerEnding();
        }
        
        // Apply furniture passive buffs at the end of the week
        if (state.furniture.includes('bed')) {
            state.stamina = Math.min(state.stamina + 10, 100);
            state.fatigue = Math.max(state.fatigue - 5, 0);
        }
        
        updateStatsUI();
        refreshScheduleOptions();
    } catch(e) {
        console.error("Error during executeWeek:", e);
    } finally {
        ui.btnExecute.disabled = false;
    }
}

function processAction(action) {
    let oldState = { ...state };
    let diffMult = state.stress > 50 ? 0.5 : 1.0;
    
    let feedCost = state.furniture.includes('feeder') ? 0 : 5;
    
    switch(action) {
        case ActionType.FEED:
            if (state.gold >= feedCost) {
                state.gold -= feedCost;
                updateGrowthStat('gluttony', 1 * diffMult);
                updateGrowthStat('affection', 1 * diffMult);
                updateGrowthStat('hygiene', -1);
                updateGrowthStat('wildness', -1);
                state.stamina = Math.min(state.stamina + 3, 100);
                state.stress = Math.max(state.stress - 1, 0);
                state.hunger = Math.max(state.hunger - 10, 0);
            } else {
                showEvent("골드가 부족하여 밥을 굶겼습니다!");
                state.stress = Math.min(state.stress + 5, 100);
                updateGrowthStat('affection', -2);
                state.hunger = Math.min(state.hunger + 5, 100);
            }
            break;
        case ActionType.WALK:
            updateGrowthStat('agility', 1 * diffMult);
            updateGrowthStat('affection', 1);
            updateGrowthStat('sociality', 1);
            updateGrowthStat('wildness', 1);
            updateGrowthStat('hygiene', -2);
            updateGrowthStat('obedience', -1);
            state.stamina = Math.max(state.stamina - 3, 0);
            state.stress = Math.max(state.stress - 2, 0);
            break;
        case ActionType.TRAIN:
            updateGrowthStat('obedience', 2 * diffMult);
            updateGrowthStat('strength', 1 * diffMult);
            updateGrowthStat('intelligence', 1);
            updateGrowthStat('wildness', -1);
            updateGrowthStat('affection', -1);
            state.stamina = Math.max(state.stamina - 4, 0);
            state.stress = Math.min(state.stress + 3, 100);
            state.fatigue = Math.min(state.fatigue + 2, 100);
            break;
        case ActionType.PLAY:
            let playMult = state.furniture.includes('toybox') ? 1.5 : 1.0;
            updateGrowthStat('affection', Math.ceil(2 * playMult));
            updateGrowthStat('wildness', 1);
            updateGrowthStat('agility', 1);
            updateGrowthStat('obedience', -1);
            updateGrowthStat('intelligence', -1);
            state.stamina = Math.max(state.stamina - 3, 0);
            state.stress = Math.max(state.stress - Math.ceil(3 * playMult), 0);
            break;
        case ActionType.REST:
            state.stamina = Math.min(state.stamina + 8, 100);
            state.stress = Math.max(state.stress - 3, 0);
            state.fatigue = Math.max(state.fatigue - 4, 0);
            updateGrowthStat('gluttony', 1);
            updateGrowthStat('agility', -1);
            break;
        case ActionType.BATH:
            updateGrowthStat('hygiene', 10);
            updateGrowthStat('charisma', 1);
            updateGrowthStat('affection', -1);
            updateGrowthStat('wildness', -1);
            state.stamina = Math.max(state.stamina - 3, 0);
            state.stress = Math.min(state.stress + 3, 100);
            break;
        case ActionType.PUZZLE:
            updateGrowthStat('intelligence', 2 * diffMult);
            updateGrowthStat('obedience', 1);
            updateGrowthStat('wildness', -1);
            updateGrowthStat('agility', -1);
            state.stamina = Math.max(state.stamina - 2, 0);
            state.stress = Math.min(state.stress + 2, 100);
            state.fatigue = Math.min(state.fatigue + 2, 100);
            break;
        case ActionType.CAFE:
            if (state.gold >= 10) {
                state.gold -= 10;
                updateGrowthStat('sociality', 3 * diffMult);
                updateGrowthStat('charisma', 1);
                updateGrowthStat('affection', 1);
                updateGrowthStat('wildness', -2);
                state.stress = Math.max(state.stress - 4, 0);
            } else {
                showEvent("골드가 부족하여 카페에 가지 못했습니다.");
                state.stress = Math.min(state.stress + 4, 100);
            }
            break;
        case ActionType.NIGHT_WALK:
            updateGrowthStat('courage', 2 * diffMult);
            updateGrowthStat('wildness', 2);
            updateGrowthStat('agility', 1);
            updateGrowthStat('hygiene', -3);
            updateGrowthStat('obedience', -1);
            updateGrowthStat('affection', -1);
            state.stamina = Math.max(state.stamina - 5, 0);
            state.stress = Math.min(state.stress + 1, 100);
            state.fatigue = Math.min(state.fatigue + 3, 100);
            if (Math.random() < 0.3) {
                state.gold += 10;
                showEvent("야간 산책 중 누군가 흘린 지갑을 주워 사례금을 받았습니다!");
            }
            break;
        case ActionType.TRUFFLE:
            updateGrowthStat('scent', 2 * diffMult);
            updateGrowthStat('wildness', 1);
            updateGrowthStat('hygiene', -4);
            updateGrowthStat('obedience', -1);
            state.stamina = Math.max(state.stamina - 6, 0);
            state.stress = Math.min(state.stress + 4, 100);
            state.fatigue = Math.min(state.fatigue + 4, 100);
            let truffleEarn = 15 + Math.floor(Math.random() * 20);
            state.gold += truffleEarn;
            showEvent(`트러플을 찾아 ${truffleEarn}G를 벌었습니다!`);
            break;
        case ActionType.GUARD_TRAINING:
            updateGrowthStat('obedience', 2 * diffMult);
            updateGrowthStat('courage', 2 * diffMult);
            updateGrowthStat('intelligence', 1 * diffMult);
            updateGrowthStat('strength', 1 * diffMult);
            updateGrowthStat('affection', -2);
            updateGrowthStat('sociality', -1);
            state.stamina = Math.max(state.stamina - 8, 0);
            state.stress = Math.min(state.stress + 5, 100);
            state.fatigue = Math.min(state.fatigue + 4, 100);
            break;
        case ActionType.ADVANCED_TRAIN:
            updateGrowthStat('obedience', 2 * diffMult);
            updateGrowthStat('strength', 2 * diffMult);
            updateGrowthStat('agility', 1 * diffMult);
            updateGrowthStat('affection', -1);
            updateGrowthStat('wildness', -1);
            state.stamina = Math.max(state.stamina - 5, 0);
            state.stress = Math.min(state.stress + 4, 100);
            state.fatigue = Math.min(state.fatigue + 3, 100);
            break;
        case ActionType.OBSTACLE_COURSE:
            updateGrowthStat('agility', 2 * diffMult);
            updateGrowthStat('strength', 1 * diffMult);
            updateGrowthStat('courage', 1 * diffMult);
            updateGrowthStat('obedience', -1);
            state.stamina = Math.max(state.stamina - 5, 0);
            state.stress = Math.min(state.stress + 3, 100);
            state.fatigue = Math.min(state.fatigue + 4, 100);
            break;
        case ActionType.SLED_PULLING:
            updateGrowthStat('strength', 3 * diffMult);
            updateGrowthStat('obedience', 1 * diffMult);
            updateGrowthStat('wildness', -1);
            updateGrowthStat('charisma', -1);
            state.stamina = Math.max(state.stamina - 8, 0);
            state.stress = Math.min(state.stress + 5, 100);
            state.fatigue = Math.min(state.fatigue + 5, 100);
            state.gold += 10;
            break;
        case ActionType.WORK_GUARD:
            updateGrowthStat('wildness', 1 * diffMult);
            updateGrowthStat('courage', 1 * diffMult);
            updateGrowthStat('strength', 1 * diffMult);
            updateGrowthStat('affection', -1);
            updateGrowthStat('sociality', -1);
            state.stamina = Math.max(state.stamina - 4, 0);
            state.stress = Math.min(state.stress + 3, 100);
            state.fatigue = Math.min(state.fatigue + 3, 100);
            state.gold += 5;
            break;
        case ActionType.WORK_MODEL:
            updateGrowthStat('charisma', 2 * diffMult);
            updateGrowthStat('obedience', 1 * diffMult);
            updateGrowthStat('wildness', -1);
            updateGrowthStat('hygiene', -2);
            state.stamina = Math.max(state.stamina - 4, 0);
            state.stress = Math.min(state.stress + 4, 100);
            state.fatigue = Math.min(state.fatigue + 2, 100);
            if (state.hygiene < 30) {
                showEvent("청결도가 낮아 모델 알바에서 쫓겨나고 2G를 잃었습니다.");
                state.gold -= 2;
            } else {
                state.gold += 10;
            }
            break;
    }
    
    if (action !== ActionType.FEED) {
        let baseHunger = 1;
        if (state.stamina < oldState.stamina) {
            baseHunger += Math.floor((oldState.stamina - state.stamina) * 0.1);
        }
        state.hunger = Math.min(state.hunger + baseHunger, 100);
    }
    
    if (state.stamina > oldState.stamina) spawnFloatingText(`체력 +` + Math.floor(state.stamina - oldState.stamina), "#4ade80");
    if (state.stamina < oldState.stamina) spawnFloatingText(`체력 ` + Math.floor(state.stamina - oldState.stamina), "#ef4444");
    if (state.stress > oldState.stress) spawnFloatingText(`스트레스 +` + Math.floor(state.stress - oldState.stress), "#ef4444");
    if (state.stress < oldState.stress) spawnFloatingText(`스트레스 ` + Math.floor(state.stress - oldState.stress), "#60a5fa");
    if (state.fatigue > oldState.fatigue) spawnFloatingText(`피로도 +` + Math.floor(state.fatigue - oldState.fatigue), "#fb923c");
    if (state.fatigue < oldState.fatigue) spawnFloatingText(`피로도 ` + Math.floor(state.fatigue - oldState.fatigue), "#3b82f6");
    if (state.hunger > oldState.hunger) spawnFloatingText(`배고픔 +` + Math.floor(state.hunger - oldState.hunger), "#ef4444");
    if (state.hunger < oldState.hunger) spawnFloatingText(`배고픔 ` + Math.floor(state.hunger - oldState.hunger), "#60a5fa");
    if (state.gold > oldState.gold) spawnFloatingText(`+` + Math.floor(state.gold - oldState.gold) + `G`, "#fbbf24");
}

let lastTime = 0;
function updateHuskyLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    updateHuskyAnimation(deltaTime);
    renderHusky();
    requestAnimationFrame(updateHuskyLoop);
}

function chooseNextWanderTarget() {
    const bounds = ui.huskyField.getBoundingClientRect();
    const maxX = bounds.width / 2 - 100;
    const maxY = bounds.height / 2 - 100;
    
    huskyState.targetX = (Math.random() * 2 - 1) * Math.max(0, maxX);
    huskyState.targetY = (Math.random() * 2 - 1) * Math.max(0, maxY);
}

function updateHuskyAnimation(dt) {
    if (huskyState.isDragging || huskyState.isPaused || huskyState.interactionTimer > 0) {
        if (huskyState.interactionTimer > 0) {
            huskyState.interactionTimer -= dt;
            if (huskyState.interactionTimer <= 0) {
                huskyState.animation = 'idle';
                updateHuskyExpressionFromStats();
            }
        }
        return;
    }
    
    let dx = huskyState.targetX - huskyState.x;
    let dy = huskyState.targetY - huskyState.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 10) {
        huskyState.animation = 'idle';
        updateHuskyExpressionFromStats();
        
        huskyState.isPaused = true;
        huskyState.pauseTimer = 1000 + Math.random() * 3000;
        
        setTimeout(() => {
            huskyState.isPaused = false;
            chooseNextWanderTarget();
            huskyState.animation = 'walk';
            
            // Randomly speak when pausing
            if (Math.random() < 0.3) {
                const expr = huskyState.expression;
                const dialogs = huskyDialogs[expr] || huskyDialogs.neutral;
                showSpeechBubble(dialogs[Math.floor(Math.random() * dialogs.length)]);
            }
        }, huskyState.pauseTimer);
    } else {
        huskyState.animation = 'walk';
        let speed = 0.05 * dt;
        huskyState.x += (dx / dist) * speed;
        huskyState.y += (dy / dist) * speed;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            huskyState.dirString = dx > 0 ? 'right' : 'left';
            huskyState.direction = dx > 0 ? 1 : -1;
        } else {
            huskyState.dirString = dy > 0 ? 'down' : 'up';
        }
        
        const bounds = ui.huskyField.getBoundingClientRect();
        const maxX = bounds.width / 2 - 50; 
        const maxY = bounds.height / 2 - 50;
        huskyState.x = Math.max(-maxX, Math.min(maxX, huskyState.x));
        huskyState.y = Math.max(-maxY, Math.min(maxY, huskyState.y));
    }
    
    huskyState.frameTimer += dt;
    if (huskyState.frameTimer > 200) {
        huskyState.frameTimer = 0;
        let animData = frames[huskyState.animation] || frames.idle;
        if(animData && animData.legs) {
             huskyState.frameIndex = (huskyState.frameIndex + 1) % animData.legs.length;
        } else {
            huskyState.frameIndex = 0;
        }
        
        // Ensure leg classes are updated by toggling visibility manually if needed,
        // but renderHusky() handles data-frame attributes which CSS uses to show/hide parts.
    }
}

function startHuskyDrag(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (e.button !== undefined && e.button !== 0) return;
    
    if (e.pointerId !== undefined) ui.huskyChar.setPointerCapture(e.pointerId);
    huskyState.isDragging = true;
    huskyState.animation = 'dragged';
    huskyState.expression = 'curious';
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragStartX = clientX;
    dragStartY = clientY;
    charStartX = huskyState.x;
    charStartY = huskyState.y;
    
    ui.huskyChar.classList.add('dragging');
}

function updateHuskyDrag(e) {
    if (!huskyState.isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    let dx = clientX - dragStartX;
    let dy = clientY - dragStartY;
    
    huskyState.x = charStartX + dx;
    huskyState.y = charStartY + dy;
    
    const bounds = ui.huskyField.getBoundingClientRect();
    const maxX = bounds.width / 2 - 50; 
    const maxY = bounds.height / 2 - 50;
    
    huskyState.x = Math.max(-maxX, Math.min(maxX, huskyState.x));
    huskyState.y = Math.max(-maxY, Math.min(maxY, huskyState.y));
}

function endHuskyDrag(e) {
    if (!huskyState.isDragging) return;
    huskyState.isDragging = false;
    ui.huskyChar.classList.remove('dragging');
    
    huskyState.animation = 'idle';
    updateHuskyExpressionFromStats();
    
    if (e.pointerId !== undefined) ui.huskyChar.releasePointerCapture(e.pointerId);
    
    // Slight affection boost for petting/dragging
    if(Math.random() < 0.3) {
        spawnFloatingText("♥", "#f43f5e");
    }
    
    showSpeechBubble(huskyDialogs.happy[Math.floor(Math.random() * huskyDialogs.happy.length)]);
}

// Start everything
init();
