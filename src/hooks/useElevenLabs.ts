"use client";
import { useState, useCallback, useRef } from "react";

const API_BASE = "https://api.elevenlabs.io/v1";
const VOICE_ID = "UgBBYS2sOqTuMpoF3BR0"; // Mark - Natural Conversations
const MODEL_ID = "eleven_multilingual_v2";

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "";
}

export interface AudioState {
  status: "idle" | "generating" | "ready" | "playing" | "paused" | "error";
  audioUrl: string | null;
  error: string | null;
  progress: number;
}

export function useElevenLabs() {
  const [state, setState] = useState<AudioState>({
    status: "idle",
    audioUrl: null,
    error: null,
    progress: 0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const generateAudio = useCallback(async (text: string, cacheKey?: string) => {
    const key = cacheKey || text.slice(0, 50);

    // Check cache
    if (cacheRef.current.has(key)) {
      setState({
        status: "ready",
        audioUrl: cacheRef.current.get(key)!,
        error: null,
        progress: 100,
      });
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      setState({
        status: "error",
        audioUrl: null,
        error: "No ElevenLabs API key configured",
        progress: 0,
      });
      return;
    }

    setState({ status: "generating", audioUrl: null, error: null, progress: 10 });

    // Strip HTML and clean up text for speech
    const cleanText = text
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Truncate to ~5000 chars to stay within limits
    const truncated = cleanText.length > 5000 ? cleanText.slice(0, 5000) + "..." : cleanText;

    try {
      setState((prev) => ({ ...prev, progress: 30 }));

      const res = await fetch(`${API_BASE}/text-to-speech/${VOICE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: truncated,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            speed: 0.95,
          },
        }),
      });

      setState((prev) => ({ ...prev, progress: 70 }));

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.detail?.message || errData?.message || `API error: ${res.status}`
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      cacheRef.current.set(key, url);

      setState({ status: "ready", audioUrl: url, error: null, progress: 100 });
    } catch (err) {
      setState({
        status: "error",
        audioUrl: null,
        error: err instanceof Error ? err.message : "Failed to generate audio",
        progress: 0,
      });
    }
  }, []);

  const play = useCallback(() => {
    if (!state.audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(state.audioUrl);
      audioRef.current.addEventListener("ended", () => {
        setState((prev) => ({ ...prev, status: "ready" }));
      });
    } else {
      audioRef.current.src = state.audioUrl;
    }
    audioRef.current.play();
    setState((prev) => ({ ...prev, status: "playing" }));
  }, [state.audioUrl]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((prev) => ({ ...prev, status: "paused" }));
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((prev) => ({ ...prev, status: "ready" }));
  }, []);

  const togglePlayback = useCallback(() => {
    if (state.status === "playing") pause();
    else if (state.status === "paused" || state.status === "ready") play();
  }, [state.status, play, pause]);

  return {
    ...state,
    generateAudio,
    play,
    pause,
    stop,
    togglePlayback,
    audioRef,
  };
}
