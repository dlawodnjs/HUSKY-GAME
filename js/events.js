// --- js/events.js ---

function updateGrowthStat(statName, value) {
    if (state[statName] !== undefined) {
        let oldVal = state[statName];
        state[statName] = Math.min(Math.max(state[statName] + value, 0), 100);
        let diff = state[statName] - oldVal;
        
        if (diff > 0 && typeof spawnFloatingText === 'function' && statNamesKR[statName]) {
            spawnFloatingText(`${statNamesKR[statName]} +${Math.floor(diff)}`, "#4ade80");
        } else if (diff < 0 && typeof spawnFloatingText === 'function' && statNamesKR[statName]) {
            spawnFloatingText(`${statNamesKR[statName]} ${Math.floor(diff)}`, "#ef4444");
        }
    }
}

function checkStaminaEvents() {
    if(state.stamina <= 0) {
        state.gameOverType = 'collapse';
        state.gameOverReason = "체력이 바닥나서 쓰러졌습니다. 병원에 입원하게 되었습니다...";
    } else if(state.stamina >= 100) {
        updateGrowthStat('strength', 5);
        state.stamina = 95;
    }
}

function checkRandomEvents() {
    if(Math.random() < 0.15) {
        let type = Math.floor(Math.random() * 3);
        if(type===0) {
            state.stamina = Math.max(state.stamina - 10, 0);
            state.stress = Math.max(state.stress - 10, 0);
            showEvent("신나게 뛰어놀다가 발을 헛디뎠습니다!");
        } else if(type===1) {
            state.stress = Math.min(state.stress + 15, 100);
            updateGrowthStat('affection', -5);
            showEvent("낯선 개구리를 보고 깜짝 놀라 짖어댔습니다.");
        } else {
            state.stress = Math.max(state.stress - 20, 0);
            updateGrowthStat('affection', 10);
            showEvent("맛있는 간식을 몰래 훔쳐 먹었습니다!");
        }
    }
}

function checkSeasonalEvents() {
    if(Math.random() < 0.05) {
        if(state.currentWeek <= 13) {
            if(Math.random() < 0.5) state.stamina = Math.max(state.stamina - 5, 0);
            else { updateGrowthStat('affection', 15); state.stress = Math.max(state.stress - 20, 0); }
        } else if(state.currentWeek <= 26) {
            if(Math.random() < 0.5) state.stamina = Math.max(state.stamina - 15, 0);
            else { updateGrowthStat('strength', 10); state.stress = Math.max(state.stress - 15, 0); }
        } else if(state.currentWeek <= 39) {
            state.hunger = Math.min(state.hunger + 15, 100);
        } else {
            if(Math.random() < 0.5) { updateGrowthStat('wildness', 10); updateGrowthStat('affection', 10); }
            else state.stamina = Math.max(state.stamina - 20, 0);
        }
    }
}

function checkPubertyEvents() {
    if(state.currentWeek >= 13 && state.currentWeek <= 25) {
        if(Math.random() < 0.2) {
            if(Math.random() < 0.5) {
                state.gold = Math.max(state.gold - 50, 0);
                state.stress = Math.max(state.stress - 15, 0);
                updateGrowthStat('obedience', -10);
                showEvent("사춘기 반항! 소파를 물어뜯어 변상했습니다.");
            } else {
                updateGrowthStat('wildness', 15);
                showEvent("이유 없이 밤에 늑대처럼 울부짖습니다.");
            }
        }
    }
}

function checkGrowthEvents() {
    if (state.fatigue >= 80) {
        showEvent("피로가 누적되어 병에 걸렸습니다! 휴식이 필요합니다.");
        state.stress = Math.min(state.stress + 10, 100);
        state.stamina = Math.max(state.stamina - 10, 0);
    }
    
    if (state.hunger >= 100) {
        showEvent("너무 굶주려서 기절했습니다! 체력이 급감합니다.");
        state.stamina = Math.max(state.stamina - 30, 0);
        state.stress = Math.min(state.stress + 20, 100);
        spawnFloatingText("굶주림!", "#ef4444");
    } else if (state.hunger >= 80) {
        showEvent("배가 고파서 극도로 예민해져 있습니다.");
        state.stress = Math.min(state.stress + 15, 100);
    }
    
    if (state.stress >= 90) {
        state.consecutiveHighStressWeeks++;
        showEvent("아주 위험 상태! 스트레스가 극에 달해 쓰러질 것 같습니다.");
        spawnFloatingText("스트레스 극심!", "#ef4444");
        
        if (state.consecutiveHighStressWeeks >= 3) {
            state.gameOverType = 'runaway';
            state.gameOverReason = "지속적인 스트레스로 인해 허스키가 가출해버렸습니다...";
        }
    } else {
        state.consecutiveHighStressWeeks = 0;
    }
}

function isConditionMet(cond) {
    const value = state[cond.stat];
    if (cond.min !== undefined) return value >= cond.min;
    return value <= cond.max;
}

// 조건을 얼마나 여유 있게 넘겼는지 (조건당 평균 초과분)
function endingMargin(ending) {
    const total = ending.conditions.reduce((sum, cond) => {
        const value = state[cond.stat];
        return sum + (cond.min !== undefined ? value - cond.min : cond.max - value);
    }, 0);
    return total / ending.conditions.length;
}

function pickEnding() {
    if (state.gameOverReason !== "") {
        return endings.find(e => e.id === state.gameOverType) || endings.find(e => e.id === 'collapse');
    }
    let best = null;
    endings.forEach(ending => {
        if (ending.bad || ending.conditions.length === 0) return;
        if (!ending.conditions.every(isConditionMet)) return;
        if (!best || endingMargin(ending) > endingMargin(best)) best = ending;
    });
    return best || endings.find(e => e.id === 'normal');
}

function loadCodex() {
    try {
        const saved = JSON.parse(localStorage.getItem(CODEX_STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

// 새로 등록된 엔딩이면 true
function unlockEnding(id) {
    const unlocked = loadCodex();
    if (unlocked.includes(id)) return false;
    unlocked.push(id);
    try {
        localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(unlocked));
    } catch (e) {}
    return true;
}

function triggerEnding() {
    screens.main.classList.remove('active');
    screens.ending.style.display = 'flex';
    screens.ending.classList.add('active');

    const ending = pickEnding();
    const isNew = unlockEnding(ending.id);

    ui.endingTitle.innerText = ending.bad ? ending.title : `엔딩: ${ending.title}`;
    ui.endingDesc.innerText = ending.desc;
    ui.endingImage.src = ending.image || "assets/ending_normal_1782580596536.jpg";
    ui.endingNew.classList.toggle('hidden', !isNew);
}
