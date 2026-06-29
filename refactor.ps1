$content = Get-Content 'game.js' -Raw

$helpers = @"

// --- Stat Progression Helpers ---
function getSoftCappedGain(currentValue, baseGain) {
    if (baseGain <= 0) return baseGain; // Penalties apply fully
    if (currentValue < 20) return baseGain * 0.5;
    if (currentValue < 40) return baseGain * 0.3;
    if (currentValue < 60) return baseGain * 0.15;
    if (currentValue < 80) return baseGain * 0.05;
    return baseGain * 0.01;
}

function updateGrowthStat(statName, baseGain) {
    if (baseGain > 0) {
        let actualGain = getSoftCappedGain(state[statName], baseGain);
        state[statName] = Math.min(state[statName] + actualGain, 100);
    } else {
        state[statName] = Math.max(state[statName] + baseGain, 0);
    }
}
"@

$content = $content -replace '(?s)(let state = \{.*?\};)', "`$1`n$helpers"

# Replace positive gains
$content = [regex]::Replace($content, "state\.(obedience|wildness|affection|strength|gluttony|charisma|agility)\s*=\s*Math\.min\(state\.\1\s*\+\s*(\d+),\s*100\);", "updateGrowthStat('`$1', `$2);")

# Replace negative gains
$content = [regex]::Replace($content, "state\.(obedience|wildness|affection|strength|gluttony|charisma|agility)\s*=\s*Math\.max\(state\.\1\s*-\s*(\d+),\s*0\);", "updateGrowthStat('`$1', -`$2);")

Set-Content 'game.js' $content -Encoding UTF8
