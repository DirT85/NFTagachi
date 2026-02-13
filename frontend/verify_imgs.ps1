Add-Type -AssemblyName System.Drawing
$files = @("thug1.png", "thug2.png", "thug3.png", "cyber_dragon_sheet.png")
foreach ($f in $files) {
    $p = "d:/NFTagachi/frontend/public/" + $f
    if (Test-Path $p) {
        $img = [System.Drawing.Image]::FromFile($p)
        Write-Host "$f : $($img.Width)x$($img.Height)"
        $img.Dispose()
    } else {
        Write-Host "$f : NOT FOUND"
    }
}
