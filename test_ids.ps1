$ids = @(
    'time-display', 'stat-gold', 'stat-stamina', 'stat-stress', 'stat-fatigue', 
    'stat-obedience', 'stat-wildness', 'stat-affection', 'stat-strength', 
    'stat-gluttony', 'stat-charisma', 'stat-agility', 'husky-field', 
    'husky-character', 'husky-svg', 'husky-stage-display', 'speech-bubble', 
    'btn-execute', 'btn-shop', 'inline-event-panel', 'inline-event-text', 
    'minigame-modal', 'minigame-title', 'minigame-timer', 'minigame-score', 
    'btn-minigame-click', 'shop-modal', 'btn-close-shop', 'ending-title', 
    'ending-image', 'ending-desc', 'btn-restart', 'btn-start'
)

$html = Get-Content 'index.html' -Raw
foreach ($id in $ids) {
    if (-not ($html -match "id=`"$id`"")) {
        Write-Output "Missing: $id"
    }
}
