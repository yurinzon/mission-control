import sys
import os

sys.path.append("./projects/mission-control/src/scripts")
from reels_generator import create_reels_video

# Exactly ordered images to build the perfect narrative flow:
# 1. Face down cards (Hook / The Choice)
# 2. Face up cards (The Reveal / Overview)
# 3. Close up: 7 of Cups (Stone 1 / Brown)
# 4. Close up: 8 of Pentacles (Stone 2 / Green)
# 5. Close up: Ace of Wands (Stone 3 / Blue)
image_paths = [
    "/Users/yurismacbook/.hermes/image_cache/img_a0501751dafa.jpg", # 1. Face down cards
    "/Users/yurismacbook/.hermes/image_cache/img_482e3465d6b7.jpg", # 2. All cards revealed face up
    "/Users/yurismacbook/.hermes/image_cache/img_f7dd56f4c5d7.jpg", # 3. 7 of Cups (Brown)
    "/Users/yurismacbook/.hermes/image_cache/img_bdea2367535b.jpg", # 4. 8 of Pentacles (Green)
    "/Users/yurismacbook/.hermes/image_cache/img_3cec85a1aef3.jpg"  # 5. Ace of Wands (Blue)
]

# Captions mapping exactly to each slide
text_overlays = [
    "PICK A CARD\\nChoose your Stone: Brown, Green or Blue",
    "THE REVEAL\\nWhich message belongs to you?",
    "STONE 1: Brown\\n7 of Cups: Break illusions & Focus",
    "STONE 2: Green\\n8 of Pentacles: Dedicate to your Craft",
    "STONE 3: Blue\\nAce of Wands: Your Cosmic Spark is Lit"
]

output_video_path = "/Users/yurismacbook/the volt/The Volt/Kassitarot/pick_a_card_reels_fixed.mp4"

os.makedirs(os.path.dirname(output_video_path), exist_ok=True)

print("Starting video generation with correct sequence...")
success = create_reels_video(
    image_paths=image_paths,
    text_overlays=text_overlays,
    output_path=output_video_path,
    duration_per_image=5
)

if success:
    print(f"SUCCESS: Video generated at {output_video_path}")
else:
    print("FAILED: Video generation failed.")
