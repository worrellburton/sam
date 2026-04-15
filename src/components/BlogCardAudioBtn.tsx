"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Inline play/pause button rendered on each blog index card. Probes for
// the existence of /audio/<slug>.mp3 on mount and silently hides itself
// if the file isn't served, so posts without audio render cleanly.
export function BlogCardAudioBtn({ slug }: { slug: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const src = `/audio/${slug}.mp3`;

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "none";
    audio.src = src;

    const onCanPlay = () => setAvailable(true);
    const onError = () => setAvailable(false);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audio.removeAttribute("src");
    };
  }, [src]);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!audioRef.current) return;
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        document.querySelectorAll("audio").forEach((a) => {
          a.pause();
        });
        void audioRef.current.play();
        setPlaying(true);
      }
    },
    [playing],
  );

  if (available === false || available === null) return null;

  return (
    <button
      className={`blog-card-play${playing ? " is-playing" : ""}`}
      onClick={toggle}
      aria-label={playing ? "Pause audio" : "Listen to article"}
      title={playing ? "Pause" : "Listen"}
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="6 3 20 12 6 21" />
        </svg>
      )}
      <span>{playing ? "Playing" : "Listen"}</span>
    </button>
  );
}
