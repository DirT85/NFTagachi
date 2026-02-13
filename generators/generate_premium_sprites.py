from PIL import Image, ImageDraw
import random
import os

# Define output size for high-quality sprites
FRAME_SIZE = 64
SHEET_WIDTH = 13  # Max frames per row in LPC format
SHEET_HEIGHT = 21  # LPC standard has 21 rows

def create_dragon_sprite_sheet(dragon_type, output_path):
    """
    Create a high-quality dragon sprite sheet in LPC format
    dragon_type: 'fire', 'ice', 'shadow', 'storm'
    """
    
    # Define color palettes for each dragon type
    palettes = {
        'fire': {
            'primary': (220, 60, 30),      # Deep red
            'secondary': (255, 140, 60),    # Orange
            'accent': (255, 220, 100),      # Yellow highlights
            'eye': (255, 255, 100),         # Bright yellow eyes
            'effect': (255, 100, 0),        # Flame color
        },
        'ice': {
            'primary': (100, 180, 255),     # Ice blue
            'secondary': (180, 220, 255),   # Light blue
            'accent': (255, 255, 255),      # White highlights
            'eye': (150, 255, 255),         # Cyan eyes
            'effect': (200, 240, 255),      # Frost effect
        },
        'shadow': {
            'primary': (60, 20, 80),        # Dark purple
            'secondary': (100, 50, 120),    # Purple
            'accent': (150, 100, 180),      # Light purple
            'eye': (200, 100, 255),         # Violet eyes
            'effect': (80, 40, 100),        # Shadow effect
        },
        'storm': {
            'primary': (50, 100, 200),      # Electric blue
            'secondary': (255, 220, 60),    # Lightning yellow
            'accent': (255, 255, 255),      # White sparks
            'eye': (255, 255, 150),         # Bright eyes
            'effect': (200, 200, 255),      # Electric glow
        }
    }
    
    palette = palettes[dragon_type]
    
    # Create full sprite sheet
    sheet_img = Image.new('RGBA', (FRAME_SIZE * SHEET_WIDTH, FRAME_SIZE * SHEET_HEIGHT), (0, 0, 0, 0))
    
    # LPC format rows (we'll populate key rows):
    # Rows 9-12: Walk animations (4 directions, 9 frames each)
    # Row 21: Death/Hurt animation (6 frames)
    # Rows 1-4: Spellcast/Breath weapon (4 directions)
    # Rows 5-8: Thrust/Claw attack (4 directions)
    
    # Generate walk cycle frames (row 9) - South facing
    for frame in range(9):
        draw_dragon_walk_frame(sheet_img, frame, 8, frame, palette, dragon_type)
    
    # Generate walk cycle frames (row 10) - West facing
    for frame in range(9):
        draw_dragon_walk_frame(sheet_img, frame, 9, frame, palette, dragon_type, facing='west')
    
    # Generate walk cycle frames (row 11) - East facing  
    for frame in range(9):
        draw_dragon_walk_frame(sheet_img, frame, 10, frame, palette, dragon_type, facing='east')
    
    # Generate walk cycle frames (row 12) - North facing
    for frame in range(9):
        draw_dragon_walk_frame(sheet_img, frame, 11, frame, palette, dragon_type, facing='north')
    
    # Generate breath/spell frames (rows 1-4)
    for direction in range(4):
        for frame in range(7):
            draw_dragon_breath_frame(sheet_img, frame, direction, frame, palette, dragon_type)
    
    # Generate attack frames (rows 5-8)
    for direction in range(4):
        for frame in range(8):
            draw_dragon_attack_frame(sheet_img, frame, 4 + direction, frame, palette, dragon_type)
    
    # Generate death animation (row 21)
    for frame in range(6):
        draw_dragon_death_frame(sheet_img, frame, 20, frame, palette, dragon_type)
    
    sheet_img.save(output_path, 'PNG')
    print(f"Generated {dragon_type} dragon sprite sheet: {output_path}")

