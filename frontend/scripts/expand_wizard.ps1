
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$SourceFile,
        [string]$OutputFile
    )

    if (-not (Test-Path $SourceFile)) {
        Write-Error "Source file not found: $SourceFile"
        return
    }

    $src = [System.Drawing.Bitmap]::FromFile($SourceFile)
    
    # Target: 1152x4224 (18 cols, 66 rows)
    $dest = New-Object System.Drawing.Bitmap(1152, 4224)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

    # MAPPING
    # Source (640x640) -> 10 Rows of 10 Frames (64px)
    # Target (1152x4224) -> Row 10=Idle, Row 11=Walk

    # S_ROW -> T_ROW
    $mappings = @{
        0 = 10; # Src Idle -> Tgt Idle
        1 = 11; # Src Walk -> Tgt Walk
        2 = 0;  # Src Spell -> Tgt Spell (Train)
        3 = 2;  # Src Thrust -> Tgt Eat
        4 = 6;  # Src Slash -> Tgt Clean
        5 = 20; # Src Hurt -> Tgt Die
        6 = 15; # Src Shoot -> Tgt Attack
    }

    $mappings.GetEnumerator() | ForEach-Object {
        $sRow = $_.Key
        $tRow = $_.Value
        
        # Draw 18 frames (Loop source 10 frames)
        for ($i = 0; $i -lt 18; $i++) {
            $srcFrame = $i % 10
            
            # Destination Rect
            $destRect = New-Object System.Drawing.Rectangle($i * 64, $tRow * 64, 64, 64)
            # Source Rect
            $srcRect = New-Object System.Drawing.Rectangle($srcFrame * 64, $sRow * 64, 64, 64)
            
            $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        }
    }

    $dest.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $src.Dispose()
    $dest.Dispose()
    $g.Dispose()
    Write-Host "Generated $OutputFile"
}

Resize-Image -SourceFile "d:\NFTagachi\frontend\public\wizard_base.png" -OutputFile "d:\NFTagachi\frontend\public\wizard1.png"
