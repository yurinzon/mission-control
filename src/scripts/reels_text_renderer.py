import os
import shutil
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def draw_wrapped_text(draw, text, font, max_width, start_y, line_spacing=10, fill=(255, 255, 255, 255)):
    """
    Draws text wrapped to a maximum width, centered horizontally.
    """
    words = text.split(" ")
    lines = []
    current_line = []
    
    for word in words:
        # Check if newline is explicitly specified
        if "\\n" in word or "\n" in word:
            parts = word.split("\\n") if "\\n" in word else word.split("\n")
            current_line.append(parts[0])
            lines.append(" ".join(current_line))
            current_line = [parts[1]]
        else:
          # Try appending word and check width
          test_line = " ".join(current_line + [word])
          # Get text bbox
          bbox = draw.textbbox((0, 0), test_line, font=font)
          w = bbox[2] - bbox[0]
          if w <= max_width:
              current_line.append(word)
          else:
              lines.append(" ".join(current_line))
              current_line = [word]
              
    if current_line:
        lines.append(" ".join(current_line))
        
    y = start_y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        x = (1080 - w) / 2
        draw.text((x, y), line, font=font, fill=fill)
        y += h + line_spacing
        
    return y

def get_system_font(size=40):
    """
    Finds a suitable system font on macOS.
    """
    fonts_to_try = [
        "/System/Library/Fonts/Supplemental/Arial Hebrew.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Cache/Arial.ttf"
    ]
    for fp in fonts_to_try:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                continue
    return ImageFont.load_default()

def render_reels_video_with_text(image_paths, text_overlays, output_path="reels_output_text.mp4", duration_per_image=5, fps=30, audio_path=None):
    """
    Compiles a stunning vertical 1080x1920 video with smooth text fade-in and fade-out animations.
    """
    temp_frames_dir = "temp_reels_frames"
    if os.path.exists(temp_frames_dir):
        shutil.rmtree(temp_frames_dir)
    os.makedirs(temp_frames_dir)

    font_large = get_system_font(size=46)
    
    total_frame_count = 0
    frames_per_image = duration_per_image * fps
    
    # Timing for text fade animation (in frames)
    fade_duration = fps * 1 # 1 second fade in/out
    
    print(f"Pre-rendering {len(image_paths)} slides ({len(image_paths) * frames_per_image} frames at {fps} fps)...")
    
    for slide_idx, img_path in enumerate(image_paths):
        if not os.path.exists(img_path):
            print(f"Warning: Image not found {img_path}")
            continue
            
        # Load and scale/crop image to 1080x1920 (Vertical Reels Standard)
        orig_img = Image.open(img_path).convert("RGBA")
        
        # Calculate aspect ratios and crop centrally
        target_w, target_h = 1080, 1920
        orig_w, orig_h = orig_img.size
        
        scale = max(target_w / orig_w, target_h / orig_h)
        new_w = int(orig_w * scale)
        new_h = int(orig_h * scale)
        
        scaled_img = orig_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Center crop
        left = (new_w - target_w) / 2
        top = (new_h - target_h) / 2
        right = left + target_w
        bottom = top + target_h
        
        base_frame = scaled_img.crop((left, top, right, bottom))
        
        text = text_overlays[slide_idx] if text_overlays and slide_idx < len(text_overlays) else ""
        
        for f in range(frames_per_image):
            # Create a semi-transparent overlay for text compositing
            txt_layer = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
            draw = ImageDraw.Draw(txt_layer)
            
            # Calculate alpha (fade-in for 1s, stay 3s, fade-out 1s)
            alpha = 255
            if f < fade_duration:
                # Fade in
                alpha = int((f / fade_duration) * 255)
            elif f > (frames_per_image - fade_duration):
                # Fade out
                frames_from_end = frames_per_image - f
                alpha = int((frames_from_end / fade_duration) * 255)
                
            # Draw elegant background blur or glass capsule for readability
            if text:
                # Centered box coordinates
                box_x1, box_y1 = 80, 1300
                box_x2, box_y2 = 1000, 1650
                
                # Draw rounded rectangle container with double-bezel style (white/10 border, dark glass back)
                box_alpha = int((alpha / 255) * 160) # max 160 opacity (out of 255)
                draw.rounded_rectangle(
                    [box_x1, box_y1, box_x2, box_y2], 
                    radius=35, 
                    fill=(0, 0, 0, box_alpha), 
                    outline=(255, 255, 255, int((alpha / 255) * 50)), 
                    width=2
                )
                
                # Draw wrapped text inside the capsule
                draw_wrapped_text(
                    draw, 
                    text, 
                    font_large, 
                    max_width=800, 
                    start_y=1340, 
                    line_spacing=12,
                    fill=(255, 255, 255, alpha)
                )
                
            # Composite text layer onto base image frame
            composite_frame = Image.alpha_composite(base_frame, txt_layer).convert("RGB")
            
            # Save frame
            frame_name = f"frame_{total_frame_count:05d}.png"
            composite_frame.save(os.path.join(temp_frames_dir, frame_name))
            total_frame_count += 1

    # 3. Compile frames using FFmpeg
    print("Compiling video frames via FFmpeg...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-r", str(fps),
        "-i", os.path.join(temp_frames_dir, "frame_%05d.png")
    ]
    
    if audio_path and os.path.exists(audio_path):
        ffmpeg_cmd.extend(["-i", audio_path, "-map", "0:v", "-map", "1:a", "-shortest"])
    else:
        ffmpeg_cmd.extend(["-map", "0:v"])
        
    ffmpeg_cmd.extend([
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        output_path
    ])
    
    print("Executing FFmpeg command:", " ".join(ffmpeg_cmd))
    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    
    # Cleanup frames
    if os.path.exists(temp_frames_dir):
        shutil.rmtree(temp_frames_dir)
        
    if result.returncode == 0:
        print("Video generated successfully at:", output_path)
        return True
    else:
        print("FFmpeg compile error:", result.stderr)
        return False

if __name__ == "__main__":
    print("Reels Text Renderer module ready.")
