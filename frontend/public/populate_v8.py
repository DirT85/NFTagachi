import shutil
import os

src = 'mini_placeholder.png'  # CHANGED to use the cropped 4x4 version
dest_dir = 'collection_v8'

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for i in range(300):
    shutil.copy(src, os.path.join(dest_dir, f'sheet_{i}.png'))

print(f"Populated {dest_dir} with 300 copies of {src} (4x4 Mini Format)")
