
Add-Type -AssemblyName System.Drawing

$AssetRoot = "d:\NFTagachi\generators\lpc_assets\spritesheets"
$OutputRoot = "d:\NFTagachi\frontend\public"

function Get-RandomFile($Path) {
    if (-not (Test-Path $Path)) { return $null }
    $files = Get-ChildItem -Path $Path -Recurse -Filter "*.png"
    if ($files.Count -eq 0) { return $null }
    return ($files | Get-Random).FullName
}

function Generate-Character($Id) {
    # 1. Base Canvas (Standard LPC Size 832x1344)
    # Most assets are 832x1344 (13 cols). If some are expanded, we might need logic.
    # Assuming standard LPC for now.
    
    $width = 832
    $height = 1344
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # 2. Select Layers
    # Simplify path finding logic
    
    $layers = @()
    
    # BODY
    $body = Get-RandomFile "$AssetRoot\body\bodies\male"
    if ($body) { $layers += $body } else { Write-Warning "No body found" }

    # LEGS (Pants)
    # legs/pants/male
    $legs = Get-RandomFile "$AssetRoot\legs\pants\male"
    if ($legs) { $layers += $legs }
    
    # TORSO (Shirt/Armor)
    # torso/clothes/longsleeve/male or torso/clothes/shirt/male
    $torsoType = Get-Random "longsleeve", "shirt", "vest", "tunic"
    $torso = Get-RandomFile "$AssetRoot\torso\clothes\$torsoType\male"
    if (-not $torso) { $torso = Get-RandomFile "$AssetRoot\torso\clothes\longsleeve\male" }
    if ($torso) { $layers += $torso }
    
    # FEET (Shoes)
    # feet/shoes/male? Check path later, assuming valid or skipping
    $feet = Get-RandomFile "$AssetRoot\feet\shoes\male"
    if ($feet) { $layers += $feet }
    
    # WEAPON
    # weapons/right hand/male ?? Need to verify path. 
    # Let's skip weapon for now to be safe or try generic
    # $wep = Get-RandomFile "$AssetRoot\weapons\right hand\male"
    # if ($wep) { $layers += $wep }

    # HAT/HAIR
    # hair/male ??
    $hair = Get-RandomFile "$AssetRoot\hair\male"
    if ($hair) { $layers += $hair }

    # 3. Draw Layers
    foreach ($layerPath in $layers) {
        if ($layerPath -and (Test-Path $layerPath)) {
            try {
                $img = [System.Drawing.Bitmap]::FromFile($layerPath)
                $g.DrawImage($img, 0, 0, $width, $height)
                $img.Dispose()
            } catch {
                Write-Warning "Failed to load layer: $layerPath"
            }
        }
    }
    
    # 4. Save
    $outFile = "$OutputRoot\wizard_generated_$Id.png"
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $g.Dispose()
    
    Write-Host "Generated $outFile"
}

# Generate 4
for ($i=1; $i -le 4; $i++) {
    Generate-Character -Id $i
}
