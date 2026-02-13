import random
import os

# --- 64x64 MASTER TEMPLATE (V6 Animated) ---
# Supports frame-based transformations for IDLE, WALK, EAT, and ATTACK.

def get_empty_grid(size=64):
    return [[None for _ in range(size)] for _ in range(size)]

def draw_frame(anim, frame, theme):
    grid = get_empty_grid(64)
    
    # helper
    def rect(x, y, w, h, c):
        for dy in range(h):
            for dx in range(w):
                if 0 <= y+dy < 64 and 0 <= x+dx < 64:
                    grid[y+dy][x+dx] = c

    # Animation offsets
    body_y_off = 0
    mouth_open = 0
    belly_size = 0
    leg_l_off = 0
    leg_r_off = 0
    
    if anim == "IDLE":
        # Breathing effect
        body_y_off = 1 if frame % 2 == 1 else 0
    elif anim == "WALK":
        # Bouncing walking effect
        body_y_off = frame % 2
        leg_l_off = -4 if frame == 1 else 0
        leg_r_off = -4 if frame == 3 else 0
    elif anim == "EAT":
        # Jaw and belly expansion
        mouth_open = frame * 2
        belly_size = frame * 2
    elif anim == "ATTACK":
        # Lunging effect
        body_y_off = 0
        leg_l_off = 2 if frame > 1 else 0
        
    # 1. TAIL
    rect(10, 40 + body_y_off, 15, 8, 1)
    rect(8, 38 + body_y_off, 4, 4, 6) # Spine
    
    # 2. BODY (Rounded)
    for y in range(20, 56):
        for x in range(16, 48):
            # Dynamic belly expansion
            bw = 48 + (belly_size if x > 32 else 0)
            if (x-32)**2 + (y-38 - body_y_off)**2 < (340 + (belly_size * 5)):
                grid[y][x] = 1 # Primary
                if x < 24 or y > 48:
                    grid[y][x] = 2 # Shadow
    
    # BELLY (Plated)
    for y in range(24, 50):
        for x in range(26, 38 + (belly_size//2)):
             if grid[y][x] and (y % 4 != 0):
                 grid[y][x] = 7 
    
    # 3. LEGS 
    # Left
    rect(12, 40 + leg_l_off, 10, 18, 1)
    rect(10, 58 + leg_l_off, 12, 4, 1) # Foot
    rect(10, 60 + leg_l_off, 3, 2, 6) # Claw
    
    # Right
    rect(42, 40 + leg_r_off, 10, 18, 1)
    rect(42, 58 + leg_r_off, 12, 4, 1) # Foot
    rect(42, 60 + leg_r_off, 3, 2, 6) # Claw

    # 4. ARMS
    rect(8, 26 + body_y_off, 12, 8, 1) # Shoulder
    rect(6, 26 + body_y_off, 8, 14, 1) # Forearm
    rect(4, 38 + body_y_off, 4, 4, 6) # Claw
    
    rect(44, 26 + body_y_off, 12, 8, 1)
    rect(50, 26 + body_y_off, 8, 14, 1)
    rect(56, 38 + body_y_off, 4, 4, 6) # Claw

    # 5. HEAD
    # Base
    for y in range(10, 28):
        for x in range(20, 44):
             if (x-32)**2 + (y-20 - body_y_off)**2 < 110:
                 grid[y][x] = 1
    
    # Jaw (Animated)
    rect(24, 24 + body_y_off + mouth_open, 16, 6, 7) 
    
    # Eyes
    rect(22, 16 + body_y_off, 6, 4, 4) # White
    rect(36, 16 + body_y_off, 6, 4, 4)
    rect(25, 17 + body_y_off, 2, 2, 5) # Pupil
    rect(37, 17 + body_y_off, 2, 2, 5)
    
    # Horns
    rect(16, 8 + body_y_off, 4, 8, 6)
    rect(44, 8 + body_y_off, 4, 8, 6)

    return grid

def generate_sprite_sheet(filename, seed):
    random.seed(seed)
    
    themes = [
        {"p": "#6390F0", "s": "#4A6CC3", "h": "#9DB7F5", "b": "#EAD6B8", "c": "white"}, # Water
        {"p": "#F08030", "s": "#C06020", "h": "#F8A060", "b": "#F8D030", "c": "white"}, # Fire
        {"p": "#80C070", "s": "#509050", "h": "#A0D090", "b": "#609070", "c": "white"}, # Grass
        {"p": "#A040A0", "s": "#703070", "h": "#C060C0", "b": "#E0E0E0", "c": "white"}, # Poison
        {"p": "#C03028", "s": "#902020", "h": "#E05048", "b": "#404040", "c": "#F8D030"}, # Fight
        {"p": "#705848", "s": "#483830", "h": "#8B7355", "b": "#D2B48C", "c": "#E0C068"}, # Rock/Shadow
    ]
    theme = random.choice(themes)
    
    anims = ["IDLE", "WALK", "EAT", "ATTACK"]
    frames_per_anim = 4
    
    # SVG Setup (64x64 tiles, 4x4 grid)
    sheet_width = 64 * frames_per_anim
    sheet_height = 64 * len(anims)
    
    svg = f'<svg width="{sheet_width}" height="{sheet_height}" viewBox="0 0 {sheet_width} {sheet_height}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'
    
    for row, anim in enumerate(anims):
        for col in enumerate(range(frames_per_anim)):
            frame = col[1]
            grid = draw_frame(anim, frame, theme)
            
            x_off = col[0] * 64
            y_off = row * 64
            
            # Floor Shadow (Per Frame)
            svg += f'<ellipse cx="{x_off + 32}" cy="{y_off + 60}" rx="20" ry="3" fill="rgba(0,0,0,0.2)" />'
            
            for y in range(64):
                for x in range(64):
                    code = grid[y][x]
                    if not code: continue
                    
                    fill = "transparent"
                    if code == 1: fill = theme["p"]
                    elif code == 2: fill = theme["s"]
                    elif code == 4: fill = "white"
                    elif code == 5: fill = "black"
                    elif code == 6: fill = theme["c"]
                    elif code == 7: fill = theme["b"]
                    
                    svg += f'<rect x="{x_off + x}" y="{y_off + y}" width="1" height="1" fill="{fill}" />'
    
    svg += '</svg>'
    
    with open(filename, "w") as f:
        f.write(svg)

if __name__ == "__main__":
    output_dir = "d:/NFTagachi/frontend/public/collection_v6"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate 300 Animated Sheets
    for i in range(300):
        sheet_path = f"{output_dir}/sheet_{i}.svg"
        generate_sprite_sheet(sheet_path, i)
        if i % 50 == 0: print(f"Generated {i} sheets...")
    
    print("Done! Collection V6 (Animated) is ready in /public/collection_v6")
