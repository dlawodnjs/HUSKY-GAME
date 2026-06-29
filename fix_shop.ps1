$lines = Get-Content 'game.js' -Encoding UTF8
$before = $lines[0..779]
$after = $lines[835..($lines.Length-1)]

$block = @"
    // Set data attributes for CSS rules
    ui.huskyChar.setAttribute('data-dir', huskyState.dirString);
    ui.huskyChar.setAttribute('data-anim', huskyState.animation);
    ui.huskyChar.setAttribute('data-frame', huskyState.frameIndex);
    ui.huskyChar.setAttribute('data-expr', huskyState.expression);
    
    // Sync Animation classes
    ui.huskyChar.className = 'husky-character ' + (huskyState.isDragging ? 'dragging ' : '');
    if (huskyState.animation.startsWith('interact')) ui.huskyChar.classList.add('interact');
}

// --- Shop ---
function buyItem(item, cost) {
    if(state.gold >= cost) {
        state.gold -= cost;
        
        let isDanger = state.stress >= 70;
        
        if(item === 'toy') {
            let stressRec = isDanger ? 10 : 20;
            state.stress = Math.max(state.stress - stressRec, 0);
            updateGrowthStat('affection', 10);
        } else if(item === 'bone') {
            updateGrowthStat('wildness', -10);
            let stressRec = isDanger ? 5 : 10;
            state.stress = Math.max(state.stress - stressRec, 0);
        } else if(item === 'vitamin') {
            let stamRec = isDanger ? 25 : 50; 
            state.stamina = Math.min(state.stamina + stamRec, 100);
            state.fatigue = Math.max(state.fatigue - 15, 0);
        } else if(item === 'comb') {
            updateGrowthStat('charisma', 20);
        }
        updateStatsUI();
        
        if(isDanger) showEvent("위험 상태에서 아이템 사용! 조금 진정되었습니다.");
        else showEvent("아이템 구매 완료! 허스키가 좋아합니다!");
    } else {
        showEvent("골드가 부족합니다!");
    }
}

// --- Schedule Options ---
function refreshScheduleOptions() {
    ui.scheduleSelects.forEach(select => {
        const prevVal = select.value;
        select.innerHTML = ``
            <option value="`${ActionType.FEED}`">밥 주기</option>
            <option value="`${ActionType.WALK}`">산책 하기</option>
            <option value="`${ActionType.TRAIN}`">훈련 하기</option>
            <option value="`${ActionType.PLAY}`">놀아 주기</option>
            <option value="`${ActionType.REST}`">휴식 하기</option>
            <option value="`${ActionType.WORK_GUARD}`">집지키기 알바</option>
        ``;
        if(state.obedience >= 30) select.innerHTML += `<option value="`${ActionType.ADVANCED_TRAIN}`">고급 훈련</option>`;
        if(state.obedience >= 50) select.innerHTML += `<option value="`${ActionType.OBSTACLE_COURSE}`">장애물 달리기</option>`;
        if(state.obedience >= 80) select.innerHTML += `<option value="`${ActionType.SLED_PULLING}`">썰매 끌기</option>`;
        if(state.obedience >= 40) select.innerHTML += `<option value="`${ActionType.WORK_MODEL}`">모델 알바</option>`;
        
        if([...select.options].some(opt => opt.value === prevVal)) {
            select.value = prevVal;
        }
    });
}
"@

$newLines = $before + $block.Split("`n") + $after
$newLines | Out-File -FilePath 'game.js' -Encoding UTF8
