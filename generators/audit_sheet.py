from PIL import Image
import os
import sys

def audit_sheet(path):
    if not os.path.exists(path):
        print(f"Error: {path} not found.")
        return
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    rows = h // 64
    cols = w // 64
    print(f"Sheet: {path} ({w}x{h}, {rows} rows, {cols} cols)")
    for r in range(rows):
        row_crop = img.crop((0, r*64, w, (r+1)*64))
        # Get count of non-transparent pixels
        pixels = sum(1 for p in row_crop.getdata() if p[3] > 0)
        print(f"Row {r}: {pixels} pixels")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        audit_sheet(sys.argv[1])
    else:
        audit_sheet(r"d:\NFTagachi\generators\lpc_assets\spritesheets\weapon\sword\scimitar\walk\scimitar.png")
