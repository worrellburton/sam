import { useRef, useEffect, useCallback, useState } from "react";

const carriers = [
  "Aetna",
  "BlueCross BlueShield",
  "UnitedHealthcare",
  "Oxford",
  "Cigna",
  "Empire BCBS",
  "Humana",
  "Medicare",
  "1199SEIU",
  "Oscar Health",
  "Emblem Health",
  "Multiplan",
  "Anthem",
  "Elevance Health",
  "Centene",
  "Fidelis Care",
  "Healthfirst",
  "Magnacare",
  "GHI",
  "HIP",
];

export function Insurance() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
    animFrame: 0,
    autoSpeed: 0.5,
    paused: false,
  });

  // Auto-scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const state = dragState.current;
    let raf: number;

    function step() {
      if (!state.paused && track) {
        track.scrollLeft += state.autoSpeed;
        // Loop: when past halfway (duplicated content), reset
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) {
          track.scrollLeft -= half;
        }
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Momentum coast
  const coastRef = useRef<number>(0);
  const startCoast = useCallback(() => {
    const track = trackRef.current;
    const state = dragState.current;
    if (!track) return;

    cancelAnimationFrame(coastRef.current);
    function coast() {
      if (Math.abs(state.velocity) < 0.5) {
        state.velocity = 0;
        // Resume auto-scroll after a pause
        setTimeout(() => { state.paused = false; }, 1000);
        return;
      }
      track!.scrollLeft += state.velocity;
      state.velocity *= 0.95; // friction
      const half = track!.scrollWidth / 2;
      if (track!.scrollLeft >= half) track!.scrollLeft -= half;
      if (track!.scrollLeft < 0) track!.scrollLeft += half;
      coastRef.current = requestAnimationFrame(coast);
    }
    coastRef.current = requestAnimationFrame(coast);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const state = dragState.current;
    state.isDown = true;
    state.paused = true;
    state.startX = e.clientX;
    state.scrollLeft = track.scrollLeft;
    state.velocity = 0;
    state.lastX = e.clientX;
    state.lastTime = Date.now();
    cancelAnimationFrame(coastRef.current);
    setIsDragging(true);
    track.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state.isDown) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - state.startX;
    track.scrollLeft = state.scrollLeft - dx;

    // Track velocity
    const now = Date.now();
    const dt = now - state.lastTime;
    if (dt > 0) {
      state.velocity = (state.lastX - e.clientX) / dt * 16; // px per frame
      state.lastX = e.clientX;
      state.lastTime = now;
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const state = dragState.current;
    state.isDown = false;
    setIsDragging(false);
    const track = trackRef.current;
    if (track) track.releasePointerCapture(e.pointerId);
    startCoast();
  }, [startCoast]);

  // Duplicate cards for infinite loop
  const cards = [...carriers, ...carriers];

  return (
    <section className="insurance-marquee-section">
      <div className="container" style={{ marginBottom: "32px" }}>
        <div className="section-header">
          <p className="section-label">Insurance</p>
          <h2>In-Network <span className="text-accent">Insurance Plans</span></h2>
          <p className="section-desc">We accept <strong style={{ color: "var(--accent)" }}>200+</strong> insurance plans including Aetna, BlueCross BlueShield, UnitedHealthcare, Oxford, Cigna, and many more.</p>
        </div>
      </div>
      <div
        className={`insurance-marquee-track${isDragging ? " is-dragging" : ""}`}
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "pan-y",
          padding: "16px 0 32px",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        {cards.map((name, i) => (
          <div
            className="insurance-marquee-card"
            key={`${name}-${i}`}
            style={{
              flex: "0 0 auto",
              minWidth: "180px",
              padding: "28px 24px",
              borderRadius: "16px",
              background: "var(--card-bg, rgba(255,255,255,0.04))",
              border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "1.05rem",
              color: "var(--text-heading, #fff)",
              backdropFilter: "blur(8px)",
              transition: "transform 0.2s, box-shadow 0.2s",
              pointerEvents: "none",
            }}
          >
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
