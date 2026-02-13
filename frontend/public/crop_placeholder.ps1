Add-Type -AssemblyName System.Drawing

$srcPath = "d:\NFTagachi\frontend\public\cyber_dragon_sheet.png"
$destPath = "d:\NFTagachi\frontend\public\mini_placeholder.png"

$src = [System.Drawing.Image]::FromFile($srcPath)
$dest = new-object System.Drawing.Bitmap(256, 256)
$g = [System.Drawing.Graphics]::FromImage($dest)

# Copy 0,0,256,256 from source to 0,0,256,256 dest
# This grabs the first 4 columns of the first 4 rows (Idle, Walk, Eat, Attack)
$rect = new-object System.Drawing.Rectangle(0, 0, 256, 256)
$g.DrawImage($src, $rect, $rect, [System.Drawing.GraphicsUnit]::Pixel)

$dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$dest.Dispose()
$g.Dispose()

Write-Host "Created 4x4 mini placeholder at $destPath"
