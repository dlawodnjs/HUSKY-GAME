$lines = Get-Content 'game.js'
for ($i = 143; $i -le 152; $i++) {
    $line = $lines[$i - 1]
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($line)
    $hex = ($bytes | ForEach-Object { $_.ToString('X2') }) -join ' '
    $msg1 = "LINE $($i): " + $line
    $msg2 = "HEX: " + $hex
    Write-Output $msg1
    Write-Output $msg2
    Write-Output '---'
}
