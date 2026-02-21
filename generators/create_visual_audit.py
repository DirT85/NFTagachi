import os
from PIL import Image

# Config
NPC_DIR = r"d:\NFTagachi\generators\ai_base_chars"
OUTPUT_PATH = r"d:\NFTagachi\generators\visual_audit_montage.png"
THUMB_SIZE = 128

def create_montage(count=20):
    cols = 5
    rows = (count + cols - 1) // cols
    montage = Image.new("RGBA", (cols * THUMB_SIZE, rows * THUMB_SIZE), (40, 40, 40, 255))
    
    for i in range(count):
        path = os.path.join(NPC_DIR, f"npc_{i:03d}.png")
        if os.path.exists(path):
            img = Image.open(path)
            # Crop the first frame (IDLE)
            thumb = img.crop((0, 0, THUMB_SIZE, THUMB_SIZE))
            
            x = (i % cols) * THUMB_SIZE
            y = (i // cols) * THUMB_SIZE
            montage.paste(thumb, (x, y), thumb)
            
    montage.save(OUTPUT_PATH)
    print(f"Visual audit montage saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    create_montage(20)
