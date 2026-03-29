"use client";
import { useState, useEffect, useRef } from "react";
import { Sidebar, useDzPrefs } from "../dashboard/page";
import { PlatformBg } from "@/components/PlatformBg";
import { BG_VERT, BG_PRESETS } from "@/data/doczoc-bg";


const FONTS = [
  { id: "inter", label: "Inter (Default)", family: "Inter, -apple-system, sans-serif" },
  { id: "system", label: "System", family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: "mono", label: "Mono", family: "'SF Mono', 'Fira Code', 'Consolas', monospace" },
  { id: "serif", label: "Serif", family: "Georgia, 'Times New Roman', serif" },
  { id: "rounded", label: "Rounded", family: "'Nunito', 'Varela Round', system-ui, sans-serif" },
  { id: "geometric", label: "Geometric", family: "'Poppins', 'Futura', system-ui, sans-serif" },
];

function isDarkMode() {
  return document.documentElement.getAttribute("data-theme") !== "light";
}

function BgPreview({ frag }: { frag: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, BG_VERT);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, frag);
    gl.compileShader(fs);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const posLoc = gl.getAttribLocation(prog, "a_pos");
    const timeLoc = gl.getUniformLocation(prog, "u_time");
    const resLoc = gl.getUniformLocation(prog, "u_res");
    const darkLoc = gl.getUniformLocation(prog, "u_dark");
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
    }
    resize();
    const start = performance.now();

    function frame() {
      if (!gl) return;
      resize();
      gl.viewport(0, 0, canvas!.width, canvas!.height);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLoc, (performance.now() - start) / 1000);
      gl.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl.uniform1f(darkLoc, isDarkMode() ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [frag]);

  return <canvas ref={canvasRef} className="dz-bg-preview-canvas" />;
}

export default function AppearancePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { bgId: currentBg } = useDzPrefs();
  const [selectedFont, setSelectedFont] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("dz-font") || "inter";
    return "inter";
  });
  const [selectedBg, setSelectedBg] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("dz-bg") || "none";
    return "none";
  });

  useEffect(() => {
    const font = FONTS.find(f => f.id === selectedFont);
    if (font) {
      document.documentElement.style.setProperty("--dz-font", font.family);
      localStorage.setItem("dz-font", selectedFont);
    }
  }, [selectedFont]);

  useEffect(() => {
    localStorage.setItem("dz-bg", selectedBg);
  }, [selectedBg]);

  return (
    <div className="dz-platform">
      <PlatformBg bgId={selectedBg} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Appearance</h1>
            <p>Customize your portal experience</p>
          </div>
        </header>

        {/* Background Section */}
        <div className="dz-appear-section">
          <h2>Background</h2>
          <p className="dz-appear-desc">Choose an animated background for your console</p>
          <div className="dz-bg-grid">
            {/* None option */}
            <button
              className={`dz-bg-card${selectedBg === "none" ? " active" : ""}`}
              onClick={() => setSelectedBg("none")}
            >
              <div className="dz-bg-preview dz-bg-preview-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.3 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </div>
              <span className="dz-bg-label">None</span>
              <span className="dz-bg-desc">Clean, no animation</span>
            </button>
            {BG_PRESETS.map((bg) => (
              <button
                key={bg.id}
                className={`dz-bg-card${selectedBg === bg.id ? " active" : ""}`}
                onClick={() => setSelectedBg(bg.id)}
              >
                <div className="dz-bg-preview">
                  <BgPreview frag={bg.frag} />
                </div>
                <span className="dz-bg-label">{bg.label}</span>
                <span className="dz-bg-desc">{bg.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Section */}
        <div className="dz-appear-section">
          <h2>Font Family</h2>
          <p className="dz-appear-desc">Choose a font for your entire platform</p>
          <div className="dz-font-grid">
            {FONTS.map((f) => (
              <button
                key={f.id}
                className={`dz-font-card${selectedFont === f.id ? " active" : ""}`}
                onClick={() => setSelectedFont(f.id)}
              >
                <span className="dz-font-preview" style={{ fontFamily: f.family }}>Aa</span>
                <span className="dz-font-label">{f.label}</span>
                <span className="dz-font-sample" style={{ fontFamily: f.family }}>The quick brown fox jumps over the lazy dog</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
