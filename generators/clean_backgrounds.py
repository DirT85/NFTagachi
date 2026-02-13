
from PIL import Image
import os

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
    
    # Get the color of the top-left pixel to assume as background
    # Or purely specific checkerboard colors if known (white/grey)
    # Let's assume top-left is background.
    bg_color = img.getpixel((0, 0))
    print(f"  Background color detected: {bg_color}")

    new_data = []
    threshold = 10 # Tolerance
    
    for item in datas:
        # Check distance to bg_color
        dist = sum([abs(item[i] - bg_color[i]) for i in range(3)])
        # Also check for white/grey checkerboard variations if needed, but start with corner.
        
        if dist < threshold:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(path, "PNG")
    print(f"  Saved clean {filename}")

if __name__ == "__main__":
    for f in FILES:
        clean_image(f)
