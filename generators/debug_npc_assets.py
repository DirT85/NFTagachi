import os
import json
from PIL import Image

# Config
INDEX_FILE = r"d:\NFTagachi\generators\lpc_index.json"
METADATA_DIR = r"d:\NFTagachi\generators\metadata"

with open(INDEX_FILE, "r") as f:
    index = json.load(f)

def debug_npc(npc_id):
    meta_path = os.path.join(METADATA_DIR, f"{npc_id}.json")
    if not os.path.exists(meta_path):
        print(f"Metadata not found for {npc_id}")
        return

    with open(meta_path, "r") as mf:
        meta = json.load(mf)
        attrs = {a["trait_type"].lower(): a["value"] for a in meta.get("attributes", [])}
        species = attrs.get("species", "human").lower()
        weapon_type = attrs.get("weapon", "unarmed").lower()

    print(f"\n--- DEBUG NPC {npc_id} ({species}, {weapon_type}) ---")
    
    # Simulate trait selection logic for debug
    # In production, we'd need to know exactly which variant was picked.
    # Since it's random, I'll just look at ALL potential matches in the index.
    
    def print_asset_info(layer, variant_type=None):
        print(f"\nLayer: {layer}")
        if layer == "body":
            variants = index["body"].get(species, {})
            for act, path in variants.items():
                if os.path.exists(path):
                    img = Image.open(path)
                    print(f"  Action {act}: {img.size[0]}x{img.size[1]} | {path}")
        else:
            candidates = index.get(layer, [])
            # Filter matches
            matches = [x for x in candidates if x.get("type", "").lower() == (variant_type or "").lower()]
            if not matches and layer == "head":
                matches = [x for x in candidates if x.get("type", "").lower() == species]
            
            for m in matches:
                name = m.get("name", "unnamed")
                print(f"  Variant: {name}")
                for act, infos in m.get("actions", {}).items():
                    for info in infos:
                        path = info["path"]
                        if os.path.exists(path):
                            img = Image.open(path)
                            print(f"    Action {act}: {img.size[0]}x{img.size[1]} | {path}")

    print_asset_info("body")
    print_asset_info("head")
    print_asset_info("weapon", weapon_type)

if __name__ == "__main__":
    debug_npc(0)
    debug_npc(483)
