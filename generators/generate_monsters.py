import random
import os

def get_color_palette():
    # Retro palettes
    palettes = [
        ("#10b981", "#059669"), # Emerald Green
        ("#3b82f6", "#2563eb"), # Blue
        ("#ef4444", "#dc2626"), # Red
        ("#f59e0b", "#d97706"), # Amber
        ("#8b5cf6", "#7c3aed"), # Purple
        ("#ec4899", "#db2777"), # Pink
    ]
    return random.choice(palettes)

def generate_improved_svg(filename, seed=None):
    if seed:
        random.seed(seed + 500) 
        
    width, height = 16, 16
    pixel_size = 10
    
    body_color, dark_color = get_color_palette()
    
    # Grid 16x16
    matrix = [[None for _ in range(16)] for _ in range(16)]
    
    # 1. BODY SHAPE (Symmetric)
    # Define some body templates (1 = fill)
    # A simple compact body floating a bit
    for y in range(5, 12):
        for x in range(4, 8):
            matrix[y][x] = body_color
            matrix[y][15-x] = body_color # Mirror
            
    # Add random ears/horns
    ear_type = random.choice(['none', 'cat', 'bear', 'horn'])
    if ear_type == 'cat':
        matrix[4][4] = body_color; matrix[4][11] = body_color
        matrix[3][3] = body_color; matrix[3][12] = body_color
    elif ear_type == 'bear':
        matrix[4][3] = body_color; matrix[4][12] = body_color
        matrix[5][2] = body_color; matrix[5][13] = body_color
    elif ear_type == 'horn':
        matrix[4][6] = body_color; matrix[4][9] = body_color
        matrix[3][6] = body_color; matrix[3][9] = body_color

    # Add feet
    matrix[12][5] = dark_color; matrix[12][10] = dark_color
    matrix[13][4] = dark_color; matrix[13][11] = dark_color

    # 2. FACE
    # Eyes
    eye_y = 7
    # White of eye
    matrix[eye_y][5] = "white"; matrix[eye_y][10] = "white"
    
    # Pupil (Look direction?)
    look = random.choice([0, 1]) 
    if look == 0:
        matrix[eye_y][5] = "black"; matrix[eye_y][10] = "black"
    else:
        matrix[eye_y][5] = "black"; matrix[eye_y][10] = "black" # Simple dot eyes

    # Mouth
    matrix[eye_y+2][7] = "black"; matrix[eye_y+2][8] = "black" 

    # 3. RENDER SVG
    svg_content = f'<svg width="{width*pixel_size}" height="{height*pixel_size}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'
    
    # Shadow
    svg_content += f'<rect x="3" y="14" width="10" height="1" fill="rgba(0,0,0,0.2)" />'

    for y in range(16):
        for x in range(16):
            color = matrix[y][x]
            if color:
                svg_content += f'<rect x="{x}" y="{y}" width="1" height="1" fill="{color}" />'
    
    svg_content += '</svg>'
    
    with open(filename, "w") as f:
        f.write(svg_content)

if __name__ == "__main__":
    output_dir = "d:/NFTagachi/frontend/public/collection"
    os.makedirs(output_dir, exist_ok=True)
    
    # Update Main Pet
    generate_improved_svg("d:/NFTagachi/frontend/public/pet.svg", seed=999)
    print("Regenerated main pet.svg")
    
    # Generate 300 Unique Monsters
    print("Regenerating 300 unique monsters...")
    for i in range(300):
        generate_improved_svg(f"{output_dir}/monster_{i}.svg", seed=i)
    
    print("Done.")
