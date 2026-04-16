"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Client-side audio player embedded in each blog post. Extracted from
// the (now server-rendered) /blog/[slug] page so the article body can
// stream as static HTML while the player hydrates separately.

export interface BlogAudioPlayerProps {
  slug: string;
}

type Status = "loading" | "ready" | "playing" | "paused" | "error";

export function BlogAudioPlayer({ slug }: BlogAudioPlayerProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval>>(undefined);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const localSrc = `/audio/${slug}.mp3`;

  useEffect(() => {
    const audio = new Audio(localSrc);
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => setStatus("ready"));
    audio.addEventListener("ended", () => {
      setStatus("ready");
      setCurrentTime(0);
    });
    audio.addEventListener("error", () => setStatus("error"));

    audio.load();

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [localSrc]);

  useEffect(() => {
    if (status === "playing" && audioRef.current) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
        }
      }, 250);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [status]);

  const play = useCallback(() => {
    if (!audioRef.current) return;
    void audioRef.current.play();
    setStatus("playing");
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const togglePlayback = useCallback(() => {
    if (status === "playing") pause();
    else play();
  }, [status, play, pause]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setStatus("ready");
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    const next = Math.max(
      0,
      Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration || 0),
    );
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  }, []);

  const cycleSpeed = useCallback(() => {
    const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, [playbackRate]);

  const seekTo = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * (audioRef.current.duration || 0);
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const formatTime = (s: number) => {
    if (!s || Number.isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (status === "loading") {
    return (
      <div className="blog-audio-player">
        <div className="blog-audio-inner">
          <div className="blog-audio-icon"><div className="blog-audio-spinner" /></div>
          <div className="blog-audio-content">
            <div className="blog-audio-label">Loading audio...</div>
            <div className="blog-audio-sub">Clinical Clarity &middot; Audio Edition</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") return null;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="blog-audio-player">
      <div className="blog-audio-inner">
        <button
          className="blog-audio-play-btn"
          onClick={togglePlayback}
          aria-label={status === "playing" ? "Pause" : "Play"}
        >
          {status === "playing" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21"/></svg>
          )}
        </button>

        <div className="blog-audio-content">
          <div className="blog-audio-top-row">
            <div className="blog-audio-label">
              {status === "ready" && currentTime === 0 && "Listen to this article"}
              {status === "ready" && currentTime > 0 && "Paused"}
              {status === "playing" && "Now playing"}
              {status === "paused" && "Paused"}
            </div>
            <div className="blog-audio-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div
            className="blog-audio-progress clickable"
            ref={progressBarRef}
            onClick={seekTo}
            role="slider"
            aria-label="Audio progress"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration) || 0}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            tabIndex={0}
          >
            <div className="blog-audio-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="blog-audio-bottom-row">
            <div className="blog-audio-sub">Clinical Clarity &middot; Audio Edition</div>
            <div className="blog-audio-controls">
              <button className="blog-audio-ctrl" onClick={() => skip(-15)} aria-label="Skip back 15 seconds" title="Back 15s">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              </button>
              <button className="blog-audio-ctrl" onClick={() => skip(15)} aria-label="Skip forward 15 seconds" title="Forward 15s">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
              <button className="blog-audio-ctrl speed" onClick={cycleSpeed} aria-label={`Playback speed ${playbackRate}x, click to change`} title="Playback speed">
                {playbackRate}x
              </button>
              {(status === "playing" || status === "paused") && (
                <button className="blog-audio-ctrl" onClick={stop} aria-label="Stop playback" title="Stop">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
