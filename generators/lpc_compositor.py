import os
import json
import random
from PIL import Image

# --- CONFIG ---
BASE_PATH = r"d:\NFTagachi\generators\lpc_assets"
SPRITESHEETS_PATH = os.path.join(BASE_PATH, "spritesheets")
DEFINITIONS_PATH = os.path.join(BASE_PATH, "sheet_definitions")
OUTPUT_DIR = r"d:\NFTagachi\frontend\public\characters"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Selection of components we want to use
# format: (definition_file, type_name)
COMPONENTS = [
    "body.json",
    "eyes.json",
    "hair_bob.json",
    "torso_clothes_tunic.json",
    "legs_pants.json",
    "feet_shoes.json"
]

def load_def(filename):
    with open(os.path.join(DEFINITIONS_PATH, filename), 'r') as f:
        return json.load(f)

def get_random_variant(definition):
    return random.choice(definition["variants"])

def get_layer_path(definition, sex, variant):
    # Most have layer_1
    if "layer_1" not in definition:
        return None
    
    layer = definition["layer_1"]
    # Fallback if sex not in layer (some are female only etc)
    path_prefix = layer.get(sex) or next(iter(layer.values()))
    
    # Check if path_prefix is a string or something else
    if not isinstance(path_prefix, str):
        # Handle cases where zPos is mixed in or it's a nested dict
        return None
        
    return os.path.join(SPRITESHEETS_PATH, path_prefix, f"{variant}.png")

def composite_character(seed, filename):
    random.seed(seed)
    sex = random.choice(["male", "female"])
    
    selected_layers = []
    
    for comp_file in COMPONENTS:
        definition = load_def(comp_file)
        variant = get_random_variant(definition)
        path = get_layer_path(definition, sex, variant)
        
        if path and os.path.exists(path):
            z_pos = definition["layer_1"].get("zPos", 0)
            selected_layers.append((z_pos, path))
        else:
            print(f"Warning: Asset not found or invalid: {path}")

    # Sort by Z-Position
    selected_layers.sort(key=lambda x: x[0])
    
    # Composite
    master_canvas = None
    
    for _, path in selected_layers:
        img = Image.open(path).convert("RGBA")
        if master_canvas is None:
            master_canvas = Image.new("RGBA", img.size, (0, 0, 0, 0))
        
        master_canvas.alpha_composite(img)
    
    if master_canvas:
        save_path = os.path.join(OUTPUT_DIR, filename)
        master_canvas.save(save_path)
        print(f"Generated {save_path}")
    else:
        print("Error: No layers to composite.")

if __name__ == "__main__":
    # Generate 10 sample characters
    for i in range(10):
        composite_character(i, f"char_{i}.png")
