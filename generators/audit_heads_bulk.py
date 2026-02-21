import os
from PIL import Image

FOLDERS = [
    r"d:\NFTagachi\generators\lpc_assets\spritesheets\head\heads\human\elderly_small\walk",
    r"d:\NFTagachi\generators\lpc_assets\spritesheets\head\heads\human\female\walk",
    r"d:\NFTagachi\generators\lpc_assets\spritesheets\head\heads\human\female_elderly\walk",
    r"d:\NFTagachi\generators\lpc_assets\spritesheets\head\heads\human\female_small\walk"
]

def audit():
    errors = 0
    for folder in FOLDERS:
        if not os.path.exists(folder):
            print(f"MISSING FOLDER: {folder}")
            continue
            
        for f in os.listdir(folder):
            if not f.endswith(".png"): continue
            path = os.path.join(folder, f)
            try:
                img = Image.open(path).convert("RGBA")
                if img.size != (576, 256):
                    print(f"BAD SIZE: {path} -> {img.size}")
                    errors += 1
                
                # Check Row 2 (South)
                crop = img.crop((0, 128, 576, 192))
                pixels = [p for p in crop.getdata() if p[3] > 0]
                if len(pixels) == 0:
                    print(f"EMPTY ROW 2: {path}")
                    errors += 1
            except Exception as e:
                print(f"CORRUPT: {path} -> {e}")
                errors += 1
    
    if errors == 0:
        print("ALL ASSETS VALID.")
    else:
        print(f"FOUND {errors} ERRORS.")

if __name__ == "__main__":
    audit()
