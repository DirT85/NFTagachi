import os
from PIL import Image

# We will use a simple grid-based or island-based extraction.
# Since these were likely generated as grids, let's try to detect non-empty regions.

INPUT_DIR = r"C:\Users\dt\.gemini\antigravity\brain\fbbd1306-26bb-45ca-b80f-647dab2a4be7"
OUTPUT_DIR = r"d:\NFTagachi\frontend\public\extracted"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

TARGET_FILES = [
    "monster_sprite_sheet_1770521895831.png",
    "pixel_monster_spritesheet_1770520014214.png",
    "pixel_monsters_sheet_1770521925892.png",
    "media__1770522443101.png", 
    "media__1770522228075.png",
    "media__1770522026896.png",
    "media__1770521844640.png",
    "media__1770521838618.png"
]

def extract_sprites(filename):
    path = os.path.join(INPUT_DIR, filename)
    if not os.path.exists(path):
        print(f"Skipping {filename}, not found.")
        return

    print(f"Processing {filename}...")
    try:
        img = Image.open(path)
        width, height = img.size
        # Assuming these are roughly grid-based 64x64 or similar.
        # Let's try to scan for bounding boxes of content.
        
        # Convert to RGBA
        img = img.convert("RGBA")
        
        # Simple clustering: Divide into tiles and check if empty
        tile_w, tile_h = 64, 64 # Guessing size
        
        count = 0
        for y in range(0, height, tile_h):
            for x in range(0, width, tile_w):
                # Crop tile
                box = (x, y, x+tile_w, y+tile_h)
                tile = img.crop(box)
                
                # Check if empty (alpha 0)
                extrema = tile.getextrema()
                if extrema[3][1] == 0: # Alpha band max is 0 (fully transparent)
                    continue
                
                # Further refine crop to bounding box
                bbox = tile.getbbox()
                if bbox:
                    sprite = tile.crop(bbox)
                    # Resize to intended size (e.g. 64x64) to unify? 
                    # Or keep as is. Let's keep distinct.
                    
                    # Save
                    base_name = os.path.splitext(filename)[0]
                    save_path = os.path.join(OUTPUT_DIR, f"{base_name}_{count}.png")
                    sprite.save(save_path)
                    print(f"  Saved {save_path}")
                    count += 1
                    
    except Exception as e:
        print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    for f in TARGET_FILES:
        extract_sprites(f)
