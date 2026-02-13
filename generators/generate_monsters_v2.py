import random
import os

# --- PALETTES ---
PALETTES = [
    {"name": "Fire", "main": "#ef4444", "dark": "#991b1b", "light": "#fca5a5"},
    {"name": "Water", "main": "#3b82f6", "dark": "#1e40af", "light": "#93c5fd"},
    {"name": "Grass", "main": "#10b981", "dark": "#065f46", "light": "#6ee7b7"},
    {"name": "Electric", "main": "#f59e0b", "dark": "#92400e", "light": "#fcd34d"},
    {"name": "Psychic", "main": "#8b5cf6", "dark": "#5b21b6", "light": "#c4b5fd"},
    {"name": "Dark", "main": "#1f2937", "dark": "#000000", "light": "#4b5563"},
]

# --- TEMPLATES (16x16 Grids) ---
# 0 = Transparent, 1 = Main, 2 = Dark, 3 = Light, 4 = White, 5 = Black

def get_empty_grid():
    return [[0 for _ in range(16)] for _ in range(16)]

# BODY SHAPES
BODIES = {
    "round": [
        (4,11,1), (5,11,1), (6,11,1), (7,11,1), (8,11,1), (9,11,1), (10,11,1), (11,11,1),
        (3,10,1), (12,10,1), (3,9,1), (12,9,1), (3,8,1), (12,8,1), (3,7,1), (12,7,1),
        (4,6,1), (11,6,1), (5,5,1), (10,5,1), (6,5,1), (9,5,1), (7,5,1), (8,5,1),
        # Fill center
        (4,10,1), (5,10,1), (6,10,1), (7,10,1), (8,10,1), (9,10,1), (10,10,1), (11,10,1),
        (4,9,1), (5,9,1), (6,9,1), (7,9,1), (8,9,1), (9,9,1), (10,9,1), (11,9,1),
        (4,8,1), (5,8,1), (6,8,1), (7,8,1), (8,8,1), (9,8,1), (10,8,1), (11,8,1),
        (4,7,1), (5,7,1), (6,7,1), (7,7,1), (8,7,1), (9,7,1), (10,7,1), (11,7,1),
        (5,6,1), (6,6,1), (7,6,1), (8,6,1), (9,6,1), (10,6,1)
    ],
    "cube": [
        (4,11,1), (5,11,1), (6,11,1), (7,11,1), (8,11,1), (9,11,1), (10,11,1), (11,11,1),
        (4,10,1), (11,10,1), (4,9,1), (11,9,1), (4,8,1), (11,8,1), (4,7,1), (11,7,1),
        (4,6,1), (5,6,1), (6,6,1), (7,6,1), (8,6,1), (9,6,1), (10,6,1), (11,6,1),
         # Fill
        (5,10,1), (6,10,1), (7,10,1), (8,10,1), (9,10,1), (10,10,1),
        (5,9,1), (6,9,1), (7,9,1), (8,9,1), (9,9,1), (10,9,1),
        (5,8,1), (6,8,1), (7,8,1), (8,8,1), (9,8,1), (10,8,1),
        (5,7,1), (6,7,1), (7,7,1), (8,7,1), (9,7,1), (10,7,1),
    ]
}

FEET = {
    "stub": [(5,12,2), (6,12,2), (9,12,2), (10,12,2)],
    "claw": [(4,12,2), (5,12,2), (10,12,2), (11,12,2), (3,13,2), (12,13,2)]
}

EYES = {
    "cute": [(5,8,4), (10,8,4), (6,8,5), (9,8,5)], # White with black pupil inside? No, simplified
    "dot":  [(5,8,5), (10,8,5)],
    "visor": [(5,8,2), (6,8,2), (7,8,2), (8,8,2), (9,8,2), (10,8,2)]
}

HEAD_ATTRS = {
    "ears": [(3,4,1), (12,4,1), (4,5,1), (11,5,1)],
    "antenna": [(7,4,1), (8,4,1), (7,3,2)],
    "horns": [(4,5,3), (11,5,3), (3,4,3), (12,4,3)]
}

def generate_svg(filename, seed):
    random.seed(seed)
    
    # Select Components
    palette = random.choice(PALETTES)
    body_key = random.choice(list(BODIES.keys()))
    feet_key = random.choice(list(FEET.keys()))
    eyes_key = random.choice(list(EYES.keys()))
    attr_key = random.choice(list(HEAD_ATTRS.keys()))
    
    grid = get_empty_grid()
    
    # Draw Layers
    layers = [
        BODIES[body_key],
        FEET[feet_key],
        HEAD_ATTRS[attr_key],
        EYES[eyes_key]
    ]
    
    for layer in layers:
        for (x, y, color_code) in layer:
            if 0 <= x < 16 and 0 <= y < 16:
                grid[y][x] = color_code

    # Render SVG
    svg = f'<svg width="128" height="128" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'
    
    # Shadow
    svg += '<rect x="4" y="13" width="8" height="1" fill="rgba(0,0,0,0.2)" />'
    
    for y in range(16):
        for x in range(16):
            code = grid[y][x]
            if code == 0: continue
            
            color = "transparent"
            if code == 1: color = palette["main"]
            elif code == 2: color = palette["dark"]
            elif code == 3: color = palette["light"]
            elif code == 4: color = "white"
            elif code == 5: color = "black"
            
            svg += f'<rect x="{x}" y="{y}" width="1" height="1" fill="{color}" />'
            
    svg += '</svg>'
    
    with open(filename, "w") as f:
        f.write(svg)

if __name__ == "__main__":
    output_dir = "d:/NFTagachi/frontend/public/collection"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate Main Pet
    generate_svg("d:/NFTagachi/frontend/public/pet.svg", 100)
    print("Main Pet Generated")
    
    # Generate 300
    print("Generating Collection...")
    for i in range(300):
        generate_svg(f"{output_dir}/monster_{i}.svg", i)
    print("Done")
