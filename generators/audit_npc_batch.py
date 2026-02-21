import os
import json
from PIL import Image

# Audit Settings
NPC_DIR = r"d:\NFTagachi\generators\ai_base_chars"
TARGET_SIZE = 128
FRAME_COUNT_MAX = 13
REPORT_PATH = r"d:\NFTagachi\generators\audit_report.json"

def audit_npc(npc_id):
    path = os.path.join(NPC_DIR, f"npc_{npc_id:03d}.png")
    if not os.path.exists(path):
        return {"id": npc_id, "status": "MISSING_FILE"}
    
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    
    errors = []
    
    # 1. Check Dimensions
    if w != TARGET_SIZE * FRAME_COUNT_MAX or h != TARGET_SIZE * 5:
        errors.append(f"Bad Dimensions: {w}x{h}")

    # 2. Adaptive Head Check
    for row in range(5):
        # Sample first frame of each row
        sx, sy = 0, row * TARGET_SIZE
        frame = img.crop((sx, sy, sx + TARGET_SIZE, sy + TARGET_SIZE))
        
        bbox = frame.getbbox()
        if not bbox:
            if row < 2: # Idle and Walk must NOT be empty
                errors.append(f"Row {row} is empty")
            continue

        # Find the character's vertical span
        char_h = bbox[3] - bbox[1]
        
        # Adaptive Head Region: Top 40% of the character's bounding box
        head_y_start = bbox[1]
        head_y_end = bbox[1] + int(char_h * 0.45) # Increased to catch lower-set heads
        
        head_area = frame.crop((bbox[0], head_y_start, bbox[2], head_y_end))
        if not head_area.getbbox():
            errors.append(f"Row {row} is headless (Adaptive)")

    # 3. Detect "Cut in Half" / Misalignment
    # Samples Row 1 (Walk) - should be centered approx
    walk_frame = img.crop((0, TARGET_SIZE, TARGET_SIZE, TARGET_SIZE * 2))
    bbox = walk_frame.getbbox()
    if bbox:
        # Check if centered.
        # If the character spans more than 96px, it's likely oversized and touching edges is okay.
        char_w = bbox[2] - bbox[0]
        if char_w < 120: 
            if bbox[0] < 2 or bbox[2] > 126:
                 errors.append("Misaligned/Clipped (X-Axis)")
        if char_h < 120:
            if bbox[1] < 2 or bbox[3] > 126:
                 errors.append("Misaligned/Clipped (Y-Axis)")

    if errors:
        return {"id": npc_id, "errors": errors}
    return None

if __name__ == "__main__":
    print("Starting SMART Audit of 1000 NPCs...")
    broken = []
    for i in range(1000):
        res = audit_npc(i)
        if res:
            broken.append(res)
        if i % 100 == 0: print(f"Audited {i}...")
    
    with open(REPORT_PATH, "w") as f:
        json.dump(broken, f, indent=2)
    
    print(f"\nAUDIT COMPLETE. Found {len(broken)} potential issues.")
    print(f"Report saved to {REPORT_PATH}")
