Add-Type -AssemblyName System.Drawing

function Remove-Bg {
    param($path, $outPath, $isWhite)
    
    if (-not (Test-Path $path)) {
        Write-Host "File not found: $path"
        return
    }

    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    $outBmp = New-Object System.Drawing.Bitmap $bmp.Width, $bmp.Height
    for ($x=0; $x -lt $bmp.Width; $x++) {
        for ($y=0; $y -lt $bmp.Height; $y++) {
            $outBmp.SetPixel($x, $y, $bmp.GetPixel($x, $y))
        }
    }
    $bmp.Dispose()
    
    $w = $outBmp.Width
    $h = $outBmp.Height

    $q = New-Object System.Collections.Generic.Queue[System.Drawing.Point]
    for ($i=0; $i -lt $w; $i++) {
        $q.Enqueue((New-Object System.Drawing.Point $i,0))
        $q.Enqueue((New-Object System.Drawing.Point $i,($h-1)))
    }
    for ($j=0; $j -lt $h; $j++) {
        $q.Enqueue((New-Object System.Drawing.Point 0,$j))
        $q.Enqueue((New-Object System.Drawing.Point ($w-1),$j))
    }

    $visited = New-Object 'bool[,]' $w, $h

    while ($q.Count -gt 0) {
        $p = $q.Dequeue()
        $x = $p.X
        $y = $p.Y

        if ($x -lt 0 -or $x -ge $w -or $y -lt 0 -or $y -ge $h) { continue }
        if ($visited[$x,$y]) { continue }
        $visited[$x,$y] = $true

        $c = $outBmp.GetPixel($x, $y)
        
        if ($c.A -eq 0) {
            $q.Enqueue((New-Object System.Drawing.Point ($x+1),$y))
            $q.Enqueue((New-Object System.Drawing.Point ($x-1),$y))
            $q.Enqueue((New-Object System.Drawing.Point $x,($y+1)))
            $q.Enqueue((New-Object System.Drawing.Point $x,($y-1)))
            continue
        }

        $isBg = $false
        if ($isWhite) {
            $dist = [Math]::Abs($c.R - 255) + [Math]::Abs($c.G - 255) + [Math]::Abs($c.B - 255)
            if ($dist -lt 90) { $isBg = $true }
        } else {
            $dist = [Math]::Abs($c.R - 0) + [Math]::Abs($c.G - 255) + [Math]::Abs($c.B - 0)
            if ($dist -lt 150) { $isBg = $true }
        }

        if ($isBg) {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            $q.Enqueue((New-Object System.Drawing.Point ($x+1),$y))
            $q.Enqueue((New-Object System.Drawing.Point ($x-1),$y))
            $q.Enqueue((New-Object System.Drawing.Point $x,($y+1)))
            $q.Enqueue((New-Object System.Drawing.Point $x,($y-1)))
        }
    }
    
    $outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "Processed $outPath"
}

Remove-Bg ".\assets\husky_sprite.jpg" ".\assets\husky_sprite_transparent.png" $true
Remove-Bg ".\assets\husky_adult.jpg" ".\assets\husky_adult_transparent.png" $false

Remove-Bg "..\friendly-goodall\assets\husky_happy.png" ".\assets\husky_happy.png" $true
Remove-Bg "..\friendly-goodall\assets\husky_annoyed.png" ".\assets\husky_annoyed.png" $true
Remove-Bg "..\friendly-goodall\assets\husky_surprised.png" ".\assets\husky_surprised.png" $true
