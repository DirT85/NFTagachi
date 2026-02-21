from PIL import Image

def analyze_patch(img, bbox):
    patch = img.crop(bbox)
    pixels = list(patch.getdata())
    r_vals = [p[0] for p in pixels]
    g_vals = [p[1] for p in pixels]
    b_vals = [p[2] for p in pixels]
    
    print(f"BBox {bbox}:")
    print(f"  R: min={min(r_vals)}, max={max(r_vals)}, mean={sum(r_vals)/len(r_vals):.1f}")
    print(f"  G: min={min(g_vals)}, max={max(g_vals)}, mean={sum(g_vals)/len(g_vals):.1f}")
    print(f"  B: min={min(b_vals)}, max={max(b_vals)}, mean={sum(b_vals)/len(b_vals):.1f}")

img = Image.open(r'd:\NFTagachi\frontend\public\good1.jpg').convert('RGB')
analyze_patch(img, (10, 10, 60, 60)) # Pink Area
analyze_patch(img, (143, 10, 147, 100)) # Line Area
