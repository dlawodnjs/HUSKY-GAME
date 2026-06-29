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
        state.gameOverReason = "체력이 바닥나서 쓰러졌습니다. 병원에 입원하게 되었습니다...";
    } else if(state.stamina >= 100) {
        if(Math.random() < 0.5) updateGrowthStat('strength', 5);
        else updateGrowthStat('agility', 5);
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
            else { updateGrowthStat('agility', 10); state.stress = Math.max(state.stress - 15, 0); }
        } else if(state.currentWeek <= 39) {
            updateGrowthStat('gluttony', 15);
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
            state.gameOverReason = "지속적인 스트레스로 인해 허스키가 가출해버렸습니다...";
        }
    } else {
        state.consecutiveHighStressWeeks = 0;
    }
}

function triggerEnding() {
    screens.main.classList.remove('active');
    screens.ending.style.display = 'flex';
    screens.ending.classList.add('active');
    
    let imgSrc = "assets/ending_normal_1782580596536.jpg"; // Default
    
    if (state.gameOverReason !== "") {
        ui.endingTitle.innerText = "배드 엔딩";
        ui.endingDesc.innerText = state.gameOverReason;
        imgSrc = "assets/ending_destroyer_1782580583119.jpg";
    } else if (state.wildness >= 80 && state.courage >= 70) {
        ui.endingTitle.innerText = "엔딩: 야생의 늑대";
        ui.endingDesc.innerText = "야성과 용기가 극에 달해 자연으로 돌아갔습니다...";
        imgSrc = "assets/ending_wolf_1782580570989.jpg";
    } else if (state.intelligence >= 80 && state.scent >= 80) {
        ui.endingTitle.innerText = "엔딩: 전설의 트러플 탐지견";
        ui.endingDesc.innerText = "뛰어난 지능과 후각으로 세계 최고의 트러플 탐지견이 되어 억만장자가 되었습니다!";
    } else if (state.intelligence >= 70 && state.obedience >= 70 && state.courage >= 70) {
        ui.endingTitle.innerText = "엔딩: 천재 특수 경찰견";
        ui.endingDesc.innerText = "높은 지능, 복종, 그리고 용기를 바탕으로 가장 존경받는 경찰견이 되었습니다.";
    } else if (state.charisma >= 80 && state.sociality >= 70 && state.hygiene >= 70) {
        ui.endingTitle.innerText = "엔딩: 슈퍼모델 펫";
        ui.endingDesc.innerText = "매력과 사회성, 청결함이 빛을 발해 전 세계 잡지 표지를 장식하는 모델이 되었습니다.";
        imgSrc = "assets/ending_model_1782580561321.jpg";
    } else if (state.obedience >= 80 && state.strength >= 70 && state.courage >= 60) {
        ui.endingTitle.innerText = "엔딩: 명품 경비견";
        ui.endingDesc.innerText = "주인을 지키려는 본능이 강해져 아주 훌륭한 경비견으로 성장했습니다.";
        imgSrc = "assets/husky_adult.jpg";
    } else if (state.agility >= 80 && state.strength >= 80) {
        ui.endingTitle.innerText = "엔딩: 썰매견 챔피언";
        ui.endingDesc.innerText = "체력과 민첩성이 뛰어나 썰매견 대회에서 우승을 차지했습니다!";
        imgSrc = "assets/ending_sled_1782580550640.jpg";
    } else if (state.sociality >= 80 && state.affection >= 80) {
        ui.endingTitle.innerText = "엔딩: 우주 대스타 인싸견";
        ui.endingDesc.innerText = "동네의 모든 강아지와 사람들에게 사랑받는 최고의 인싸 허스키가 되었습니다.";
    } else if (state.gluttony >= 90) {
        ui.endingTitle.innerText = "엔딩: 뚱뚱보 먹보";
        ui.endingDesc.innerText = "세상의 모든 간식을 탐하는 뚱뚱한 허스키가 되었습니다. 그래도 귀엽습니다.";
    } else {
        ui.endingTitle.innerText = "엔딩: 평범하고 행복한 반려견";
        ui.endingDesc.innerText = "특별한 특징 없이 무난하게 성장한 평범한 허스키입니다. 행복한 일상을 보냅니다.";
    }
    
    ui.endingImage.src = imgSrc;
}
