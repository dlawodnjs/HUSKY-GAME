// --- js/minigame.js ---

function buyItem(item, cost) {
    if(state.gold >= cost) {
        if (['bed', 'toybox', 'feeder'].includes(item) && state.furniture.includes(item)) {
            showEvent("이미 보유한 가구입니다.");
            return;
        }

        state.gold -= cost;
        
        let isDanger = state.stress >= 70;
        
        if(item === 'toy') {
            let stressRec = isDanger ? 1 : 2;
            state.stress = Math.max(state.stress - stressRec, 0);
            updateGrowthStat('affection', 2);
        } else if(item === 'bone') {
            updateGrowthStat('wildness', -2);
            let stressRec = isDanger ? 1 : 2;
            state.stress = Math.max(state.stress - stressRec, 0);
        } else if(item === 'vitamin') {
            let stamRec = isDanger ? 5 : 10; 
            state.stamina = Math.min(state.stamina + stamRec, 100);
            state.fatigue = Math.max(state.fatigue - 3, 0);
        } else if(item === 'comb') {
            updateGrowthStat('charisma', 2);
            updateGrowthStat('hygiene', 5);
        } else if (['bed', 'toybox', 'feeder'].includes(item)) {
            state.furniture.push(item);
            showEvent("새로운 가구를 방에 배치했습니다!");
            updateStatsUI();
            return;
        }
        updateStatsUI();
        
        if(isDanger) showEvent("위험 상태에서 아이템 사용! 조금 진정되었습니다.");
        else showEvent("아이템 구매 완료! 허스키가 좋아합니다.");
    } else {
        showEvent("골드가 부족합니다!");
    }
}

function startMinigame(type) {
    minigameType = type;
    minigameScore = 0;
    minigameTimeLeft = 5.0;
    
    if (type === 0) ui.minigameTitle.innerText = "원반 던지기";
    else if (type === 1) ui.minigameTitle.innerText = "줄다리기";
    else ui.minigameTitle.innerText = "장애물 넘기";
    
    ui.minigameScore.innerText = minigameScore;
    ui.minigameTimer.innerText = minigameTimeLeft.toFixed(1);
    
    ui.minigameModal.classList.remove('hidden');
    ui.btnMinigameClick.disabled = false;
    
    if(minigameTimer) clearInterval(minigameTimer);
    minigameTimer = setInterval(() => {
        minigameTimeLeft -= 0.1;
        if (minigameTimeLeft <= 0) {
            minigameTimeLeft = 0;
            endMinigame();
        }
        ui.minigameTimer.innerText = minigameTimeLeft.toFixed(1);
    }, 100);
}

function handleMinigameClick() {
    minigameScore++;
    ui.minigameScore.innerText = minigameScore;
    
    ui.btnMinigameClick.style.transform = `scale(` + (1 + Math.random()*0.2) + `)`;
    setTimeout(() => { ui.btnMinigameClick.style.transform = `scale(1)`; }, 50);
}

function endMinigame() {
    clearInterval(minigameTimer);
    minigameTimer = null;
    ui.btnMinigameClick.disabled = true;
    
    setTimeout(() => {
        ui.minigameModal.classList.add('hidden');
        
        if(minigameScore >= 30) {
            showEvent("대성공! 아주 훌륭한 성과를 거두었습니다.");
            updateGrowthStat('agility', 15);
            updateGrowthStat('strength', 15);
            state.gold += 100;
        } else if(minigameScore >= 15) {
            showEvent("성공! 꽤 잘했습니다.");
            updateGrowthStat('agility', 10);
            state.gold += 50;
        } else {
            showEvent("실패... 연습이 더 필요하겠네요.");
            state.stress = Math.min(state.stress + 10, 100);
        }
        updateStatsUI();
    }, 1000);
}
