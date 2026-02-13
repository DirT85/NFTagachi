Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("d:/NFTagachi/frontend/public/thug1.png")
$bmp = New-Object System.Drawing.Bitmap($img)

$row10Start = 640
$x = 32 # Middle of first frame

Write-Host "Probing top of Row 10 (y=640 to 660) at x=32..."

for ($y = $row10Start; $y -lt ($row10Start + 20); $y++) {
    $col = $bmp.GetPixel($x, $y)
    Write-Host "y=$y : R=$($col.R) G=$($col.G) B=$($col.B) A=$($col.A)"
}

$bmp.Dispose()
$img.Dispose()
