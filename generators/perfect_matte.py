from PIL import Image, ImageOps, ImageFilter
import os
import collections

BASE_DIR = r"d:\NFTagachi\generators"
RAW_DIR = os.path.join(BASE_DIR, "ai_base_chars")
TARGET_SIZE = 128

def is_magenta(p):
    r, g, b, a = p
    # Robust check for the pink/magenta background
    if r > 110 and b > 90 and r > g * 1.15 and b > g * 1.15:
        return True
    # Extra check for darker pink artifacts
    if r > 60 and b > 50 and r > g * 1.5 and b > g * 1.5:
        return True
    return False

def is_dark_line(p):
    r, g, b, a = p
    # Grid lines are very dark
    return r < 75 and g < 75 and b < 75

def perfect_matte(filename):
    path = os.path.join(RAW_DIR, filename)
    if not os.path.exists(path): return

    img = Image.open(path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # 1. Global Magenta Clearing (Robust)
    new_data = []
    for p in img.getdata():
        if is_magenta(p):
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(p)
    img.putdata(new_data)
    pixels = img.load() # Refresh
    
    # 2. Seeded BFS for Grid Lines
    # We clear any dark pixels connected to the corners
    visited = set()
    mask = Image.new("L", (width, height), 255)
    mask_pix = mask.load()
    
    q = collections.deque()
    for x in [0, 1, width-2, width-1]:
        for y in range(height):
            p = pixels[x, y]
            if p[3] == 0 or is_dark_line(p):
                q.append((x, y))
                visited.add((x, y))
                mask_pix[x, y] = 0
    for y in [0, 1, height-2, height-1]:
        for x in range(width):
            p = pixels[x, y]
            if p[3] == 0 or is_dark_line(p):
                if (x, y) not in visited:
                    q.append((x, y))
                    visited.add((x, y))
                    mask_pix[x, y] = 0
                    
    while q:
        cx, cy = q.popleft()
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                p = pixels[nx, ny]
                # Follow transparency (cleared magenta) OR dark lines
                if p[3] == 0 or is_dark_line(p):
                    visited.add((nx, ny))
                    mask_pix[nx, ny] = 0
                    q.append((nx, ny))
                    
    # Apply line mask
    mask_data = mask.getdata()
    final_data = []
    for i, p in enumerate(img.getdata()):
        if mask_data[i] == 0:
            final_data.append((0, 0, 0, 0))
        else:
            final_data.append(p)
    img.putdata(final_data)
    
    # 3. Final Trimming & Perfect Proportioning
    bbox = img.getbbox()
    if not bbox: return
    
    char = img.crop(bbox)
    cw, ch = char.size
    
    canvas = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
    limit = TARGET_SIZE - 20
    scale = min(limit / cw, limit / ch)
    if scale > 2.0: scale = 2.0 # Don't over-scale
    
    nw, nh = int(cw * scale), int(ch * scale)
    char = char.resize((nw, nh), Image.Resampling.LANCZOS)
    
    ox = (TARGET_SIZE - nw) // 2
    oy = (TARGET_SIZE - nh) // 2
    canvas.paste(char, (ox, oy), char)
    
    canvas.save(path, "PNG")
    print(f"Surgically Perfected: {filename}")

if __name__ == "__main__":
    files = [f for f in os.listdir(RAW_DIR) if f.endswith(".png")]
    for f in files:
        perfect_matte(f)
