from PIL import Image

PATH = r"d:\NFTagachi\generators\lpc_assets\spritesheets\head\heads\human\female\walk\amber.png"

def inspect_row_2():
    try:
        img = Image.open(PATH).convert("RGBA")
        # Row 2 (0-indexed) -> y=128 to 192
        start_y = 128
        end_y = 192
        crop = img.crop((0, start_y, 576, end_y))
        
        pixels = list(crop.getdata())
        non_transparent = [p for p in pixels if p[3] > 0]
        
        print(f"Total Pixels in Row 2: {len(pixels)}")
        print(f"Non-Transparent Pixels: {len(non_transparent)}")
        
        if len(non_transparent) == 0:
            print("ALERT: Row 2 IS EMPTY!")
        else:
            print("Row 2 has content.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_row_2()
