$lines = Get-Content 'game.js'

for ($i = 0; $i -lt $lines.Length; $i++) {
    # Fix "if (state.currentWeek >= 26) stageStr = ..."
    if ($lines[$i] -match 'currentWeek.*26.*stageStr') {
        $lines[$i] = '    if (state.currentWeek >= 26) stageStr = "성견 허스키";'
        Write-Output "Fixed line $($i+1): adult stage"
    }
    # Fix "else if (state.currentWeek >= 13) stageStr = ..."
    if ($lines[$i] -match 'currentWeek.*13.*stageStr') {
        $lines[$i] = '    else if (state.currentWeek >= 13) stageStr = "청소년 허스키";'
        Write-Output "Fixed line $($i+1): teen stage"
    }
}

Set-Content 'game.js' ($lines -join "`n") -Encoding UTF8
Write-Output "Done."
