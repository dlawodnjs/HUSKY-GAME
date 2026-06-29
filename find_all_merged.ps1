$lines = Get-Content 'game.js' -Encoding UTF8
$out = @()
for ($i=0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '//.*(function |state\.|ui\.|let |const |var |return |\}|\{)') {
        $out += "$($i+1): $($lines[$i])"
    }
}
$out | Out-File -FilePath 'merged_lines_all.txt' -Encoding UTF8
