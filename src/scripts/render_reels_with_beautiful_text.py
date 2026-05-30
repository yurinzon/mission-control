import sys
import os

sys.path.append("./projects/mission-control/src/scripts")
from reels_text_renderer import render_reels_video_with_text

# Exact visual sequence for the narrative
image_paths = [
    "/Users/yurismacbook/.hermes/image_cache/img_a0501751dafa.jpg", # 1. Face down
    "/Users/yurismacbook/.hermes/image_cache/img_482e3465d6b7.jpg", # 2. All face up
    "/Users/yurismacbook/.hermes/image_cache/img_f7dd56f4c5d7.jpg", # 3. 7 of Cups (Brown)
    "/Users/yurismacbook/.hermes/image_cache/img_bdea2367535b.jpg", # 4. 8 of Pentacles (Green)
    "/Users/yurismacbook/.hermes/image_cache/img_3cec85a1aef3.jpg"  # 5. Ace of Wands (Blue)
]

# Texts for each slide (Supporting Hebrew!)
text_overlays = [
    "בחר קלף // PICK A CARD\nהתבונן באבנים ובחר את התשובה שלך",
    "ההתגלות // THE REVEAL\nאיזה מסר קוסמי חיכה לתת-המודע שלך?",
    "קלף 1: האבן החומה // 7 of Cups\nאשליית הבחירה. שבור את האשליה והתמקד",
    "קלף 2: האבן הירוקה // 8 of Pentacles\nאומנות יומיומית. התמדה בבנייה ובליטוש",
    "קלף 3: האבן הכחולה // Ace of Wands\nניצוץ של בריאה. הלהבה בוערת - צא לדרך!"
]

output_video_path = "/Users/yurismacbook/the volt/The Volt/Kassitarot/pick_a_card_reels_animated_text.mp4"

os.makedirs(os.path.dirname(output_video_path), exist_ok=True)

print("Starting high-end video generation with animated text overlays...")
success = render_reels_video_with_text(
    image_paths=image_paths,
    text_overlays=text_overlays,
    output_path=output_video_path,
    duration_per_image=5,
    fps=30
)

if success:
    print(f"SUCCESS: Animated text video generated at {output_video_path}")
else:
    print("FAILED: Video generation failed.")
