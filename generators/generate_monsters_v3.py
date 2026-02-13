import random
import os

# --- PALETTES ---
PALETTES = [
    {"name": "Dragon Fire", "main": "#ef4444", "dark": "#991b1b", "light": "#fca5a5", "accent": "#f59e0b"},
    {"name": "Ocean Beast", "main": "#3b82f6", "dark": "#1e40af", "light": "#93c5fd", "accent": "#6ee7b7"},
    {"name": "Forest Guardian", "main": "#10b981", "dark": "#065f46", "light": "#6ee7b7", "accent": "#fcd34d"},
    {"name": "Shadow Demon", "main": "#4b5563", "dark": "#1f2937", "light": "#9ca3af", "accent": "#ef4444"},
    {"name": "Golden King", "main": "#f59e0b", "dark": "#b45309", "light": "#fcd34d", "accent": "#ffffff"},
    {"name": "Purple Eater", "main": "#8b5cf6", "dark": "#5b21b6", "light": "#c4b5fd", "accent": "#ec4899"},
]

# --- 32x32 GRID TEMPLATES ---
# 0=Trans, 1=Main, 2=Dark, 3=Light, 4=White, 5=Black, 6=Accent

def get_empty_grid():
    return [[0 for _ in range(32)] for _ in range(32)]

def fill_rect(grid, x, y, w, h, val):
    for dy in range(h):
        for dx in range(w):
            if 0 <= x+dx < 32 and 0 <= y+dy < 32:
                grid[y+dy][x+dx] = val

def fill_circle(grid, cx, cy, r, val):
    for y in range(32):
        for x in range(32):
            if (x-cx)**2 + (y-cy)**2 <= r**2:
                 grid[y][x] = val

# BODY TYPES
def draw_dragon_body(grid):
    # Main Body (Oval-ish)
    for y in range(12, 28):
        for x in range(8, 24):
            if (x-16)**2/64 + (y-20)**2/100 <= 1: # Oval equation approx
                grid[y][x] = 1
    
    # Belly (Light)
    for y in range(14, 26):
        for x in range(12, 20):
             grid[y][x] = 3

    # Arms (Muscular)
    fill_rect(grid, 4, 16, 5, 4, 1) # L Shoulder
    fill_rect(grid, 23, 16, 5, 4, 1) # R Shoulder
    fill_rect(grid, 3, 18, 4, 5, 1) # L Arm
    fill_rect(grid, 25, 18, 4, 5, 1) # R Arm
    fill_rect(grid, 3, 22, 3, 3, 2) # L Hand
    fill_rect(grid, 26, 22, 3, 3, 2) # R Hand

    # Legs (Thick)
    fill_rect(grid, 6, 24, 6, 6, 1) # L Leg
    fill_rect(grid, 20, 24, 6, 6, 1) # R Leg
    fill_rect(grid, 5, 29, 7, 2, 2) # L Foot
    fill_rect(grid, 20, 29, 7, 2, 2) # R Foot
    
    # Tail
    fill_rect(grid, 22, 26, 6, 3, 1)
    fill_rect(grid, 26, 25, 4, 3, 1)
    fill_rect(grid, 29, 23, 2, 3, 1)

def draw_beast_head(grid):
    # Head Base
    fill_rect(grid, 9, 6, 14, 10, 1)
    # Jaw
    fill_rect(grid, 10, 14, 12, 4, 3) 
    
    # Eyes (Angry)
    fill_rect(grid, 11, 10, 3, 3, 4) # L Eye White
    fill_rect(grid, 18, 10, 3, 3, 4) # R Eye White
    fill_rect(grid, 12, 11, 1, 1, 5) # L Pupil
    fill_rect(grid, 19, 11, 1, 1, 5) # R Pupil
    
    # Brows
    fill_rect(grid, 10, 9, 5, 1, 2)
    fill_rect(grid, 17, 9, 5, 1, 2)

    # Nostrils
    fill_rect(grid, 14, 15, 1, 1, 2)
    fill_rect(grid, 17, 15, 1, 1, 2)

def draw_horns(grid, style):
    if style == "bull":
        fill_rect(grid, 6, 4, 4, 6, 4) # L Horn Base
        fill_rect(grid, 22, 4, 4, 6, 4) # R Horn Base
        fill_rect(grid, 6, 2, 2, 2, 4) # L Tip
        fill_rect(grid, 24, 2, 2, 2, 4) # R Tip
    elif style == "ram":
        fill_rect(grid, 5, 7, 4, 4, 6) # Curl L
        fill_rect(grid, 23, 7, 4, 4, 6) # Curl R
        fill_rect(grid, 4, 9, 2, 4, 6)
        fill_rect(grid, 26, 9, 2, 4, 6)

def generate_svg_v3(filename, seed):
    random.seed(seed)
    
    palette = random.choice(PALETTES)
    grid = get_empty_grid()
    
    # Draw Layers
    draw_dragon_body(grid)
    draw_beast_head(grid)
    draw_horns(grid, random.choice(["bull", "ram", "none"]))

    # Render SVG (Scaled)
    svg = f'<svg width="256" height="256" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'
    
    # Shadow
    svg += '<ellipse cx="16" cy="30" rx="10" ry="2" fill="rgba(0,0,0,0.2)" />'
    
    for y in range(32):
        for x in range(32):
            code = grid[y][x]
            if code == 0: continue
            
            color = "transparent"
            if code == 1: color = palette["main"]
            elif code == 2: color = palette["dark"]
            elif code == 3: color = palette["light"]
            elif code == 4: "#ffffff" # Horns/Teeth usually white/bone
            elif code == 5: color = "black"
            elif code == 6: color = palette["accent"]
            
            # Fix white code
            if code == 4: color = "#e5e7eb" 

            svg += f'<rect x="{x}" y="{y}" width="1" height="1" fill="{color}" />'
            
    svg += '</svg>'
    
    with open(filename, "w") as f:
        f.write(svg)

if __name__ == "__main__":
    output_dir = "d:/NFTagachi/frontend/public/collection"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate Main Pet
    generate_svg_v3("d:/NFTagachi/frontend/public/pet.svg", 777)
    print("Main Pet V3 Generated")
    
    # Generate 300
    print("Generating Collection V3...")
    for i in range(300):
        generate_svg_v3(f"{output_dir}/monster_{i}.svg", i)
    print("Done")
