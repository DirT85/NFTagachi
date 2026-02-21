from PIL import Image
import os

path = r'd:\NFTagachi\generators\ai_base_chars\good1_000.png'
img = Image.open(path).convert("RGB")
w, h = img.size
print(f"Size: {w}x{h}")
print(f"Top-Left (0,0): {img.getpixel((0,0))}")
print(f"Near Edge (5,5): {img.getpixel((5,5))}")
print(f"Top-Mid ({w//2}, 0): {img.getpixel((w//2, 0))}")
print(f"Top-Mid Edge ({w//2}, 5): {img.getpixel((w//2, 5))}")
