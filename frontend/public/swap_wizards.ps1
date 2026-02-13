
# Resize wizard3 to wizard1 (320x320)
Add-Type -AssemblyName System.Drawing

function Resize-And-Replace {
    param([string]$SourceFile, [string]$DestFile, [int]$Width, [int]$Height)
    
    if (-not (Test-Path $SourceFile)) {
        Write-Host "Source file not found: $SourceFile"
        return
    }

    $src = [System.Drawing.Image]::FromFile($SourceFile)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    
    # High Quality Scaling
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.DrawImage($src, 0, 0, $Width, $Height)
    
    $tempFile = $DestFile + ".temp.png"
    $bmp.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $src.Dispose()
    $bmp.Dispose()
    $graphics.Dispose()
    
    Move-Item -Force $tempFile $DestFile
    Write-Host "Resized $SourceFile and saved to $DestFile ($Width x $Height)"
}

Resize-And-Replace -SourceFile "d:\NFTagachi\frontend\public\wizard3.png" -DestFile "d:\NFTagachi\frontend\public\wizard1.png" -Width 320 -Height 320
