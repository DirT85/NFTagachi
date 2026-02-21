import os
import sys
from PIL import Image

def crop_grid(image_path, rows=12, cols=12, output_dir="ai_base_chars"):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found.")
        return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    img = Image.open(image_path)
    width, height = img.size
    
    cell_w = width // cols
    cell_h = height // rows
    
    count = 0
    for r in range(rows):
        for c in range(cols):
            left = c * cell_w
            top = r * cell_h
            right = left + cell_w
            bottom = top + cell_h
            
            # Crop the cell
            char_crop = img.crop((left, top, right, bottom))
            
            # Optional: Trim white borders and re-center?
            # For now, we save raw to maintain grid consistency
            
            output_name = f"grid_char_{count:03d}.png"
            output_path = os.path.join(output_dir, output_name)
            char_crop.save(output_path)
            count += 1
            
    print(f"Successfully extracted {count} characters to {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python crop_grid_assets.py <path_to_grid_image> [rows] [cols] [output_prefix]")
    else:
        path = sys.argv[1]
        rows = int(sys.argv[2]) if len(sys.argv) > 2 else 12
        cols = int(sys.argv[3]) if len(sys.argv) > 3 else 12
        prefix = sys.argv[4] if len(sys.argv) > 4 else "grid_char"
        
        def crop_grid_custom(image_path, rows, cols, output_dir="ai_base_chars", prefix="grid_char"):
            if not os.path.exists(image_path):
                print(f"Error: {image_path} not found.")
                return

            if not os.path.exists(output_dir):
                os.makedirs(output_dir)

            img = Image.open(image_path)
            width, height = img.size
            
            cell_w = width // cols
            cell_h = height // rows
            
            count = 0
            for r in range(rows):
                for c in range(cols):
                    left = c * cell_w
                    top = r * cell_h
                    right = left + cell_w
                    bottom = top + cell_h
                    
                    char_crop = img.crop((left, top, right, bottom))
                    output_name = f"{prefix}_{count:03d}.png"
                    output_path = os.path.join(output_dir, output_name)
                    char_crop.save(output_path)
                    count += 1
            print(f"Successfully extracted {count} characters to {output_dir}")

        crop_grid_custom(path, rows, cols, prefix=prefix)
