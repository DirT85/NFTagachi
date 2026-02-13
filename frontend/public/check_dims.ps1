Add-Type -AssemblyName System.Drawing
Get-ChildItem *.png | ForEach-Object {
    try {
        $img = [System.Drawing.Image]::FromFile($_.FullName)
        Write-Host "$($_.Name): $($img.Width)x$($img.Height)"
        $img.Dispose()
    } catch {
        Write-Host "$($_.Name): Error processing"
    }
}
