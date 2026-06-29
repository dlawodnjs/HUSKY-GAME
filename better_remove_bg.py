import sys
from collections import deque
from PIL import Image

def remove_bg_floodfill(input_path, output_path, is_white_bg=True):
    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"Failed to open {input_path}: {e}")
        return
        
    pixels = img.load()
    w, h = img.size
    
    target_color = (255, 255, 255) if is_white_bg else (0, 255, 0)
    tolerance = 50 if is_white_bg else 150
    
    def color_dist(c1, c2):
        return abs(c1[0]-c2[0]) + abs(c1[1]-c2[1]) + abs(c1[2]-c2[2])

    visited = set()
    queue = deque()
    
    # Start from edges
    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h-1))
    for y in range(h):
        queue.append((0, y))
        queue.append((w-1, y))
        
    while queue:
        x, y = queue.popleft()
        if x < 0 or x >= w or y < 0 or y >= h:
            continue
        if (x, y) in visited:
            continue
            
        visited.add((x, y))
        p = pixels[x, y]
        if p[3] == 0: 
            # If already transparent, still explore to pass through existing transparent borders
            queue.append((x+1, y))
            queue.append((x-1, y))
            queue.append((x, y+1))
            queue.append((x, y-1))
            continue
        
        if color_dist(p[:3], target_color) <= tolerance:
            pixels[x, y] = (0, 0, 0, 0)
            queue.append((x+1, y))
            queue.append((x-1, y))
            queue.append((x, y+1))
            queue.append((x, y-1))
            
    img.save(output_path, "PNG")
    print(f"Processed {output_path}")

if __name__ == '__main__':
    # Generate clean transparent versions from originals
    remove_bg_floodfill("assets/husky_sprite.jpg", "assets/husky_sprite_transparent.png", True)
    remove_bg_floodfill("assets/husky_adult.jpg", "assets/husky_adult_transparent.png", False)
    
    # The emotion images are pngs, let's process them and overwrite
    remove_bg_floodfill("assets/husky_happy.png", "assets/husky_happy.png", True)
    remove_bg_floodfill("assets/husky_surprised.png", "assets/husky_surprised.png", True)
    remove_bg_floodfill("assets/husky_annoyed.png", "assets/husky_annoyed.png", True)
