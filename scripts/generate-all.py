#!/usr/bin/env python3
"""
Generate blog audio: voice (with intro) + background music, mixed with ffmpeg.
Usage: python3 scripts/generate-all.py
"""

import sys, json, subprocess, os, time

AUDIO_DIR = "public/audio"
TMP_DIR = "/tmp/blog-audio"
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

API_KEY = "sk_2919a6bb906e5329bd3920568b712e5215227e742bedaccb"
VOICE_ID = "UgBBYS2sOqTuMpoF3BR0"  # Mark
MODEL_ID = "eleven_multilingual_v2"
MUSIC_PROMPT = (
    "Gentle warm clinical ambient instrumental. Soft piano and strings with subtle pads. "
    "Optimistic reassuring healthcare tone. Slow tempo calm professional. "
    "No vocals. Podcast background music."
)


def generate_voice(text, outfile):
    """Generate TTS via ElevenLabs."""
    payload = json.dumps({
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.3,
            "speed": 0.95,
        },
    })
    result = subprocess.run([
        "curl", "-s", "-o", outfile, "-w", "%{http_code}",
        "-X", "POST",
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
        "-H", "Content-Type: application/json",
        "-H", f"xi-api-key: {API_KEY}",
        "-d", payload,
    ], capture_output=True, text=True, timeout=120)
    return result.stdout.strip() == "200" and os.path.getsize(outfile) > 1000


def get_duration_ms(filepath):
    """Get audio duration in ms using ffprobe."""
    try:
        out = subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "csv=p=0", filepath
        ], text=True).strip()
        return int(float(out) * 1000)
    except Exception:
        return 120000  # default 2 min


def generate_music(duration_ms, outfile):
    """Generate instrumental music via ElevenLabs Music API."""
    # Clamp to API limits: 3s-600s
    duration_ms = max(3000, min(600000, duration_ms))
    payload = json.dumps({
        "prompt": MUSIC_PROMPT,
        "music_length_ms": duration_ms,
        "force_instrumental": True,
    })
    result = subprocess.run([
        "curl", "-s", "-o", outfile, "-w", "%{http_code}",
        "-X", "POST",
        "https://api.elevenlabs.io/v1/music/compose",
        "-H", "Content-Type: application/json",
        "-H", f"xi-api-key: {API_KEY}",
        "-d", payload,
    ], capture_output=True, text=True, timeout=300)
    return result.stdout.strip() == "200" and os.path.getsize(outfile) > 1000


def mix_audio(voice_path, music_path, out_path):
    """Mix voice + music with ffmpeg. Voice full volume, music at 12%."""
    subprocess.run([
        "ffmpeg", "-y", "-i", voice_path, "-i", music_path,
        "-filter_complex",
        "[1:a]volume=0.12[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[out]",
        "-map", "[out]", "-codec:a", "libmp3lame", "-q:a", "4", out_path,
    ], capture_output=True, timeout=120)
    return os.path.exists(out_path) and os.path.getsize(out_path) > 1000


def process_post(post):
    slug = post["slug"]
    text = post["text"]
    final_path = f"{AUDIO_DIR}/{slug}.mp3"
    voice_path = f"{TMP_DIR}/{slug}_voice.mp3"
    music_path = f"{TMP_DIR}/{slug}_music.mp3"

    # Step 1: Generate voice
    print(f"  🎙  Voice...", end="", flush=True)
    if not generate_voice(text, voice_path):
        print(" FAILED")
        return False
    voice_kb = os.path.getsize(voice_path) // 1024
    print(f" {voice_kb}KB", end="", flush=True)

    # Step 2: Get voice duration, generate matching music (+ 5s buffer)
    voice_dur = get_duration_ms(voice_path)
    music_dur = voice_dur + 5000
    print(f"  🎵  Music ({music_dur // 1000}s)...", end="", flush=True)
    if not generate_music(music_dur, music_path):
        print(" FAILED — saving voice-only")
        os.rename(voice_path, final_path)
        return True

    music_kb = os.path.getsize(music_path) // 1024
    print(f" {music_kb}KB", end="", flush=True)

    # Step 3: Mix
    print(f"  🔀  Mix...", end="", flush=True)
    if not mix_audio(voice_path, music_path, final_path):
        print(" FAILED — saving voice-only")
        os.rename(voice_path, final_path)
        return True

    final_kb = os.path.getsize(final_path) // 1024
    print(f" ✅ {final_kb}KB")

    # Cleanup
    for f in [voice_path, music_path]:
        if os.path.exists(f):
            os.remove(f)

    return True


def main():
    # Extract blog posts
    result = subprocess.run(
        ["node", "scripts/extract-blog-texts.mjs"],
        capture_output=True, text=True
    )
    posts = json.loads(result.stdout)

    print(f"\n📝 {len(posts)} blog posts")
    print(f"🎤 Voice: Mark (Natural Conversations) + intro lines")
    print(f"🎵 Music: Clinical ambient instrumental via ElevenLabs")
    print(f"🔀 Mix: Voice + Music via ffmpeg\n")

    # Remove old files to regenerate
    for post in posts:
        old = f"{AUDIO_DIR}/{post['slug']}.mp3"
        if os.path.exists(old):
            os.remove(old)

    success = 0
    failed = 0

    for i, post in enumerate(posts):
        ep = f"EP.{post['episode']}" if post.get("episode") else "Guide"
        print(f"[{i + 1}/{len(posts)}] {ep} — {post['slug']}")

        ok = process_post(post)
        if ok:
            success += 1
        else:
            failed += 1

        # Rate limit between posts
        if i < len(posts) - 1:
            time.sleep(2)

    print(f"\n🎉 Done! {success} generated, {failed} failed out of {len(posts)} total\n")


if __name__ == "__main__":
    main()
