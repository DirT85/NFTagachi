
from PIL import Image
import os
import math

# Paths
INPUT_DIR = r"d:\NFTagachi\frontend\public"
FILES = ["pet_water.png", "pet_fire.png", "pet_grass.png"]

def clean_image(filename):
    path = os.path.join(INPUT_DIR, filename)
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    print(f"Processing {filename}...")
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    
    # Assume white background for these specific "high quality" assets if they look like official art
    # Or detect corners.
    corners = [
        img.getpixel((0, 0)),
        img.getpixel((img.width-1, 0)),
        img.getpixel((0, img.height-1)),
        img.getpixel((img.width-1, img.height-1))
    ]
    
    # Simple majority vote or just take 0,0
    bg_color = corners[0] 
    print(f"  Detected BG: {bg_color}")

    new_data = []
    # Higher tolerance for compression artifacts
    threshold = 30 
    
    for item in datas:
        # Euclid distance
        dist = math.sqrt(
            (item[0] - bg_color[0])**2 + 
            (item[1] - bg_color[1])**2 + 
            (item[2] - bg_color[2])**2
        )
        
        # Also treat pure white (255,255,255) as transparent if BG is close to white
        is_white = item[0] > 250 and item[1] > 250 and item[2] > 250
        
        if dist < threshold or is_white:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    # Save as NEW file to bust cache
    new_name = filename.replace(".png", "_clean.png")
    save_path = os.path.join(INPUT_DIR, new_name)
    img.save(save_path, "PNG")
    print(f"  Saved {save_path}")

if __name__ == "__main__":
    for f in FILES:
        clean_image(f)
