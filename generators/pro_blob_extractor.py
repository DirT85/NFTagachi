from PIL import Image, ImageDraw
import os
import collections

# Path Configuration
BASE_DIR = r"d:\NFTagachi\generators"
SOURCE_DIR = r"d:\NFTagachi\frontend\public"
OUTPUT_DIR = os.path.join(BASE_DIR, "ai_base_chars")
GRIDS = ["good1.jpg", "good2.jpg"]
MIN_BLOB_SIZE = 30 

def is_background_simple(r, g, b):
    # Broad check for the magenta background
    if r > 100 and b > 90 and g < 120: return True
    # Broad check for the dark separator lines
    if r < 85 and g < 85 and b < 85: return True
    return False

def get_blobs(img_path):
    img = Image.open(img_path).convert("RGB")
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    blobs = []
    
    for y in range(0, height, 4): 
        for x in range(0, width, 4):
            if (x, y) in visited: continue
            
            r, g, b = pixels[x, y]
            if not is_background_simple(r, g, b):
                # BFS to find bounds
                q = collections.deque([(x, y)])
                visited.add((x, y))
                
                min_x, min_y = x, y
                max_x, max_y = x, y
                
                while q:
                    cx, cy = q.popleft()
                    min_x = min(min_x, cx); min_y = min(min_y, cy)
                    max_x = max(max_x, cx); max_y = max(max_y, cy)
                    
                    for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                            nr, ng, nb = pixels[nx, ny]
                            if not is_background_simple(nr, ng, nb):
                                visited.add((nx, ny))
                                q.append((nx, ny))
                
                if (max_x - min_x) > 20 and (max_y - min_y) > 20:
                    blobs.append({'bbox': (min_x, min_y, max_x, max_y)})
    return blobs

def process_grids():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    count = 0
    for grid_name in GRIDS:
        grid_path = os.path.join(SOURCE_DIR, grid_name)
        if not os.path.exists(grid_path): continue
        
        print(f"Extracting Raw Islands from {grid_name}...")
        blobs = get_blobs(grid_path)
        blobs.sort(key=lambda b: (b['bbox'][1] // 150, b['bbox'][0]))
        
        img = Image.open(grid_path).convert("RGB")
        prefix = grid_name.replace(".jpg", "")
        for i, blob in enumerate(blobs):
            x1, y1, x2, y2 = blob['bbox']
            # PADDING is critical for matte pass later
            crop = img.crop((max(0, x1-10), max(0, y1-10), min(img.width, x2+10), min(img.height, y2+10)))
            output_name = f"{prefix}_{i:03d}.png"
            crop.save(os.path.join(OUTPUT_DIR, output_name))
            count += 1
    print(f"Extracted {count} Raw Islands.")

if __name__ == "__main__":
    process_grids()
