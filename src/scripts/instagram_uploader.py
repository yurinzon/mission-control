import os
import argparse
import json
from instagrapi import Client

def upload_instagram_reel(username, password, video_path, caption, cover_path=None, session_path="ig_session.json"):
    """
    Uploads a video to Instagram Reels using instagrapi.
    Uses session caching to prevent login blocks from Instagram.
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file not found: {video_path}")
        return False

    print(f"Initializing Instagram Client for @{username}...")
    cl = Client()
    cl.delay_range = [2, 5] # Add random delay to mimic human behavior and avoid rate limits

    # Load session if it exists to avoid continuous login requests
    session_loaded = False
    if os.path.exists(session_path):
        try:
            cl.load_settings(session_path)
            print("Session settings loaded from cache.")
            session_loaded = True
        except Exception as e:
            print("Failed to load cached session:", e)

    try:
        # Try verifying session or logging in
        if session_loaded:
            try:
                # Test if the session is still valid
                cl.get_timeline_feed()
                print("Session is valid. Logged in successfully.")
            except Exception:
                print("Cached session expired. Re-authenticating...")
                cl.login(username, password)
                cl.dump_settings(session_path)
                print("New session settings dumped to cache.")
        else:
            cl.login(username, password)
            cl.dump_settings(session_path)
            print("Logged in successfully and session settings cached.")
            
    except Exception as e:
        print("Login failed:", e)
        return False

    print(f"Uploading Reel: {video_path}...")
    try:
        # Uploading clip (Instagram Reels)
        # caption can support hashtags and mentions
        if cover_path and os.path.exists(cover_path):
            print(f"Uploading Reel with custom cover: {cover_path}...")
            media = cl.clip_upload(
                video_path,
                caption=caption,
                thumbnail=cover_path
            )
        else:
            print("Uploading Reel with auto-generated cover...")
            media = cl.clip_upload(
                video_path,
                caption=caption
            )
            
        print("SUCCESS! Reel uploaded successfully.")
        print(f"Media ID: {media.pk}")
        print(f"URL: https://www.instagram.com/p/{media.code}/")
        return True
    except Exception as e:
        print("Reel upload failed:", e)
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload Reels directly to Instagram.")
    parser.add_argument("--username", required=True, help="Instagram username")
    parser.add_argument("--password", required=True, help="Instagram password")
    parser.add_argument("--video", required=True, help="Path to video MP4 file")
    parser.add_argument("--caption", required=True, help="Caption for the Reel")
    parser.add_argument("--cover", help="Optional path to custom cover image")
    parser.add_argument("--session", default="ig_session.json", help="Path to save session settings")

    args = parser.parse_args()
    
    success = upload_instagram_reel(
        username=args.username,
        password=args.password,
        video_path=args.video,
        caption=args.caption,
        cover_path=args.cover,
        session_path=args.session
    )
    
    if success:
        exit(0)
    else:
        exit(1)
