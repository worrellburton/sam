#!/bin/bash
# Generate ElevenLabs TTS audio for all blog posts using curl
# Usage: bash scripts/generate-audio-curl.sh

API_KEY="sk_2919a6bb906e5329bd3920568b712e5215227e742bedaccb"
VOICE_ID="UgBBYS2sOqTuMpoF3BR0"
MODEL_ID="eleven_multilingual_v2"
AUDIO_DIR="public/audio"

mkdir -p "$AUDIO_DIR"

generate() {
  local slug="$1"
  local text="$2"
  local outfile="$AUDIO_DIR/${slug}.mp3"

  if [ -f "$outfile" ]; then
    echo "✅ Already exists: ${slug}.mp3"
    return 0
  fi

  echo "🎙  Generating: ${slug}..."

  # Escape text for JSON
  local escaped=$(echo "$text" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))")

  local http_code
  http_code=$(curl -s -o "$outfile" -w "%{http_code}" \
    -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
    -H "Content-Type: application/json" \
    -H "xi-api-key: ${API_KEY}" \
    -d "{\"text\":${escaped},\"model_id\":\"${MODEL_ID}\",\"voice_settings\":{\"stability\":0.5,\"similarity_boost\":0.75,\"style\":0.3,\"speed\":0.95}}")

  if [ "$http_code" = "200" ]; then
    local size=$(du -k "$outfile" | cut -f1)
    echo "✅ Saved: ${slug}.mp3 (${size} KB)"
    return 0
  else
    echo "❌ Failed ${slug}: HTTP ${http_code}"
    rm -f "$outfile"
    return 1
  fi
}

echo ""
echo "📝 Generating audio for all blog posts..."
echo "🎤 Voice: Mark (Natural Conversations)"
echo ""

SUCCESS=0
FAILED=0

