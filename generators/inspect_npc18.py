import os
from PIL import Image

PATH = r"d:\NFTagachi\generators\ai_base_chars\npc_018.png"

def inspect():
    if not os.path.exists(PATH):
        print("NPC 18 image not found.")
        return

    img = Image.open(PATH).convert("RGBA")
    w, h = img.size
    print(f"Dimensions: {w}x{h}")
    
    # IDLE Frame (first 128x128)
    idle = img.crop((0, 0, 128, 128))
    
    # Check Head Area (approx centered at 64, 32)
    # Head roughly 32x32 box around 64,32
    head_box = (48, 16, 80, 48)
    head_crop = idle.crop(head_box)
    
    # Check alpha
    pixels = list(head_crop.getdata())
    non_transparent = [p for p in pixels if p[3] > 0]
    print(f"Head Area Pixels: {len(non_transparent)} / {len(pixels)}")
    
    if len(non_transparent) == 0:
        print("ALERT: Head area is empty!")
    else:
        # Check color
        r_avg = sum([p[0] for p in non_transparent]) / len(non_transparent)
        g_avg = sum([p[1] for p in non_transparent]) / len(non_transparent)
        b_avg = sum([p[2] for p in non_transparent]) / len(non_transparent)
        print(f"Avg Head Color: R={r_avg:.1f}, G={g_avg:.1f}, B={b_avg:.1f}")
        
    # Check Body Area (approx 64, 64)
    body_box = (48, 48, 80, 96)
    body_crop = idle.crop(body_box)
    body_pixels = [p for p in body_crop.getdata() if p[3] > 0]
    print(f"Body Area Pixels: {len(body_pixels)}")
    if len(body_pixels) == 0: print("ALERT: Body area is empty!")

if __name__ == "__main__":
    inspect()
