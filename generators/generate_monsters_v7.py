import random
import os

# --- 64x64 MASTER TEMPLATE (V7 Archetypes) ---
# Supports complex archetypes: HUMANOID, SNAKE, BEAST, ALIEN

def get_empty_grid(size=64):
    return [[None for _ in range(size)] for _ in range(size)]

def draw_rect(grid, x, y, w, h, c):
    for dy in range(h):
        for dx in range(w):
            if 0 <= y+dy < 64 and 0 <= x+dx < 64:
                grid[y+dy][x+dx] = c

def draw_circle(grid, cx, cy, r, c):
    for y in range(cy-r, cy+r+1):
        for x in range(cx-r, cx+r+1):
            if 0 <= y < 64 and 0 <= x < 64:
                if (x-cx)**2 + (y-cy)**2 <= r**2:
                    grid[y][x] = c

# --- COMPONENT DRAWING FUNCTIONS ---

def draw_humanoid(grid, frame, theme, subtype, anim):
    # Animation Offsets
    bob = 0
    l_arm_off = 0
    r_arm_off = 0
    l_leg_off = 0
    r_leg_off = 0
    
    if anim == "IDLE":
        bob = 1 if frame % 2 == 0 else 0
    elif anim == "WALK":
        bob = abs(frame - 1)
        l_leg_off = -2 if frame == 0 else 2
        r_leg_off = 2 if frame == 0 else -2
    elif anim == "ATTACK":
        l_arm_off = -4 if frame == 1 else 0 # Punch/Swing
        r_arm_off = 4 if frame == 2 else 0
    elif anim == "EAT":
        bob = -1 if frame % 2 != 0 else 0

    # Colors
    c_skin = 1 # Primary
    c_dark = 2 # Secondary
    c_acc = 6 # Accent
    c_eye = 4 # White
    
    # LEGS
    draw_rect(grid, 24, 40+bob+l_leg_off, 6, 18, c_dark)
    draw_rect(grid, 34, 40+bob+r_leg_off, 6, 18, c_dark)
    # Feet
    draw_rect(grid, 22, 56+bob+l_leg_off, 8, 4, c_dark)
    draw_rect(grid, 34, 56+bob+r_leg_off, 8, 4, c_dark)

    # TORSO
    if subtype == "THUG": # Hoodie/Jacket
        draw_rect(grid, 20, 24+bob, 24, 20, c_skin)
        draw_rect(grid, 22, 26+bob, 20, 16, c_dark) # Inner shirt
    elif subtype == "WIZARD": # Robe
        draw_rect(grid, 22, 24+bob, 20, 28, c_skin)
        draw_rect(grid, 28, 24+bob, 8, 28, c_dark) # Robe trim
    else: # Golem/Basic
        draw_rect(grid, 18, 22+bob, 28, 22, c_skin)

    # HEAD
    head_y = 10 + bob
    if subtype == "WIZARD":
        # Hat
        draw_rect(grid, 20, head_y-8, 24, 4, c_acc) # Brim
        draw_rect(grid, 24, head_y-16, 16, 10, c_skin) # Top
    
    draw_rect(grid, 22, head_y, 20, 18, c_skin) # Face Base

    # EYES (Thug shades or regular)
    if subtype == "THUG":
        draw_rect(grid, 24, head_y+6, 16, 4, 5) # Black shades
    else:
        draw_rect(grid, 26, head_y+6, 4, 4, c_eye)
        draw_rect(grid, 34, head_y+6, 4, 4, c_eye)
        draw_rect(grid, 28, head_y+7, 2, 2, 5) # Pupil
        draw_rect(grid, 34, head_y+7, 2, 2, 5)

    # ARMS
    if subtype == "WIZARD":
        # Staff in Right Hand
        draw_rect(grid, 44+r_arm_off, 24+bob, 4, 16, c_skin) # Sleeve
        draw_rect(grid, 46+r_arm_off, 10+bob, 2, 40, 7) # Staff
        draw_rect(grid, 44+r_arm_off, 8+bob, 6, 6, c_acc) # Orb
    
    draw_rect(grid, 14, 24+bob+l_arm_off, 6, 16, c_skin) # L Arm
    if subtype != "WIZARD":
        draw_rect(grid, 44, 24+bob+r_arm_off, 6, 16, c_skin) # R Arm