def draw_dragon_walk_frame(sheet, x_offset, row, frame, palette, dragon_type, facing='south'):
    """Draw a single dragon walk animation frame"""
    # Calculate position on sheet
    x = x_offset * FRAME_SIZE
    y = row * FRAME_SIZE
    
    # Create frame image
    frame_img = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame_img)
    
    # Animation offset for walk cycle
    bob = int(2 * abs((frame % 4) - 2))  # Create bobbing motion
    leg_offset = 1 if frame % 2 == 0 else -1
    
    # Draw dragon body (simplified high-quality pixel art)
    center_x, center_y = 32, 32 + bob
    
    # Tail
    if facing in ['south', 'east']:
        draw_tail(draw, center_x - 15, center_y + 8, palette, frame)
    
    # Body
    draw.ellipse([center_x - 12, center_y - 8, center_x + 12, center_y + 12], 
                 fill=palette['primary'])
    
    # Wings
    draw_wings(draw, center_x, center_y, palette, frame, facing)
    
    # Legs (walking motion)
    # Left leg
    draw.ellipse([center_x - 10 + leg_offset, center_y + 8, 
                  center_x - 6 + leg_offset, center_y + 18], 
                 fill=palette['secondary'])
    # Right leg
    draw.ellipse([center_x + 6 - leg_offset, center_y + 8, 
                  center_x + 10 - leg_offset, center_y + 18], 
                 fill=palette['secondary'])
    
    # Head
    head_y = center_y - 12
    draw.ellipse([center_x - 8, head_y - 6, center_x + 8, head_y + 6], 
                 fill=palette['primary'])
    
    # Horns
    draw.polygon([
        (center_x - 6, head_y - 6),
        (center_x - 8, head_y - 12),
        (center_x - 4, head_y - 6)
    ], fill=palette['accent'])
    draw.polygon([
        (center_x + 6, head_y - 6),
        (center_x + 8, head_y - 12),
        (center_x + 4, head_y - 6)
    ], fill=palette['accent'])
    
    # Eyes
    eye_y = head_y - 2
    draw.ellipse([center_x - 5, eye_y, center_x - 3, eye_y + 2], fill=palette['eye'])
    draw.ellipse([center_x + 3, eye_y, center_x + 5, eye_y + 2], fill=palette['eye'])
    
    # Add elemental effect hints
    if dragon_type == 'fire' and frame % 3 == 0:
        draw.ellipse([center_x - 2, head_y + 6, center_x + 2, head_y + 9], 
                    fill=palette['effect'] + (128,))
    
    # Paste frame onto sheet
    sheet.paste(frame_img, (x, y), frame_img)

def draw_wings(draw, center_x, center_y, palette, frame, facing='south'):
    """Draw dragon wings"""
    # Wing flap animation
    flap = int(4 * abs((frame % 4) - 2))
    
    # Left wing
    wing_pts = [
        (center_x - 8, center_y - 4),
        (center_x - 18 - flap, center_y - 8),
        (center_x - 16 - flap, center_y + 2),
        (center_x - 8, center_y)
    ]
    draw.polygon(wing_pts, fill=palette['secondary'] + (200,))
    
    # Right wing
    wing_pts = [
        (center_x + 8, center_y - 4),
        (center_x + 18 + flap, center_y - 8),
        (center_x + 16 + flap, center_y + 2),
        (center_x + 8, center_y)
    ]
    draw.polygon(wing_pts, fill=palette['secondary'] + (200,))

def draw_tail(draw, x, y, palette, frame):
    """Draw dragon tail"""
    sway = int(2 * ((frame % 4) - 2))
    points = [
        (x, y),
        (x - 8 + sway, y + 4),
        (x - 12 + sway, y + 8),
        (x - 10 + sway, y + 6)
    ]
    draw.polygon(points, fill=palette['secondary'])

def draw_dragon_breath_frame(sheet, x_offset, row, frame, palette, dragon_type):
    """Draw breath weapon/spell animation frame"""
    x = x_offset * FRAME_SIZE
    y = row * FRAME_SIZE
    
    frame_img = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame_img)
    
    center_x, center_y = 32, 32
    
    # Draw base dragon pose
    draw.ellipse([center_x - 12, center_y - 8, center_x + 12, center_y + 12], 
                 fill=palette['primary'])
    
    # Head tilted back for breath
    head_y = center_y - 10
    draw.ellipse([center_x - 8, head_y - 6, center_x + 8, head_y + 6], 
                 fill=palette['primary'])
    
    # Breath effect grows with frame
    if frame > 2:
        breath_size = (frame - 2) * 4
        draw.ellipse([center_x - 4, head_y - 10 - breath_size, 
                     center_x + 4, head_y - 6], 
                    fill=palette['effect'] + (150,))
    
    sheet.paste(frame_img, (x, y), frame_img)

