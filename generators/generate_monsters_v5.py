import random
import os

# --- 64x64 MASTER TEMPLATE (Compressed for script length) ---
# We will define a "Kaiju" shape using coordinate ranges to simulate a drawn sprite.
# This approach ensures the "Base" looks professional, then we recolor it.

def get_empty_grid(size=64):
    return [[None for _ in range(size)] for _ in range(size)]

def draw_master_kaiju(grid):
    # This function manually "draws" a high-res pixel monster
    # Codes: 1=Primary, 2=Shadow, 3=Highlight, 4=EyeWhite, 5=Pupil, 6=Claws/Horns, 7=Belly
    
    # helper
    def rect(x, y, w, h, c):
        for dy in range(h):
            for dx in range(w):
                if 0 <= y+dy < 64 and 0 <= x+dx < 64:
                    grid[y+dy][x+dx] = c
    
    # 1. TAIL (Behind)
    rect(10, 40, 15, 8, 1)
    rect(8, 38, 4, 4, 6) # Spine
    
    # 2. BODY (Heavy, Round)
    for y in range(20, 56):
        for x in range(16, 48):
            # Rounded rect algo
            if (x-32)**2 + (y-38)**2 < 340:
                grid[y][x] = 1 # Primary
                
                # Shadow mapping
                if x < 24 or y > 48:
                    grid[y][x] = 2
    
    # BELLY (Plated)
    for y in range(24, 50):
        for x in range(26, 38):
             if grid[y][x] and (y % 4 != 0): # Banded pattern
                 grid[y][x] = 7 # Belly color
    
    # 3. LEGS (Thick)
    # Left
    rect(12, 40, 10, 18, 1)
    rect(12, 40, 4, 18, 2) # Shadow
    rect(10, 58, 12, 4, 1) # Foot
    rect(10, 60, 3, 2, 6) # Claw
    rect(14, 60, 3, 2, 6) # Claw
    
    # Right
    rect(42, 40, 10, 18, 1)
    rect(48, 40, 4, 18, 2) # Shadow
    rect(42, 58, 12, 4, 1) # Foot
    rect(42, 60, 3, 2, 6) # Claw
    rect(46, 60, 3, 2, 6) # Claw

    # 4. ARMS (Muscular)
    # Left
    rect(8, 26, 12, 8, 1) # Shoulder
    rect(6, 26, 8, 14, 1) # Forearm
    rect(4, 38, 4, 4, 6) # Claw
    
    # Right
    rect(44, 26, 12, 8, 1)
    rect(50, 26, 8, 14, 1)
    rect(56, 38, 4, 4, 6) # Claw

    # 5. HEAD (Detailed)
    # Base
    for y in range(10, 28):
        for x in range(20, 44):
             if (x-32)**2 + (y-20)**2 < 110:
                 grid[y][x] = 1
    
    # Jaw
    rect(24, 24, 16, 6, 7) # Lower Jaw color
    
    # Eyes (Angry)
    rect(22, 16, 6, 4, 4) # L White
    rect(36, 16, 6, 4, 4) # R White
    rect(25, 17, 2, 2, 5) # L Pupil
    rect(37, 17, 2, 2, 5) # R Pupil
    
    # Brow
    rect(21, 14, 8, 2, 2)
    rect(35, 14, 8, 2, 2)
    
    # Horns
    rect(16, 8, 4, 8, 6) # L
    rect(44, 8, 4, 8, 6) # R
    rect(18, 6, 2, 2, 6) # Tip
    rect(46, 6, 2, 2, 6) # Tip


# VARIATION GENERATOR
def generate_variant_v5(filename, seed):
    random.seed(seed)
    
    # Palettes
    themes = [
        {"name": "Blastoise", "p": "#6390F0", "s": "#4A6CC3", "h": "#9DB7F5", "b": "#EAD6B8", "c": "white"},
        {"name": "Charizard", "p": "#F08030", "s": "#C06020", "h": "#F8A060", "b": "#F8D030", "c": "white"},
        {"name": "Venusaur", "p": "#80C070", "s": "#509050", "h": "#A0D090", "b": "#609070", "c": "white"},
        {"name": "Nidoking", "p": "#A040A0", "s": "#703070", "h": "#C060C0", "b": "#E0E0E0", "c": "white"},
        {"name": "Groudon", "p": "#C03028", "s": "#902020", "h": "#E05048", "b": "#404040", "c": "#F8D030"}, # Gold claws
        {"name": "Kyogre", "p": "#0020C0", "s": "#001090", "h": "#4060E0", "b": "white", "c": "#F8D030"},
    ]
    
    theme = random.choice(themes)
    
    # Slight color shifting for uniqueness even within themes
    # (Skipping complex HSL shift for simplicity, relying on mix)
    
    grid = get_empty_grid(64)
    draw_master_kaiju(grid)
    
    svg = f'<svg width="512" height="512" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'
    
    # Floor Shadow
    svg += '<ellipse cx="32" cy="60" rx="20" ry="3" fill="rgba(0,0,0,0.3)" />'
    
    for y in range(64):
        for x in range(64):
            code = grid[y][x]
            if not code: continue
            
            fill = "transparent"
            if code == 1: fill = theme["p"] # Primary
            elif code == 2: fill = theme["s"] # Shadow
            elif code == 3: fill = theme["h"] # Highlight
            elif code == 4: fill = "white" # Eye
            elif code == 5: fill = "black" # Pupil
            elif code == 6: fill = theme["c"] # Claws/Horns
            elif code == 7: fill = theme["b"] # Belly
            
            svg += f'<rect x="{x}" y="{y}" width="1" height="1" fill="{fill}" />'
    
    svg += '</svg>'
    
    with open(filename, "w") as f:
        f.write(svg)

if __name__ == "__main__":
    output_dir = "d:/NFTagachi/frontend/public/collection"
    os.makedirs(output_dir, exist_ok=True)
    
    # Main Pet
    generate_variant_v5("d:/NFTagachi/frontend/public/pet.svg", 777)
    print("Main Pet V5 Generated")
    
    print("Generating 300 V5 Variants...")
    for i in range(300):
        generate_variant_v5(f"{output_dir}/monster_{i}.svg", i)
    print("Done")
