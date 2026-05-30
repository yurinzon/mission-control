import os
import subprocess
import json

def create_reels_video(image_paths, text_overlays=None, output_path="reels_output.mp4", duration_per_image=5, audio_path=None):
    """
    Creates a vertical (9:16) Reels video from a list of images using FFmpeg.
    If drawtext is available, it applies text overlays. Otherwise, it generates a clean video slideshow
    allowing the user to overlay native text in Instagram (which is better for SEO and algorithm reach).
    """
    # 1. Create a temporary file list for FFmpeg concat
    concat_list_path = "temp_inputs.txt"
    with open(concat_list_path, "w") as f:
        for img in image_paths:
            f.write(f"file '{os.path.abspath(img)}'\n")
            f.write(f"duration {duration_per_image}\n")
        # FFmpeg concat needs the last file repeated to register duration
        if image_paths:
            f.write(f"file '{os.path.abspath(image_paths[-1])}'\n")

    # 2. Build scale & crop filter to make it a perfect 9:16 vertical video (1080x1920)
    scale_filter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"

    # Try building with drawtext first
    if text_overlays and len(text_overlays) == len(image_paths):
        drawtext_filters = []
        for idx, text in enumerate(text_overlays):
            start_time = idx * duration_per_image
            end_time = start_time + duration_per_image
            opacity_expr = f"if(lt(t,{start_time}+1), (t-{start_time})/1, if(lt(t,{end_time}-1), 1, ({end_time}-t)/1))"
            safe_text = text.replace(":", "\\:").replace("'", "").replace('"', '')
            drawtext_filters.append(
                f"drawtext=text='{safe_text}':fontcolor=white:fontsize=48:"
                f"x=(w-text_w)/2:y=(h-text_h)/2-100:"
                f"box=1:boxcolor=black@0.4:boxborderw=30:"
                f"alpha='{opacity_expr}':enable='between(t,{start_time},{end_time})'"
              )
        full_video_filter = f"{scale_filter},{','.join(drawtext_filters)}"
    else:
        full_video_filter = scale_filter

    def run_ffmpeg(video_filter):
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list_path
        ]
        if audio_path and os.path.exists(audio_path):
            cmd.extend(["-i", audio_path, "-map", "0:v", "-map", "1:a", "-shortest"])
        else:
            cmd.extend(["-map", "0:v"])
            
        cmd.extend([
            "-vf", video_filter,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-r", "30",
            output_path
        ])
        print("Executing FFmpeg:", " ".join(cmd))
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result

    # Execution loop with fallback
    result = run_ffmpeg(full_video_filter)
    if result.returncode == 0:
        print("Video generated successfully.")
        return True
    else:
        # Check if error is due to missing drawtext
        if "No such filter: 'drawtext'" in result.stderr or "Filter not found" in result.stderr:
            print("FFmpeg lacks 'drawtext' filter. Falling back to clean slideshow video (recommended for native IG text).")
            # Fallback to pure vertical scale/crop slideshow
            fallback_result = run_ffmpeg(scale_filter)
            if fallback_result.returncode == 0:
                print("Fallback video generated successfully.")
                return True
            else:
                print("Fallback FFmpeg error:", fallback_result.stderr)
                return False
        else:
            print("FFmpeg error:", result.stderr)
            return False
            
    if os.path.exists(concat_list_path):
        os.remove(concat_list_path)
