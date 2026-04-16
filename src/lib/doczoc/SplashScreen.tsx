"use client";
import { useState, useRef, useEffect } from "react";

// Two-and-a-half-second welcome animation that plays the first time a
// user lands on /doczoc/dashboard in a session. Canvas particles swarm
// into the logo, hold briefly, then fade out. The parent component
// unmounts this after onDone() fires so it doesn't eat rAF forever.
//
// Kept separate from dashboard/page.tsx to shrink that file (which is
// already the biggest on the site) and so other DocZoc entry points
// can reuse the intro if needed.

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Particle animation on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = [];
    const colors = ["#6366f1", "#818cf8", "#a78bfa", "#34d399", "#22d3ee"];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * 40,
        y: H / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        r: 1.5 + Math.random() * 3,
        alpha: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let t = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      t++;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.alpha = Math.min(1, t / 30) * (1 - Math.max(0, (t - 90) / 30));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha * 0.7);
        ctx.fill();
      }

      // Draw connecting lines
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`dz-splash dz-splash-${phase}`}>
      <canvas ref={canvasRef} className="dz-splash-canvas" />
      <div className="dz-splash-content">
        <div className="dz-splash-logo-ring">
          <div className="dz-splash-logo-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>
        <h1 className="dz-splash-title">DocZoc</h1>
        <p className="dz-splash-subtitle">Welcome back, Dr. Elguizaoui</p>
      </div>
    </div>
  );
}
