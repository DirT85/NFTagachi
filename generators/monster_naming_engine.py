import json
import os

BASE_DIR = r"d:\NFTagachi\generators"
RAW_DIR = os.path.join(BASE_DIR, "ai_base_chars")

# Style mapping based on grid and blob index (rough row detection)
# Each grid is ~16 characters wide
def get_style_and_vibe(filename):
    # Format: good1_000.png
    parts = filename.split("_")
    grid = parts[0] # good1, good2
    try:
        index = int(parts[1].replace(".png", ""))
    except:
        index = 0
    row = index // 16
    
    # Grid 1: Nature, Magic, Dragons
    if grid == "good1":
        if row <= 1: return "Mystic", "Shroom"
        if row <= 3: return "Draconic", "Dragon"
        if row <= 5: return "Spectral", "Ghost"
        if row <= 7: return "Feral", "Goblin"
        return "Clockwork", "Golem"
    
    # Grid 2: Undead, Demonic, Insects
    if grid == "good2":
        if row <= 1: return "Cursed", "Skeleton"
        if row <= 3: return "Infernal", "Demon"
        if row <= 5: return "Venomous", "Insect"
        if row <= 7: return "Heroic", "Knight"
        return "Corrosive", "Mutant"

    # Default for others
    return "Primitive", "Beast"

prefixes = ["Ancient", "Crystal", "Void", "Shadow", "Gilded", "Obsidian", "Eterna", "Lunar", "Solar", "Abyssal"]
suffixes = ["Stalker", "Sentinel", "Reaper", "Guardian", "Wanderer", "Lord", "Herald", "Slayer", "Ancient", "Wraith"]

def generate_manifest():
    files = [f for f in os.listdir(RAW_DIR) if f.endswith(".png")]
    files.sort()
    
    manifest = {}
    for i, f in enumerate(files):
        prefix_vibe, base_vibe = get_style_and_vibe(f)
        
        # Combine vibe with random-ish but unique choice
        name = f"{prefix_vibe} {base_vibe} {suffixes[i % len(suffixes)]}"
        
        manifest[f] = {
            "name": name,
            "type": base_vibe.upper(),
            "prefix": prefix_vibe,
            "asset": f
        }
        
    with open(os.path.join(BASE_DIR, "monster_names_manifest.json"), "w") as out:
        json.dump(manifest, out, indent=2)
    
    print(f"Generated names for {len(manifest)} unique monsters.")

if __name__ == "__main__":
    generate_manifest()
