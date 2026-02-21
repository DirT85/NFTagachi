import os
import json
import random
from PIL import Image

# Configuration
BASE_PATH = r"d:\NFTagachi\generators\lpc_assets\spritesheets"
INDEX_FILE = r"d:\NFTagachi\generators\lpc_index.json"
OUTPUT_DIR = r"d:\NFTagachi\generators\ai_base_chars"
HERO_DIR = r"d:\NFTagachi\frontend\public\nft_heroes"
METADATA_DIR = r"d:\NFTagachi\generators\metadata"
PORKCHOP_PATH = r"d:\NFTagachi\frontend\generators\lpc_assets\items\porkchop.png"
BARBELL_PATH = r"d:\NFTagachi\frontend\generators\lpc_assets\items\barbell.png"
TARGET_SIZE = 128
FRAME_COUNT_MAX = 13 

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(HERO_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

with open(INDEX_FILE, "r") as f:
    index = json.load(f)

# --- SPECIES CONFIGURATION ---
SPECIES_CONFIG = {
    "human": {"weight": 0.85, "head_type": "human", "body_keys": ["male", "female", "muscular", "pregnant", "teen", "child"]},
    "skeleton": {"weight": 0.08, "head_type": "skeleton", "body_keys": ["skeleton"]},
    "zombie": {"weight": 0.04, "head_type": "zombie", "body_keys": ["zombie"]},
    "orc": {"weight": 0.03, "head_type": "orc", "body_keys": ["male", "female"]}
}

def composite_frame(layer_stack, action_name, col_idx):
    frame_full = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
    CHAR_OFFSET = 32
    
    ROW_MAP_21 = {"spellcast": 2, "thrust": 6, "walk": 10, "slash": 14, "shoot": 18, "hurt": 20}
    target_lpc_row = ROW_MAP_21.get(action_name, 10)

    for entry in layer_stack:
        lp = entry["path"]
        if not lp or not os.path.exists(lp): continue
        try:
            img = Image.open(lp).convert("RGBA")
            w, h = img.size
            
            f_size = 64
            if w % 64 == 0 and h % 64 == 0:
                cols_64 = w // 64
                rows_64 = h // 64
                if rows_64 in [4, 21, 2, 1]: f_size = 64
                elif w // 128 in [6, 9, 13]: f_size = 128
                else: f_size = 64
            elif w % 128 == 0: f_size = 128
            elif w % 192 == 0: f_size = 192
            
            asset_rows = h // f_size
            asset_cols = w // f_size
            
            if asset_rows >= 21: row_in_asset = target_lpc_row
            elif asset_rows >= 4: row_in_asset = 2
            else: row_in_asset = 0

            c_in_asset = col_idx % asset_cols

            def get_frame(r, c):
                if r >= asset_rows or c >= asset_cols: return None, (0,0)
                sx, sy = c * f_size, r * f_size
                if f_size == 64: return img.crop((sx, sy, sx+64, sy+64)), (CHAR_OFFSET, CHAR_OFFSET)
                elif f_size == 128: return img.crop((sx, sy, sx+128, sy+128)), (0, 0)
                elif f_size == 192: return img.crop((sx+32, sy+32, sx+32+128, sy+32+128)), (0, 0)
                return None, (0, 0)

            frame, pos = get_frame(row_in_asset, c_in_asset)
            if frame is None or not frame.getbbox():
                found = False
                for search_row in [2, 0, 1, 3]:
                    if search_row < asset_rows:
                        temp_f, temp_p = get_frame(search_row, 0)
                        if temp_f and temp_f.getbbox():
                            frame, pos = temp_f, temp_p; found = True; break
                if not found:
                    for r in range(min(asset_rows, 8)):
                        for c in range(min(asset_cols, 8)):
                            temp_f, temp_p = get_frame(r, c)
                            if temp_f and temp_f.getbbox():
                                frame, pos = temp_f, temp_p; found = True; break
                        if found: break

            if frame and frame.getbbox():
                frame_full.paste(frame, pos, frame)
        except: continue
    return frame_full

def build_npc(npc_id):
    # RETRY LOOP for Integrity Check
    MAX_RETRIES = 5
    for attempt in range(MAX_RETRIES):
        
        # 1. Trait Selection (Moved inside retry loop)
        species_pool = list(SPECIES_CONFIG.keys())
        species_weights = [SPECIES_CONFIG[s]["weight"] for s in species_pool]
        chosen_species = random.choices(species_pool, weights=species_weights, k=1)[0]
        
        body_key = random.choice(SPECIES_CONFIG[chosen_species]["body_keys"])
        age = "child" if "child" in body_key else "teen" if "teen" in body_key else "adult"
        gender = "female" if "female" in body_key else "male" if ("male" in body_key or "muscular" in body_key) else "any"
        
        preferred_hair_color = random.choice(["black", "blonde", "brown", "red", "gray", "white", "ash", "chestnut"])
        
        # ... (get_layer_variant definition needs to be accessable or redefined)
        # It depends on 'index' which is global. 'age', 'gender', 'chosen_species' change per loop.
        # So 'get_layer_variant' needs to capture new vars.
        
        def get_layer_variant_dynamic(layer_name, type_filter=None):
             # ... copy logic ...
             raw_pool = index.get(layer_name, [])
             for filter_age in [age, "adult", "any"]:
                candidates = [x for x in raw_pool if x.get("age") == filter_age]
                if npc_id == 18 and layer_name == "head":
                     with open(r"d:\NFTagachi\generators\debug_trace.txt", "a") as df:
                         df.write(f"DEBUG 18 Head: Age {filter_age}, Candidates: {len(candidates)}\n")
                if not candidates and filter_age == "any": candidates = raw_pool
                if gender != "any":
                    filtered_gender = [x for x in candidates if x.get("gender") in [gender, "any"]]
                    if filtered_gender: candidates = filtered_gender
                if not type_filter:
                    target_type = SPECIES_CONFIG[chosen_species]["head_type"]
                    matches = [x for x in candidates if x.get("type", "").lower() == target_type.lower()]
                    if chosen_species == "human":
                        forbidden = ["orc", "goblin", "green", "zombie", "skeleton", "lizard", "alien", "troll"]
                        matches = [x for x in matches if not any(p in x["id"].lower() for p in forbidden)]
                    if npc_id == 18 and layer_name == "head":
                         with open(r"d:\NFTagachi\generators\debug_trace.txt", "a") as df:
                             df.write(f"DEBUG 18 Head Matches after Type/Cleanse ({target_type}): {len(matches)}\n")
                    if matches: return random.choice(matches)
                else:
                    matches = [x for x in candidates if x.get("type", "").lower() == type_filter.lower()]
                    if matches: return random.choice(matches)
                if candidates: return random.choice(candidates)
             if npc_id == 18: print(f"DEBUG NPC 18: Head selection for age={age}, gender={gender} returned NONE. Candidates count: {len(raw_pool)}")
             return None

        traits = {
            "species": chosen_species,
            "body_type": body_key,
            "hair": get_layer_variant_dynamic("hair") if chosen_species == "human" else None,
            "head": get_layer_variant_dynamic("head"),
            "torso": get_layer_variant_dynamic("torso"),
            "legs": get_layer_variant_dynamic("legs"),
            "feet": get_layer_variant_dynamic("feet"),
            "weapon": get_layer_variant_dynamic("weapon"),
            "eyes": get_layer_variant_dynamic("eyes")
        }
        if npc_id == 18:
            with open(r"d:\NFTagachi\generators\debug_trace.txt", "a") as df:
                df.write(f"DEBUG NPC 18: Head Selected: {traits['head'].get('id') if traits['head'] else 'None'}\n")
        
        sheet = Image.new("RGBA", (TARGET_SIZE * FRAME_COUNT_MAX, TARGET_SIZE * 5), (0, 0, 0, 0))
        action_map = {
            "IDLE": {"action": "walk", "frames": 1, "row": 0, "item": None},
            "WALK": {"action": "walk", "frames": 9, "row": 1, "item": None},
            "FEED": {"action": "thrust", "frames": 8, "row": 2, "item": PORKCHOP_PATH},
            "TRAIN": {"action": "slash", "frames": 6, "row": 3, "item": BARBELL_PATH},
            "ATTACK": {"action": "spellcast", "frames": 7, "row": 4, "item": None}
        }
        
        for state, config in action_map.items():
            action_name = config["action"]
            behind_paths, front_paths = [], []
            
            if body_key in ["skeleton", "zombie"]:
                body_path = os.path.join(BASE_PATH, "body", "bodies", body_key, action_name, f"{body_key}.png")
                if not os.path.exists(body_path): body_path = os.path.join(BASE_PATH, "body", "bodies", body_key, "walk", f"{body_key}.png")
            else:
                body_path = index["body"].get(body_key, {}).get(action_name) or index["body"].get(body_key, {}).get("walk")
            
            for layer_key in ["feet", "legs", "torso", "weapon", "head", "eyes", "hair"]:
                if layer_key == "weapon" and config["item"]: continue
                variant = traits.get(layer_key)
                if not variant: continue
                
                asset_act = action_name
                if layer_key == "weapon":
                    if action_name == "thrust": asset_act = "attack_thrust"
                    elif action_name == "slash": asset_act = "attack_slash"
                    elif action_name == "spellcast": asset_act = "walk"
                
                infos = variant["actions"].get(asset_act) or variant["actions"].get("walk") or variant["actions"].get("idle")
                if infos:
                    if chosen_species == "human":
                        forbidden = ["orc", "goblin", "green", "zombie", "skeleton", "lizard", "alien", "troll"]
                        infos = [i for i in infos if not any(p in i["path"].lower() for p in forbidden)]
                    if not infos: continue
                    picked_info = None
                    if layer_key == "hair":
                        for i in infos:
                            if preferred_hair_color in i["path"].lower(): picked_info = i; break
                    if not picked_info: picked_info = infos[0]
                    entry = {"path": picked_info["path"], "is_behind": picked_info["is_behind"]}
                    if picked_info["is_behind"]: behind_paths.append(entry)
                    else: front_paths.append(entry)

            final_stack = behind_paths + [{"path": body_path, "is_behind": False}] + front_paths
            if npc_id == 18 and action_name == "walk":
                 with open(r"d:\NFTagachi\generators\debug_trace.txt", "a") as df:
                     df.write(f"DEBUG NPC 18 Walk Stack: {[x['path'] for x in final_stack]}\n")
            for f in range(config["frames"]):
                frame_img = composite_frame(final_stack, action_name, f)
                if config["item"] and os.path.exists(config["item"]):
                    item_img = Image.open(config["item"]).convert("RGBA")
                    frame_img.paste(item_img, (16, 44), item_img)
                sheet.paste(frame_img, (f * TARGET_SIZE, config["row"] * TARGET_SIZE))

        # INTEGRITY CHECK
        idle_chk = sheet.crop((0, 0, TARGET_SIZE, TARGET_SIZE))
        head_chk = idle_chk.crop((48, 16, 80, 48))
        pixels = [p for p in head_chk.getdata() if p[3] > 0]
        if len(pixels) > 50:
            break # Valid head
        print(f"NPC {npc_id}: Headless detected (Attempt {attempt+1}). Regenerating...")
        
    sheet_name = f"npc_{npc_id:03d}"
    sheet.save(os.path.join(OUTPUT_DIR, f"{sheet_name}.png"))
    idle_frame = sheet.crop((0, 0, TARGET_SIZE, TARGET_SIZE))
    idle_frame.save(os.path.join(HERO_DIR, f"{npc_id}.png"))

    metadata = {
        "name": f"NPC #{npc_id}",
        "description": f"A unique {chosen_species} {body_key}.",
        "image": f"/nft_heroes/{npc_id}.png",
        "attributes": [
            {"trait_type": "Species", "value": chosen_species.capitalize()},
            {"trait_type": "Body Type", "value": body_key.capitalize()}
        ],
        "spriteSheet": {
            "src": f"/ai_base_chars/npc_{npc_id:03d}.png",
            "frameSize": 128, "framesPerRow": FRAME_COUNT_MAX, 
            "rows": {"IDLE": {"row": 0, "frames": 1}, "WALK": {"row": 1, "frames": 9}, "FEED": {"row": 2, "frames": 8}, "TRAIN": {"row": 3, "frames": 6}, "ATTACK": {"row": 4, "frames": 7}}
        }
    }
    with open(os.path.join(METADATA_DIR, f"{npc_id}.json"), "w") as f:
        json.dump(metadata, f, indent=2)

if __name__ == "__main__":
    for i in range(1000):
        if i % 100 == 0: print(f"Regenerating NPC {i}...")
        try: build_npc(i)
        except Exception as e: print(f"Error building NPC {i}: {e}")
