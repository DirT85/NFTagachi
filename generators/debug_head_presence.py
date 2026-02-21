import os
from PIL import Image

NPC_DIR = r"d:\NFTagachi\generators\ai_base_chars"
OUTPUT_DIR = r"d:\NFTagachi\generators\debug_frames"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def inspect_frame(npc_id, row, col):
    path = os.path.join(NPC_DIR, f"npc_{npc_id:03d}.png")
    if not os.path.exists(path): return
    
    img = Image.open(path)
    ts = 128
    frame = img.crop((col * ts, row * ts, (col+1) * ts, (row+1) * ts))
    
    # Save frame
    frame.save(os.path.join(OUTPUT_DIR, f"npc_{npc_id}_r{row}_c{col}.png"))
    
    # Check bbox
    print(f"NPC {npc_id} Row {row} BBox: {frame.getbbox()}")
    
    # Check head area (my audit check)
    head_area = frame.crop((48, 30, 80, 64)) # Widened for teen
    print(f"  Head Area BBox: {head_area.getbbox()}")
    head_area.save(os.path.join(OUTPUT_DIR, f"npc_{npc_id}_head_r{row}.png"))

if __name__ == "__main__":
    inspect_frame(0, 2, 0) # Reported headless Row 2
    inspect_frame(8, 0, 0) # Reported headless Row 0
