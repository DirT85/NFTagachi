import random

# CONFIG
SHEET_COLS = 13
SHEET_ROWS = 21 
FRAME_SIZE = 64
SCALE = 2 # 32x32 -> 64x64
SHEET_WIDTH = SHEET_COLS * FRAME_SIZE
SHEET_HEIGHT = SHEET_ROWS * FRAME_SIZE

# --- PALETTE ---
SKIN_TONES = ["#fca5a5", "#fcd34d", "#d4d4d8", "#a1a1aa", "#818cf8"]
ROBE_COLORS = ["#1e3a8a", "#4c1d95", "#be185d", "#065f46", "#9f1239"]
HAT_COLORS = ["#1e3a8a", "#4c1d95", "#be185d", "#065f46", "#9f1239"]

def hex_to_rgb_str(hex_color):
    return hex_color

# --- ASSETS (32x32 ASCII) ---
BODY_TEMPLATE = [
    "................................",
    "................................",
    "...........SSSSSS...............", 
    "..........SSSSSSSS..............",
    "..........SSSESESS..............", 
    "..........SSSSSSSS..............",
    "..........SSSSMSSS..............", 
    "...........SSSSSS...............", 
    "............NNNN................", 
    "..........BBBBBBBB..............", 
    ".........BBBBBBBBBB.............",
    ".........BBBBBBBBBB.............",
    ".........BBBBBBBBBB.............", 
    ".........WWWWWWWWWW.............", 
    ".........HHHHHHHHHH.............", 
    ".........LL......LL.............", 
    ".........LL......LL.............",
    ".........LL......LL.............",
    ".........LL......LL.............",
    ".........LL......LL.............",
    ".........FF......FF.............", 
    "................................",
    "................................"
]

ROBE_TEMPLATE = [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "............RRRR................", 
    "..........RRRRRRRR..............", 
    ".........RRRRRRRRRR.............",
    ".........RRRRRRRRRR.............",
    ".........RRRRRRRRRR.............", 
    ".........RRRRRRRRRR.............",
    ".........RRRRRRRRRR.............", 
    ".........RRRRRRRRRR.............",
    ".........RRRRRRRRRR.............",
    ".........RRRRRRRRRR.............",
    ".........RRRRRRRRRR.............",
    ".........RRRRRRRRRR.............", 
    "................................",
    "................................",
    "................................"
]

HAT_TEMPLATE = [
    "................................",
    "...........HHHHHH...............", 
    "..........HHHHHHHH..............",
    ".........HHHHHHHHHH.............", 
    "........HHHHHHHHHHHH............",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................"
]

# --- SVG BUFFER ---
class SvgBuffer:
    def __init__(self, w, h):
        self.w = w
        self.h = h
        # Store simple pixel map: (x,y) -> color
        # Optimizing: List of (x, y, w, h, color) logic handled at export
        self.pixels = {} 

    def put_rect(self, x, y, w, h, color):
        # We only support w=2, h=2 blocks from 32x32 scaling basically.
        # But we align to pixel grid.
        # Just store the block.
        # Key: (y, x) for easier RLE
        for dy in range(h):
            for dx in range(w):
                self.pixels[(y+dy, x+dx)] = color

    def save(self, filename):
        with open(filename, 'w') as f:
            f.write(f'<svg width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">')
            
            # Simple RLE optimization row by row
            for y in range(self.h):
                current_color = None
                run_start = -1
                
                for x in range(self.w):
                    color = self.pixels.get((y,x))
                    
                    if color != current_color:
                        if current_color is not None:
                            # End Run
                            width = x - run_start
                            f.write(f'<rect x="{run_start}" y="{y}" width="{width}" height="1" fill="{current_color}" />')
                        
                        current_color = color
                        run_start = x
                
                # End row run
                if current_color is not None:
                    width = self.w - run_start
                    f.write(f'<rect x="{run_start}" y="{y}" width="{width}" height="1" fill="{current_color}" />')

            f.write('</svg>')


def render_frame_to_buffer(buf, x_off, y_off, frame_idx, anim_type, colors):
    bob_y = 0
    l_leg_x = 0
    r_leg_x = 0
    robe_swish = 0
    
    if anim_type == "IDLE":
        if frame_idx % 2 == 1: bob_y = 1
        
    elif anim_type == "WALK":
        bob_y = 1 if frame_idx % 4 in [1, 2] else 0
        if frame_idx % 8 in [1, 2]: r_leg_x = 2; l_leg_x = -1
        elif frame_idx % 8 in [5, 6]: l_leg_x = 2; r_leg_x = -1
        robe_swish = 1 if frame_idx % 2 == 1 else -1

    layers = [
        (BODY_TEMPLATE, colors["skin"], "BODY"),
        (ROBE_TEMPLATE, colors["robe"], "ROBE"),
        (HAT_TEMPLATE, colors["hat"], "HAT")
    ]
    
    for template, color, layer_type in layers:
        for y, row in enumerate(template):
            for x, char in enumerate(row):
                if char == '.': continue
                
                draw_x = x
                draw_y = y + bob_y
                
                if y > 15:
                    if layer_type == "BODY":
                        if x < 16: draw_x += l_leg_x
                        else: draw_x += r_leg_x
                    elif layer_type == "ROBE":
                        if y > 18: draw_x += robe_swish
                
                if layer_type == "HAT":
                    draw_y = y + bob_y
                
                pixel_color = color
                if char == 'E': pixel_color = "#000000"
                if char == 'M': pixel_color = "#d97777"
                
                final_x = x_off + (draw_x * SCALE)
                final_y = y_off + (draw_y * SCALE)
                
                # Write 2x2 block
                buf.put_rect(final_x, final_y, SCALE, SCALE, pixel_color)

def generate_sheet(filename, seed):
    random.seed(seed)
    
    colors = {
        "skin": random.choice(SKIN_TONES),
        "robe": random.choice(ROBE_COLORS),
        "hat": random.choice(HAT_COLORS)
    }
    
    buf = SvgBuffer(SHEET_WIDTH, SHEET_HEIGHT)
    
    # ROW 10: IDLE (7 frames or more)
    for f in range(13):
        render_frame_to_buffer(buf, f * FRAME_SIZE, 10 * FRAME_SIZE, f, "IDLE", colors)

    # ROW 11: WALK (7 frames or more)
    for f in range(13):
        render_frame_to_buffer(buf, f * FRAME_SIZE, 11 * FRAME_SIZE, f, "WALK", colors)
        
    buf.save(filename)
    print(f"Generated {filename}")

if __name__ == "__main__":
    generate_sheet("d:/NFTagachi/frontend/public/wizard1.svg", 1) # Note .svg extension
    # generate_sheet("d:/NFTagachi/frontend/public/wizard2.svg", 2)