def draw_snake(grid, frame, theme, anim):
    # Sinuous motion
    sway = 0
    if anim == "IDLE":
        sway = 2 if frame % 2 == 0 else -2
    elif anim == "WALK":
        sway = 4 * (frame - 1.5)
    
    c_skin = 1
    c_belly = 2
    
    # Body Segments (Coils)
    for i in range(5):
        s = sway * (1 if i%2==0 else -1)
        draw_circle(grid, 32 + int(s), 56 - (i*6), 10 - i, c_skin)
        draw_circle(grid, 32 + int(s), 56 - (i*6), 6 - i, c_belly) # Belly pattern

    # Head
    head_x = 32 + int(sway)
    head_y = 26
    draw_circle(grid, head_x, head_y, 12, c_skin)
    
    # Hood (Cobra style)
    if random.random() > 0.5:
        draw_rect(grid, head_x-14, head_y-4, 4, 12, c_skin)
        draw_rect(grid, head_x+10, head_y-4, 4, 12, c_skin)

    # Eyes
    draw_rect(grid, head_x-6, head_y-2, 4, 4, 4)
    draw_rect(grid, head_x+2, head_y-2, 4, 4, 4)
    draw_rect(grid, head_x-5, head_y-1, 2, 4, 5) # Slit pupil
    draw_rect(grid, head_x+3, head_y-1, 2, 4, 5)

def draw_beast(grid, frame, theme, anim):
    # Quadruped / Turtle
    bob = 1 if frame % 2 == 0 else 0
    
    c_skin = 1
    c_shell = 2
    
    # Body/Shell
    draw_circle(grid, 32, 40+bob, 18, c_shell)
    
    # Legs
    lx_off = -2 if anim == "WALK" and frame == 0 else 0
    rx_off = 2 if anim == "WALK" and frame == 2 else 0
    
    draw_rect(grid, 18+lx_off, 50+bob, 8, 10, c_skin)
    draw_rect(grid, 38+rx_off, 50+bob, 8, 10, c_skin)
    draw_rect(grid, 22, 52+bob, 8, 8, c_skin) # Back legs (offset)
    draw_rect(grid, 34, 52+bob, 8, 8, c_skin)

    # Head
    draw_rect(grid, 26, 28+bob, 12, 10, c_skin)
    # Eyes
    draw_rect(grid, 26, 30+bob, 4, 4, 4) # Side eye style
    draw_rect(grid, 34, 30+bob, 4, 4, 4)

def draw_alien(grid, frame, theme, anim):
    # Floating mechanism
    float_y = 0
    if anim == "IDLE": float_y = int(4 * math.sin(frame))
    
    c_skin = 1
    c_glow = 6
    
    # Core
    draw_circle(grid, 32, 32+float_y, 14, c_skin)
    
    # Rings/Tentacles
    for i in range(4):
        angle = (frame * 0.5) + (i * 1.57) # Rotate
        ox = int(20 * math.cos(angle))
        oy = int(10 * math.sin(angle))
        draw_circle(grid, 32+ox, 32+float_y+oy, 4, c_glow)
    
    # Single Eye
    draw_circle(grid, 32, 32+float_y, 6, 4)
    draw_circle(grid, 32, 32+float_y, 2, 5)


import math 

def draw_frame(archetype, frame, theme, subtype, anim):
    grid = get_empty_grid(64)
    
    if archetype == "HUMANOID":
        draw_humanoid(grid, frame, theme, subtype, anim)
    elif archetype == "SNAKE":
        draw_snake(grid, frame, theme, anim)
    elif archetype == "BEAST":
        draw_beast(grid, frame, theme, anim)
    elif archetype == "ALIEN":
        draw_alien(grid, frame, theme, anim)
        
    return grid

