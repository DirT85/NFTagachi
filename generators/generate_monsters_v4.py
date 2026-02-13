import random
import os
import math

# --- PALETTES ---
PALETTES = [
    {"name": "Charizard Red", "fill": "#ff7f50", "shadow": "#cd5c5c", "highlight": "#ffa07a", "outline": "#8b0000"},
    {"name": "Blastoise Blue", "fill": "#6495ed", "shadow": "#4169e1", "highlight": "#87cefa", "outline": "#191970"},
    {"name": "Venusaur Green", "fill": "#3cb371", "shadow": "#2e8b57", "highlight": "#90ee90", "outline": "#006400"},
    {"name": "Gengar Purple", "fill": "#9370db", "shadow": "#663399", "highlight": "#e6e6fa", "outline": "#4b0082"},
    {"name": "Pikachu Yellow", "fill": "#ffd700", "shadow": "#daa520", "highlight": "#ffec8b", "outline": "#8b4500"},
    {"name": "Onyx Grey", "fill": "#708090", "shadow": "#4f4f4f", "highlight": "#b0c4de", "outline": "#2f4f4f"},
]

SIZE = 64

def get_empty_grid():
    return [[None for _ in range(SIZE)] for _ in range(SIZE)]

def fill_ellipse(grid, cx, cy, rx, ry, color_type):
    for y in range(int(cy - ry - 1), int(cy + ry + 1)):
        for x in range(int(cx - rx - 1), int(cx + rx + 1)):
            if 0 <= x < SIZE and 0 <= y < SIZE:
                # Ellipse equation
                if ((x - cx)**2 / rx**2) + ((y - cy)**2 / ry**2) <= 1:
                    # Don't overwrite features (4,5) with body (1,2,3) if already set? 
                    # For now just Painter's Algorithm (overwrite) via main logic
                    grid[y][x] = color_type

# 1=Fill, 2=Shadow, 3=Highlight, 4=EyeWhite, 5=Pupil, 0=None, 9=Outline

def generate_monster_v4(filename, seed):
    random.seed(seed)
    
    palette = random.choice(PALETTES)
    grid = get_empty_grid()
    
    # --- ANATOMY GENERATION ---
    
    # 1. BODY
    bx = SIZE // 2
    by = SIZE // 2 + 5
    bw = random.randint(12, 18)
    bh = random.randint(14, 20)
    
    # Draw Outline (Simplified: Fill larger then overwrite)
    # Actually, let's just draw the shapes and add outline later or imply it via contrast
    
    # Body Base
    fill_ellipse(grid, bx, by, bw, bh, 1) # Fill
    
    # Body Shadow (Bottom/Right)
    # intersection of body and offset ellipse
    for y in range(SIZE):
        for x in range(SIZE):
            if grid[y][x] == 1:
                # Simple shading logic: Lower right or bottom part
                if y > by + bh * 0.3 or x > bx + bw * 0.4:
                    grid[y][x] = 2

    # Body Highlight (Top Left)
    fill_ellipse(grid, bx - bw*0.4, by - bh*0.4, bw*0.3, bh*0.3, 3)

    # 2. HEAD
    hx = bx
    hy = by - bh * 0.8
    hw = random.randint(10, 14)
    hh = random.randint(10, 14)
    
    fill_ellipse(grid, hx, hy, hw, hh, 1)
    
    # Head Shadow
    for y in range(SIZE):
        for x in range(SIZE):
             if ((x - hx)**2 / hw**2) + ((y - hy)**2 / hh**2) <= 1:
                 if y > hy + hh * 0.3:
                     grid[y][x] = 2

    # 3. LIMBS
    num_arms = 2
    for i in range(num_arms):
        # Arm Positions
        side = -1 if i == 0 else 1
        ax = bx + (side * bw * 0.8)
        ay = by - bh * 0.2
        aw = random.randint(4, 6)
        ah = random.randint(4, 6)
        fill_ellipse(grid, ax, ay, aw, ah, 1)
    
    num_legs = 2
    for i in range(num_legs):
        side = -1 if i == 0 else 1
        lx = bx + (side * bw * 0.5)
        ly = by + bh * 0.8
        lw = random.randint(5, 7)
        lh = random.randint(4, 6)
        fill_ellipse(grid, lx, ly, lw, lh, 1)


    # 4. FACE
    # Eyes
    eye_spacing = random.randint(4, 8)
    eye_y = hy 
    eye_size = random.randint(2, 4)
    
    # Left Eye
    fill_ellipse(grid, hx - eye_spacing//2, eye_y, eye_size, eye_size, 4) # White
    fill_ellipse(grid, hx - eye_spacing//2, eye_y, 1, 1, 5) # Pupil
    
    # Right Eye
    fill_ellipse(grid, hx + eye_spacing//2, eye_y, eye_size, eye_size, 4)
    fill_ellipse(grid, hx + eye_spacing//2, eye_y, 1, 1, 5)

    # 5. GENERATE SVG
    svg = f'<svg width="256" height="256" viewBox="0 0 {SIZE} {SIZE}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'
    
    # Ground Shadow
    svg += f'<ellipse cx="{SIZE//2}" cy="{SIZE-4}" rx="{bw}" ry="3" fill="rgba(0,0,0,0.2)" />'

    for y in range(SIZE):
        for x in range(SIZE):
            code = grid[y][x]
            if code is None: continue
            
            color = palette["fill"]
            if code == 2: color = palette["shadow"]
            elif code == 3: color = palette["highlight"]
            elif code == 4: color = "#ffffff"
            elif code == 5: color = "#000000"
            
            svg += f'<rect x="{x}" y="{y}" width="1" height="1" fill="{color}" />'
            
    svg += '</svg>'
    
    with open(filename, "w") as f:
        f.write(svg)

if __name__ == "__main__":
    output_dir = "d:/NFTagachi/frontend/public/collection"
    os.makedirs(output_dir, exist_ok=True)
    
    # Main Pet
    generate_monster_v4("d:/NFTagachi/frontend/public/pet.svg", 111)
    print("V4 Pet Generated")
    
    # Collection
    print("Generating V4 Collection...")
    for i in range(300):
        generate_monster_v4(f"{output_dir}/monster_{i}.svg", i)
    print("Done")
