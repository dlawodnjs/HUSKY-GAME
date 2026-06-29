$content = Get-Content 'game.js' -Raw
$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $quoteCount = ($line.ToCharArray() | Where-Object { $_ -eq '"' }).Count
    if ($quoteCount % 2 -ne 0) {
        Write-Output "Line $($i+1): $line"
    }
}