def draw_dragon_attack_frame(sheet, x_offset, row, frame, palette, dragon_type):
    """Draw attack animation frame"""
    x = x_offset * FRAME_SIZE
    y = row * FRAME_SIZE
    
    frame_img = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame_img)
    
    center_x, center_y = 32, 32
    
    # Lunge forward motion
    lunge = min(frame * 2, 8) if frame < 4 else max((8 - frame) * 2, 0)
    
    # Draw base dragon
    draw.ellipse([center_x - 12 + lunge, center_y - 8, 
                  center_x + 12 + lunge, center_y + 12], 
                 fill=palette['primary'])
    
    # Extended claw
    if 2 <= frame <= 5:
        draw.polygon([
            (center_x + 12 + lunge, center_y),
            (center_x + 18 + lunge, center_y - 2),
            (center_x + 18 + lunge, center_y + 2)
        ], fill=palette['accent'])
    
    sheet.paste(frame_img, (x, y), frame_img)

def draw_dragon_death_frame(sheet, x_offset, row, frame, palette, dragon_type):
    """Draw death animation frame"""
    x = x_offset * FRAME_SIZE
    y = row * FRAME_SIZE
    
    frame_img = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame_img)
    
    center_x= 32
    center_y = 32 + frame * 2  # Fall to ground
    
    # Dragon collapses
    width = 12 - frame
    draw.ellipse([center_x - 12, center_y - width, 
                  center_x + 12, center_y + width], 
                 fill=palette['primary'] + (255 - frame * 40,))
    
    sheet.paste(frame_img, (x, y), frame_img)


def create_human_sprite_sheet(skin_tone, role, output_path):
    """
    Create a high-quality human character sprite sheet in LPC format
    skin_tone: 'dark', 'light'
    role: 'warrior', 'mage', 'rogue', 'knight', 'ranger', 'cleric'
    """
    
    # Skin tone palettes
    skin_colors = {
        'dark': (90, 60, 40),
        'light': (255, 220, 180)
    }
    
    # Role-based clothing colors
    role_colors = {
        'warrior': {
            'primary': (120, 60, 40),    # Brown leather
            'secondary': (80, 80, 80),   # Gray metal
            'accent': (180, 140, 100)    # Tan
        },
        'mage': {
            'primary': (60, 40, 120),    # Purple robe
            'secondary': (100, 80, 140), # Light purple
            'accent': (200, 180, 100)    # Gold trim
        },
        'rogue': {
            'primary': (40, 40, 40),     # Black
            'secondary': (80, 60, 40),   # Dark brown
            'accent': (120, 120, 120)    # Gray
        },
        'knight': {
            'primary': (140, 140, 160),  # Silver armor
            'secondary': (100, 100, 120), # Dark metal
            'accent': (200, 180, 60)     # Gold accents
        },
        'ranger': {
            'primary': (80, 120, 60),    # Forest green
            'secondary': (100, 80, 40),  # Brown
            'accent': (160, 140, 100)    # Leather
        },
        'cleric': {
            'primary': (240, 240, 240),  # White robe
            'secondary': (200, 180, 60), # Gold
            'accent': (180, 180, 200)    # Light gray
        }
    }
    
    skin = skin_colors[skin_tone]
    colors = role_colors[role]
    
    # Create full sprite sheet
    sheet_img = Image.new('RGBA', (FRAME_SIZE * SHEET_WIDTH, FRAME_SIZE * SHEET_HEIGHT), (0, 0, 0, 0))
    
    # Generate walk cycles (rows 9-12)
    for direction in range(4):
        for frame in range(9):
            draw_human_walk_frame(sheet_img, frame, 8 + direction, frame, skin, colors, role)
    
    # Generate attack animations (rows 13-16: slash)
    for direction in range(4):
        for frame in range(6):
            draw_human_attack_frame(sheet_img, frame, 12 + direction, frame, skin, colors, role)
    
    # Generate death animation (row 21)
    for frame in range(6):
        draw_human_death_frame(sheet_img, frame, 20, frame, skin, colors)
    
    sheet_img.save(output_path, 'PNG')
    print(f"Generated {skin_tone} {role} sprite sheet: {output_path}")