def generate_sprite_sheet(filename, seed):
    random.seed(seed)
    
    # 1. Determine Archetype & Theme
    archetypes = ["HUMANOID", "SNAKE", "BEAST", "ALIEN"]
    if seed % 10 < 4: archetype = "HUMANOID" # 40% Humanoid
    elif seed % 10 < 6: archetype = "SNAKE"    # 20% Snake
    elif seed % 10 < 8: archetype = "BEAST"    # 20% Beast
    else: archetype = "ALIEN"                  # 20% Alien
    
    subtypes = ["THUG", "WIZARD", "GOLEM"]
    subtype = random.choice(subtypes) if archetype == "HUMANOID" else None
    
    themes = [
        {"p": "#6390F0", "s": "#4A6CC3", "h": "#9DB7F5", "b": "#EAD6B8", "c": "white"}, # Water
        {"p": "#F08030", "s": "#C06020", "h": "#F8A060", "b": "#F8D030", "c": "white"}, # Fire
        {"p": "#80C070", "s": "#509050", "h": "#A0D090", "b": "#609070", "c": "white"}, # Grass
        {"p": "#A040A0", "s": "#703070", "h": "#C060C0", "b": "#E0E0E0", "c": "white"}, # Poison
        {"p": "#303030", "s": "#101010", "h": "#505050", "b": "#A0A0A0", "c": "red"},   # Shadow/Thug
    ]
    theme = random.choice(themes)
    
    # Overrides for specific subtypes
    if subtype == "THUG": 
        theme = {"p": "#404040", "s": "#202020", "h": "#606060", "b": "#FFD700", "c": "white"} # Dark w/ Gold chain color
    if subtype == "WIZARD":
        theme["c"] = "#A020F0" # Magic purple accent
        
    anims = ["IDLE", "WALK", "EAT", "ATTACK"]
    frames_per_anim = 4
    
    # SVG Setup
    sheet_width = 64 * frames_per_anim
    sheet_height = 64 * len(anims)
    
    svg = f'<svg width="{sheet_width}" height="{sheet_height}" viewBox="0 0 {sheet_width} {sheet_height}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'
    
    for row, anim in enumerate(anims):
        for col in enumerate(range(frames_per_anim)):
            frame = col[1]
            grid = draw_frame(archetype, frame, theme, subtype, anim)
            
            x_off = col[0] * 64
            y_off = row * 64
            
            # Shadow
            svg += f'<ellipse cx="{x_off + 32}" cy="{y_off + 60}" rx="18" ry="4" fill="rgba(0,0,0,0.3)" />'
            
            for y in range(64):
                for x in range(64):
                    code = grid[y][x]
                    if not code: continue
                    
                    fill = "transparent"
                    if code == 1: fill = theme["p"]
                    elif code == 2: fill = theme["s"]
                    elif code == 4: fill = "white" # Eye white
                    elif code == 5: fill = "black" # Pupil / shades
                    elif code == 6: fill = theme["c"] # Accent / Magic
                    elif code == 7: fill = theme["b"] # Secondary Accent (Staff)
                    
                    svg += f'<rect x="{x_off + x}" y="{y_off + y}" width="1" height="1" fill="{fill}" />'
    
    svg += '</svg>'
    
    with open(filename, "w") as f:
        f.write(svg)

if __name__ == "__main__":
    output_dir = "d:/NFTagachi/frontend/public/collection_v7"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate 300 V7 Sheets
    for i in range(300):
        sheet_path = f"{output_dir}/sheet_{i}.svg"
        generate_sprite_sheet(sheet_path, i)
        if i % 50 == 0: print(f"Generated {i} sheets...")
    
    print("Done! Collection V7 is ready in /public/collection_v7")
