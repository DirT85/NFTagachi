import os
import json
import random
from PIL import Image

# --- CONFIG ---
BASE_PATH = r"d:\NFTagachi\generators\lpc_assets"
SPRITESHEETS_PATH = os.path.join(BASE_PATH, "spritesheets")
DEFINITIONS_PATH = os.path.join(BASE_PATH, "sheet_definitions")
OUTPUT_DIR = r"d:\NFTagachi\frontend\public\collection_v8"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Frames Configuration
# Row in LPC (0-indexed) -> Frames to extract
LPC_MAPPING = {
    "IDLE":   {"row": 10, "frames": [0, 0, 0, 0]}, # Row 10 is Walk South
    "WALK":   {"row": 10, "frames": [1, 2, 3, 4]},
    "EAT":    {"row": 2,  "frames": [0, 1, 2, 3]}, # Row 2 is Spellcast South
    "ATTACK": {"row": 14, "frames": [0, 1, 2, 3]}  # Row 14 is Slash South
}

# Categories of components for variety
BODIES = ["body.json", "body_skeleton.json", "body_zombie.json"]
HEADS = [
    "heads_human_male.json", "heads_orc_male.json", "heads_alien.json", 
    "heads_goblin.json", "heads_lizard_male.json", "heads_minotaur.json",
    "heads_wolf_male.json", "heads_vampire.json", "heads_troll.json"
]
EXTRAS = [
    "wings_bat.json", "wings_dragonfly.json", "wings_feathered.json", "wings_lizard.json",
    "tail_dragon.json", "tail_cat.json", "tail_wolf.json", "tail_lizard.json",
    "hat_accessory_horns_short.json", "hat_accessory_horns_upward.json"
]
CLOTHES = [
    "torso_armour_plate.json", "torso_armour_leather.json", "torso_clothes_tunic.json",
    "legs_pants.json", "legs_fur.json", "belt_leather.json"
]

def load_def(filename):
    path = os.path.join(DEFINITIONS_PATH, filename)
    if not os.path.exists(path): return None
    with open(path, 'r') as f:
        return json.load(f)

def get_layer_path(definition, sex, variant):
    if "layer_1" not in definition: return None
    layer = definition["layer_1"]
    # LPC usually has 'male', 'female', or generic entries
    path_prefix = layer.get(sex) or layer.get("male") or layer.get("female") or next(iter(layer.values()))
    if not isinstance(path_prefix, str): return None
    return os.path.join(SPRITESHEETS_PATH, path_prefix, f"{variant}.png")

def generate_monster(seed, id):
    random.seed(seed)
    filename = f"sheet_{id}.png"
    
    # Decisions
    sex = random.choice(["male", "female"])
    selected_body = random.choice(BODIES)
    selected_head = random.choice(HEADS)
    
    components = [selected_body, selected_head]
    
    # Add some random extras
    if random.random() > 0.5: components.append(random.choice(EXTRAS))
    if random.random() > 0.7: components.append(random.choice(EXTRAS))
    
    # Add random clothes
    if random.random() > 0.4: components.append(random.choice(CLOTHES))
    if random.random() > 0.6: components.append(random.choice(CLOTHES))

    layers = []
    for comp_file in components:
        definition = load_def(comp_file)
        if not definition: continue
        variant = random.choice(definition["variants"])
        path = get_layer_path(definition, sex, variant)
        
        if path and os.path.exists(path):
            z_pos = definition["layer_1"].get("zPos", 0)
            layers.append((z_pos, path))

    # Sort by Z-Position
    layers.sort(key=lambda x: x[0])

    if not layers:
        print(f"Error: No layers for {id}")
        return

    # Create Master 4x4 Grid (256x256)
    master_canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))

    # Composite each frame
    order = ["IDLE", "WALK", "EAT", "ATTACK"]
    for row_idx, anim_name in enumerate(order):
        mapping = LPC_MAPPING[anim_name]
        lpc_row = mapping["row"]
        frames = mapping["frames"]
        
        for col_idx, lpc_frame in enumerate(frames):
            frame_canvas = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
            
            for _, path in layers:
                full_sheet = Image.open(path).convert("RGBA")
                # LPC sheets are 64x64 per frame
                left = lpc_frame * 64
                top = lpc_row * 64
                right = left + 64
                bottom = top + 64
                
                # Check if dimensions allow
                if right <= full_sheet.width and bottom <= full_sheet.height:
                    frame_part = full_sheet.crop((left, top, right, bottom))
                    frame_canvas.alpha_composite(frame_part)
            
            # Place in master canvas
            master_canvas.paste(frame_canvas, (col_idx * 64, row_idx * 64))

    save_path = os.path.join(OUTPUT_DIR, filename)
    master_canvas.save(save_path)
    if id % 50 == 0: print(f"Generated {id}/300: {filename}")

if __name__ == "__main__":
    print(f"Starting LPC Composite Generation for {OUTPUT_DIR}...")
    for i in range(300):
        # Use i as seed for reproducibility
        generate_monster(i, i)
    print("Generation Complete!")
