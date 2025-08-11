#hugging face util
from dotenv import load_dotenv
import os
import base64
import requests
from transformers import pipeline
from PIL import Image
import io

load_dotenv()

HF_KEY = os.environ.get('HF_KEY')

from PIL import Image
import colorsys
from collections import Counter

def analyze_colors(img_path):
    try:
        if isinstance(img_path, bytes):
            image = Image.open(io.BytesIO(img_path))
        else:
            image = Image.open(img_path)
            
        image = image.convert('RGB')
        
        max_size = 150
        if image.size[0] > max_size or image.size[1] > max_size:
            image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        pixels = list(image.getdata())
        
        quantized_colors = []
        for r, g, b in pixels:
            quantized_r = (r // 32) * 32
            quantized_g = (g // 32) * 32
            quantized_b = (b // 32) * 32
            quantized_colors.append((quantized_r, quantized_g, quantized_b))
        
        color_counts = Counter(quantized_colors)
        
        dominant_colors = color_counts.most_common(10)
        
        hex_colors = []
        for (r, g, b), count in dominant_colors:
            if r + g + b < 50:
                continue
            if r + g + b > 700:
                continue
                
            hex_color = '#{:02x}{:02x}{:02x}'.format(r, g, b)
            hex_colors.append(hex_color)
            
            # Limit to top 5 colors
            if len(hex_colors) >= 5:
                break
        
        return hex_colors
        
    except FileNotFoundError:
        print(f"Error: Image file not found: {img_path}")
        return None
    except Exception as e:
        print(f"Error analyzing colors: {e}")
        return None

def get_color(colors):
   
    if not colors:
        print("No colors provided")
        return "unknown"
    
    print(f"Analyzing {len(colors)} colors: {colors}")
    
    color_scores = {"red": 0, "blue": 0, "green": 0}
    
    for i, hex_color in enumerate(colors):
        hex_color = hex_color.lstrip('#')
        
        if len(hex_color) != 6:
            print(f"Invalid hex color: {hex_color}")
            continue
            
        try:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16) 
            b = int(hex_color[4:6], 16)
            
            print(f"Color #{i+1}: #{hex_color} -> RGB({r}, {g}, {b})")
            
            weight = 1.0 / (i + 1)
            
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            h = h * 360  # Convert to degrees
            
            print(f"  HSV: H={h:.1f}°, S={s:.2f}, V={v:.2f}")
            
            # More lenient thresholds for saturation and brightness
            if s < 0.2 or v < 0.2:
                print(f"  Skipped: too low saturation ({s:.2f}) or brightness ({v:.2f})")
                continue
            
            # Broader hue ranges for better detection
            color_detected = False
            if (h >= 330 or h <= 30):  # Expanded red range
                color_scores["red"] += weight * s * v
                print(f"  RED detected! Score += {weight * s * v:.3f}")
                color_detected = True
            elif 180 <= h <= 270:  # Expanded blue range
                color_scores["blue"] += weight * s * v
                print(f"  BLUE detected! Score += {weight * s * v:.3f}")
                color_detected = True
            elif 60 <= h <= 180:  # Expanded green range
                color_scores["green"] += weight * s * v
                print(f"  GREEN detected! Score += {weight * s * v:.3f}")
                color_detected = True
            
            if not color_detected:
                print(f"  No game color detected (hue {h:.1f}° not in ranges)")
                
        except ValueError as e:
            print(f"Error processing color {hex_color}: {e}")
            continue
    
    # Find the color with highest score
    max_color = max(color_scores, key=color_scores.get)
    max_score = color_scores[max_color]
    
    print(f"Final color scores: Red={color_scores['red']:.3f}, Blue={color_scores['blue']:.3f}, Green={color_scores['green']:.3f}")
    
    # Lower threshold for detection
    if max_score > 0.05:
        print(f"Dominant color detected: {max_color}")
        return max_color
    else:
        # Fallback: simple RGB dominance check
        print("HSV method found no colors, trying simple RGB dominance...")
        return simple_rgb_check(colors)

def simple_rgb_check(colors):
    """
    Simple fallback method using RGB values directly
    """
    for hex_color in colors:
        hex_color = hex_color.lstrip('#')
        if len(hex_color) != 6:
            continue
            
        try:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16) 
            b = int(hex_color[4:6], 16)
            
            print(f"RGB check: #{hex_color} -> R={r}, G={g}, B={b}")
            
            # Simple dominance with lower thresholds
            if r > g + 30 and r > b + 30 and r > 80:
                print(f"  RED dominant!")
                return "red"
            elif b > r + 30 and b > g + 30 and b > 80:
                print(f"  BLUE dominant!")
                return "blue"
            elif g > r + 30 and g > b + 30 and g > 80:
                print(f"  GREEN dominant!")
                return "green"
                
        except ValueError:
            continue
    
    print("No dominant red, blue, or green color found")
    return "unknown"

def test_color_extraction(img_path):
    """
    Test function to see what colors are being extracted
    """
    print(f"Analyzing image: {img_path}")
    
    colors = analyze_colors(img_path)
    
    if colors:
        print(f"Extracted colors: {colors}")
        dominant_color = get_color(colors)
        print(f"Final result: {dominant_color}")
        return dominant_color
    else:
        print("No colors could be extracted")
        return "unknown"
    
# get_color(analyze_colors('test2.jpg'))