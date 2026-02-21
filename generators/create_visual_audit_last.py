import os
from PIL import Image

# Config
NPC_DIR = r"d:\NFTagachi\generators\ai_base_chars"
OUTPUT_PATH = r"d:\NFTagachi\generators\visual_audit_LASTBATCH.png"
THUMB_SIZE = 128

def create_montage():
    # Show NPCs 880 to 900
    ids = range(880, 905)
    cols = 5
    rows = (len(ids) + cols - 1) // cols
    montage = Image.new("RGBA", (cols * THUMB_SIZE, rows * THUMB_SIZE), (40, 40, 40, 255))
    
    for idx, npc_id in enumerate(ids):
        path = os.path.join(NPC_DIR, f"npc_{npc_id:03d}.png")
        if os.path.exists(path):
            img = Image.open(path)
            thumb = img.crop((0, 0, THUMB_SIZE, THUMB_SIZE))
            x = (idx % cols) * THUMB_SIZE
            y = (idx // cols) * THUMB_SIZE
            montage.paste(thumb, (x, y), thumb)
            
    montage.save(OUTPUT_PATH)
    print(f"Visual audit montage saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    create_montage()
