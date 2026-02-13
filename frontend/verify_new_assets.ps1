Add-Type -AssemblyName System.Drawing
$files = @("alien.png", "badbaby.png", "blackbeast.png", "coppercupid.png", "frankenstein.png", "greenstrongalien.png", "minodragon1.png", "minodragon2.png")
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
