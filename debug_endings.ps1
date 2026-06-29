$lines = Get-Content 'game.js'
$targetLines = @(1255, 1259, 1263, 1267, 1271, 1275, 1279, 1283, 1287)
foreach ($i in $targetLines) {
    $line = $lines[$i - 1]
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($line)
    # Count 0x22 (double-quote) bytes
    $quoteCount = ($bytes | Where-Object { $_ -eq 0x22 }).Count
    $hex = ($bytes | ForEach-Object { $_.ToString('X2') }) -join ' '
    $msg = "LINE $($i) [quotes=$($quoteCount)]: " + $line
    Write-Output $msg
    Write-Output $hex
    Write-Output '---'
}
