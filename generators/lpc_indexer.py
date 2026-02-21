import os
import json
import collections

BASE_PATH = r"d:\NFTagachi\generators\lpc_assets\spritesheets"
OUTPUT_FILE = r"d:\NFTagachi\generators\lpc_index.json"

ACTIONS = ["walk", "thrust", "slash", "idle", "attack_thrust", "attack_slash", "attack_walk", "spellcast", "shoot", "hurt"]
# Keywords that are NOT species names but structural folders
SKIP_KEYWORDS = ["heads", "bodies", "clothes", "bodies_human", "bodies_monsters", "adult", "teen", "child", "male", "female", "any", "behind", "back", "faces", "ears", "nose", "wrinkles", "fins", "horns", "mask", "jewelry", "glasses"]

def build_index():
    index = {
        "body": {},
        "hair": [],
        "weapon": [],
        "torso": [],
        "legs": [],
        "feet": [],
        "head": [],
        "eyes": []
    }

    def discover_items(folder, category):
        raw_items = []
        for root, dirs, files in os.walk(folder):
            for file in files:
                if not file.endswith(".png") or file.startswith("."): continue
                path = os.path.join(root, file)
                
                # Check for "heads" only if category is head
                if category == "head" and "\\heads\\" not in path.lower():
                    continue

                action_found = None
                fname = file.lower().replace(".png", "")
                if fname in ACTIONS: action_found = fname
                else:
                    pdir = os.path.basename(root).lower()
                    if pdir in ACTIONS: action_found = pdir
                
                if action_found:
                    age = "adult"
                    if "child" in path.lower(): age = "child"
                    elif "teen" in path.lower(): age = "teen"
                    
                    path_parts = path.split(os.sep)
                    val_type = "generic"
                    try:
                        cat_idx = -1
                        for i, p in enumerate(path_parts):
                            if p.lower() == category.lower():
                                cat_idx = i
                                break
                        
                        if cat_idx != -1:
                            # Search forward from cat_idx for first part NOT in SKIP_KEYWORDS
                            for j in range(cat_idx + 1, len(path_parts)):
                                part = path_parts[j].lower()
                                if part not in SKIP_KEYWORDS and part not in ACTIONS and not part.endswith(".png"):
                                    val_type = part # Species like 'zombie', 'orc', etc.
                                    break
                    except:
                        pass

                    val_gender = "any"
                    if "female" in path.lower(): val_gender = "female"
                    elif "male" in path.lower(): val_gender = "male"

                    is_behind = "behind" in path.lower() or "back" in path.lower()

                    raw_items.append({
                        "path": path,
                        "action": action_found,
                        "age": age,
                        "type": val_type.lower(),
                        "gender": val_gender,
                        "is_behind": is_behind,
                        "filename": file
                    })

        grouped = {}
        for item in raw_items:
            path_parts = item["path"].split(os.sep)
            action_idx = -1
            for i, p in enumerate(path_parts):
                if p.lower() in ACTIONS:
                    action_idx = i
                    break
            
            if action_idx == -1: continue
            
            # Identity is the folder path up to the action folder
            identity = os.sep.join(path_parts[:action_idx])
            
            if identity not in grouped:
                grouped[identity] = {
                    "id": identity, 
                    "age": item["age"], 
                    "type": item["type"],
                    "gender": item["gender"],
                    "actions": collections.defaultdict(list)
                }
            
            grouped[identity]["actions"][item["action"]].append({
                "path": item["path"],
                "is_behind": item["is_behind"]
            })
        return list(grouped.values())

    # 1. Body
    body_dir = os.path.join(BASE_PATH, "body", "bodies")
    if os.path.exists(body_dir):
        # Species folders are standard child/male/female/skeleton/zombie etc.
        for species in os.listdir(body_dir):
            s_path = os.path.join(body_dir, species)
            if not os.path.isdir(s_path): continue
            
            index["body"][species.lower()] = {}
            # Recursively find walk.png, slash.png etc inside
            for root, dirs, files in os.walk(s_path):
                for file in files:
                    if not file.endswith(".png"): continue
                    fname = file.lower().replace(".png", "")
                    if fname in ACTIONS:
                        index["body"][species.lower()][fname] = os.path.join(root, file)

    # 2. General Layers
    layers = ["hair", "torso", "legs", "feet", "eyes", "head", "weapon"]
    for layer in layers:
        layer_dir = os.path.join(BASE_PATH, layer)
        if os.path.exists(layer_dir):
            index[layer] = discover_items(layer_dir, layer)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(index, f, indent=2)
    
    print(f"Indexing complete. Body species: {list(index['body'].keys())}")

if __name__ == "__main__":
    build_index()
