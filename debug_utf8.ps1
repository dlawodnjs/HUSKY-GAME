$lines = Get-Content 'game.js' -Encoding UTF8
foreach ($i in @(49, 150, 151, 152)) {
    $line = $lines[$i - 1]
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($line)
    $hex = ($bytes | ForEach-Object { $_.ToString('X2') }) -join ' '
    Write-Output "LINE $($i): $line"
    Write-Output "HEX: $hex"
    Write-Output '---'
}