def draw_human_walk_frame(sheet, x_offset, row, frame, skin, colors, role):
    """Draw a single human walk animation frame"""
    x = x_offset * FRAME_SIZE
    y = row * FRAME_SIZE
    
    frame_img = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame_img)
    
    center_x, center_y = 32, 32
    
    # Walk cycle bob
    bob = int(2 * abs((frame % 4) - 2))
    leg_offset = 3 if frame % 2 == 0 else -3
    
    # Body
    draw.rectangle([center_x - 6, center_y - 12 + bob, 
                   center_x + 6, center_y + 4 + bob], 
                  fill=colors['primary'])
    
    # Legs
    draw.rectangle([center_x - 6, center_y + 4 + bob, 
                   center_x - 2, center_y + 14 + bob + leg_offset], 
                  fill=colors['secondary'])
    draw.rectangle([center_x + 2, center_y + 4 + bob, 
                   center_x + 6, center_y + 14 + bob - leg_offset], 
                  fill=colors['secondary'])
    
    # Head
    draw.ellipse([center_x - 5, center_y - 20 + bob, 
                 center_x + 5, center_y - 10 + bob], 
                fill=skin)
    
    # Hair (simple)
    draw.ellipse([center_x - 5, center_y - 22 + bob, 
                 center_x + 5, center_y - 16 + bob], 
                fill=(60, 40, 20))  # Dark hair
    
    # Role-specific details
    if role in ['knight', 'warrior']:
        # Shoulder armor
        draw.ellipse([center_x - 8, center_y - 12 + bob, 
                     center_x - 5, center_y - 9 + bob], 
                    fill=colors['accent'])
        draw.ellipse([center_x + 5, center_y - 12 + bob, 
                     center_x + 8, center_y - 9 + bob], 
                    fill=colors['accent'])
    
    sheet.paste(frame_img, (x, y), frame_img)

def draw_human_attack_frame(sheet, x_offset, row, frame, skin, colors, role):
    """Draw attack animation frame"""
    x = x_offset * FRAME_SIZE
    y = row * FRAME_SIZE
    
    frame_img = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame_img)
    
    center_x, center_y = 32, 32
    
    # Body
    draw.rectangle([center_x - 6, center_y - 12, center_x + 6, center_y + 4], 
                  fill=colors['primary'])
    
    # Weapon slash arc
    if 2 <= frame <= 4:
        weapon_offset = (frame - 2) * 8
        draw.line([center_x + 6, center_y - 8, 
                  center_x + 10 + weapon_offset, center_y - 12], 
                 fill=colors['accent'], width=2)
    
    sheet.paste(frame_img, (x, y), frame_img)

def draw_human_death_frame(sheet, x_offset, row, frame, skin, colors):
    """Draw death animation frame"""
    x = x_offset * FRAME_SIZE
    y = row * FRAME_SIZE
    
    frame_img = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame_img)
    
    center_x, center_y = 32, 32 + frame * 2
    
    # Character falls and fades
    opacity = 255 - frame * 40
    draw.rectangle([center_x - 6, center_y - 4, center_x + 6, center_y + 4], 
                  fill=colors['primary'] + (opacity,))
    
    sheet.paste(frame_img, (x, y), frame_img)


if __name__ == "__main__":
    output_dir_dragons = "d:/NFTagachi/frontend/public/premium_sprites/dragons"
    output_dir_humans = "d:/NFTagachi/frontend/public/premium_sprites/humans"
    
    os.makedirs(output_dir_dragons, exist_ok=True)
    os.makedirs(output_dir_humans, exist_ok=True)
    
    print("Generating Premium Dragon Sprite Sheets...")
    create_dragon_sprite_sheet('fire', f"{output_dir_dragons}/fire_dragon_sheet.png")
    create_dragon_sprite_sheet('ice', f"{output_dir_dragons}/ice_dragon_sheet.png")
    create_dragon_sprite_sheet('shadow', f"{output_dir_dragons}/shadow_dragon_sheet.png")
    create_dragon_sprite_sheet('storm', f"{output_dir_dragons}/storm_dragon_sheet.png")
    
    print("\nGenerating Human Character Sprite Sheets...")
    create_human_sprite_sheet('dark', 'warrior', f"{output_dir_humans}/human_dark_warrior.png")
    create_human_sprite_sheet('dark', 'mage', f"{output_dir_humans}/human_dark_mage.png")
    create_human_sprite_sheet('dark', 'rogue', f"{output_dir_humans}/human_dark_rogue.png")
    create_human_sprite_sheet('light', 'knight', f"{output_dir_humans}/human_light_knight.png")
    create_human_sprite_sheet('light', 'ranger', f"{output_dir_humans}/human_light_ranger.png")
    create_human_sprite_sheet('light', 'cleric', f"{output_dir_humans}/human_light_cleric.png")
    
    print("\n✓ All premium sprite sheets generated successfully!")
