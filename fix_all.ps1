# Read with explicit UTF-8
$lines = Get-Content 'game.js' -Encoding UTF8

$fixCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1

    # Fix days array (line ~49)
    if ($line -match '^const days\s*=\s*\[') {
        $lines[$i] = 'const days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];'
        $fixCount++
        Write-Output "Fixed L$lineNum: days array"
    }

    # Fix stageStr declaration
    if ($line -match '^\s*let stageStr\s*=') {
        $lines[$i] = '    let stageStr = "아기 허스키";'
        $fixCount++
        Write-Output "Fixed L$lineNum: stageStr baby"
    }

    # Fix adult stage check
    if ($line -match 'currentWeek.*26.*stageStr') {
        $lines[$i] = '    if (state.currentWeek >= 26) stageStr = "성견 허스키";'
        $fixCount++
        Write-Output "Fixed L$lineNum: adult stage"
    }

    # Fix teen stage check
    if ($line -match 'currentWeek.*13.*stageStr') {
        $lines[$i] = '    else if (state.currentWeek >= 13) stageStr = "청소년 허스키";'
        $fixCount++
        Write-Output "Fixed L$lineNum: teen stage"
    }

    # Fix timeDisplay template literal (look for '주차' or corrupted version + currentWeek)
    if ($line -match 'timeDisplay\.innerText\s*=\s*`.*currentWeek') {
        $lines[$i] = '    ui.timeDisplay.innerText = `${state.currentWeek}주차 ${days[state.currentDayIndex] || "주말"}`;'
        $fixCount++
        Write-Output "Fixed L$lineNum: timeDisplay"
    }

    # Fix endingTitle lines - search for innerText with 'endingTitle'
    if ($line -match "endingTitle\.innerText\s*=") {
        if ($line -match '諛곕뱶') {
            $lines[$i] = '        ui.endingTitle.innerText = "배드 엔딩";'
            $fixCount++; Write-Output "Fixed L$lineNum: bad ending"
        } elseif ($line -match '?곕ℓ寃.*梨뷀뵾') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 썰매견 챔피언";'
            $fixCount++; Write-Output "Fixed L$lineNum: sled champ"
        } elseif ($line -match '?곕ℓ寃') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 썰매견";'
            $fixCount++; Write-Output "Fixed L$lineNum: sled dog"
        } elseif ($line -match '梨뷀뵾') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 챔피언";'
            $fixCount++; Write-Output "Fixed L$lineNum: champ"
        } elseif ($line -match '?멸린') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 인기스타";'
            $fixCount++; Write-Output "Fixed L$lineNum: star"
        } elseif ($line -match '?쇱깮') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 야생늑대";'
            $fixCount++; Write-Output "Fixed L$lineNum: wolf"
        } elseif ($line -match '寃쎌같') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 경찰견";'
            $fixCount++; Write-Output "Fixed L$lineNum: police"
        } elseif ($line -match '?깅낫') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 뚱보견";'
            $fixCount++; Write-Output "Fixed L$lineNum: chubby"
        } elseif ($line -match '?됰쾾') {
            $lines[$i] = '        ui.endingTitle.innerText = "엔딩: 평범한 허스키";'
            $fixCount++; Write-Output "Fixed L$lineNum: normal"
        }
    }

    # Fix tournament showEvent
    if ($line -match 'showEvent.*1000G') {
        $lines[$i] = '        showEvent("대회 우승! 상금 1000G 획득!");'
        $fixCount++; Write-Output "Fixed L$lineNum: tournament win"
    }
    # Fix defeat showEvent
    if ($line -match 'showEvent.*?섏씠?댁쑀|패배|??뚯뿉') {
        $lines[$i] = '        showEvent("대회에서 패배했습니다... (스트레스 증가, 체력 감소)");'
        $fixCount++; Write-Output "Fixed L$lineNum: tournament lose"
    }
}

# Save back with UTF-8 (no BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines('game.js', $lines, $utf8NoBom)
Write-Output "Done. Total fixes: $fixCount"
