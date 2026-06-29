$content = Get-Content 'game.js' -Raw
$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Length; $i++) {
    $quoteCount = ($lines[$i].ToCharArray() | Where-Object { $_ -eq '"' }).Count
    if ($quoteCount % 2 -ne 0) {
        $lines[$i] = $lines[$i].TrimEnd("`r") + '"'
    }
}
Set-Content 'game.js' ($lines -join "`n") -Encoding UTF8
