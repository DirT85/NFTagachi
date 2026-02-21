import os
import json
import shutil

# CONFIGURATION - CHANGE THESE BEFORE FINAL PACKAGING
SYMBOL = "TAGA"
SELLER_FEE_BASIS_POINTS = 500  # 5%
CREATOR_WALLET = "YOUR_SOLANA_WALLET_ADDRESS" # Replace with user wallet

# PATHS
SOURCE_IMAGES = r"d:\NFTagachi\frontend\public\nft_heroes" # Individual idle frames
SOURCE_METADATA = r"d:\NFTagachi\generators\metadata"
OUTPUT_DIR = r"d:\NFTagachi\launch_package"

os.makedirs(os.path.join(OUTPUT_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "metadata"), exist_ok=True)

print(f"Packaging 1000 NPCs for launch...")

for i in range(1000):
    img_name = f"{i}.png"
    json_name = f"{i}.json"
    
    src_img = os.path.join(SOURCE_IMAGES, img_name)
    src_json = os.path.join(SOURCE_METADATA, json_name)
    
    if not os.path.exists(src_img) or not os.path.exists(src_json):
        if i % 100 == 0: print(f"Skipping {i} (Files missing yet?)")
        continue

    # 1. Copy Image
    shutil.copy(src_img, os.path.join(OUTPUT_DIR, "images", img_name))
    
    # 2. Refactor Metadata
    with open(src_json, "r") as f:
        data = json.load(f)
    
    # Inject Solana Fields
    new_meta = {
        "name": data.get("name", f"NPC #{i}"),
        "symbol": SYMBOL,
        "description": data.get("description", "A unique LPC NPC hero."),
        "seller_fee_basis_points": SELLER_FEE_BASIS_POINTS,
        "image": img_name,
        "attributes": data.get("attributes", []),
        "properties": {
            "files": [
                {
                    "uri": img_name,
                    "type": "image/png"
                }
            ],
            "category": "image",
            "creators": [
                {
                    "address": CREATOR_WALLET,
                    "share": 100
                }
            ]
        },
        # Keep game-specific data for on-chain utility or off-chain indexer
        "spriteSheet": data.get("spriteSheet")
    }
    
    # Save Refactored Metadata
    with open(os.path.join(OUTPUT_DIR, "metadata", json_name), "w") as f:
        json.dump(new_meta, f, indent=2)

    if i % 100 == 0: print(f"Packaged NPC {i}...")

print(f"\nSUCCESS: Launch package created at {OUTPUT_DIR}")
print(f"Folders: images/ (PNGs), metadata/ (JSONs)")
print(f"TOTAL: {len(os.listdir(os.path.join(OUTPUT_DIR, 'metadata')))} assets standardized.")
