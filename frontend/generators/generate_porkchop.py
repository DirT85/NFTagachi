from PIL import Image, ImageDraw
import os

# Ensure directory exists
output_dir = r"d:\NFTagachi\generators\lpc_assets\items"
os.makedirs(output_dir, exist_ok=True)

# Create a 64x64 transparent image (standard frame size)
img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Draw "Meat" (Reddish/Brown Ellipse)
# Center it roughly
draw.ellipse((20, 20, 50, 45), fill=(200, 60, 60, 255), outline=(100, 30, 30, 255))

# Draw "Bone" (White sticking out)
draw.line((25, 25, 15, 15), fill=(240, 240, 240, 255), width=4)
draw.ellipse((12, 12, 18, 18), fill=(240, 240, 240, 255))

# Save
output_path = os.path.join(output_dir, "porkchop.png")
img.save(output_path)
print(f"Created placeholder porkchop at {output_path}")
