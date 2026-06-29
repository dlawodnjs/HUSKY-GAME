$lines = Get-Content 'game.js' -Encoding UTF8
$found = $false
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $quoteCount = ($line.ToCharArray() | Where-Object { $_ -eq '"' }).Count
    if ($quoteCount % 2 -ne 0) {
        Write-Output "ODD-QUOTE Line $($i+1): $line"
        $found = $true
    }
}
if (-not $found) {
    Write-Output "OK: No odd-quote lines found in UTF-8 reading."
}
