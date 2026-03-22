import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./doczoc-dashboard";

export function meta() {
  return [{ title: "Appearance | DocZoc" }];
}

const FONTS = [
  { id: "inter", label: "Inter", family: "Inter, -apple-system, sans-serif" },
  { id: "system", label: "System", family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: "mono", label: "Mono", family: "'SF Mono', 'Fira Code', 'Consolas', monospace" },
  { id: "serif", label: "Serif", family: "Georgia, 'Times New Roman', serif" },
  { id: "rounded", label: "Rounded", family: "'Nunito', 'Varela Round', system-ui, sans-serif" },
  { id: "geometric", label: "Geometric", family: "'Poppins', 'Futura', system-ui, sans-serif" },
];

// ── 6 WebGL Background Shaders ──────────────────────────────────────
// Each returns a fragment shader; vertex shader is shared
const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const BG_PRESETS = [
  {
    id: "flow",
    label: "Gentle Flow",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.15;
        float v = sin(uv.x * 3.0 + t) * 0.5 + sin(uv.y * 2.0 + t * 0.7) * 0.5;
        v = v * 0.5 + 0.5;
        vec3 c1 = vec3(0.06, 0.06, 0.12);
        vec3 c2 = vec3(0.15, 0.12, 0.28);
        gl_FragColor = vec4(mix(c1, c2, v * 0.6), 1.0);
      }
    `,
  },
  {
    id: "aurora",
    label: "Aurora",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.1;
        float wave = sin(uv.x * 4.0 + t) * cos(uv.y * 3.0 + t * 0.5);
        float wave2 = sin(uv.x * 2.0 - t * 0.3) * sin(uv.y * 5.0 + t * 0.8);
        vec3 base = vec3(0.06, 0.06, 0.12);
        vec3 green = vec3(0.05, 0.25, 0.15);
        vec3 purple = vec3(0.18, 0.08, 0.28);
        vec3 col = base + green * max(0.0, wave * 0.4) + purple * max(0.0, wave2 * 0.3);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "waves",
    label: "Ocean Waves",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.12;
        float w = 0.0;
        for (float i = 1.0; i < 4.0; i++) {
          w += sin(uv.x * i * 2.5 + t * i * 0.5 + uv.y * i) / i;
        }
        w = w * 0.25 + 0.5;
        vec3 deep = vec3(0.04, 0.06, 0.14);
        vec3 mid = vec3(0.08, 0.12, 0.22);
        gl_FragColor = vec4(mix(deep, mid, w), 1.0);
      }
    `,
  },
  {
    id: "nebula",
    label: "Nebula",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.05;
        float n = noise(uv * 3.0 + t) * 0.5 + noise(uv * 6.0 - t * 0.5) * 0.25;
        vec3 base = vec3(0.06, 0.04, 0.1);
        vec3 pink = vec3(0.22, 0.06, 0.18);
        vec3 blue = vec3(0.06, 0.08, 0.22);
        vec3 col = base + pink * n * 0.6 + blue * (1.0 - n) * 0.3;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "gradient",
    label: "Shifting Gradient",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.08;
        float angle = t;
        vec2 dir = vec2(cos(angle), sin(angle));
        float g = dot(uv - 0.5, dir) + 0.5;
        vec3 c1 = vec3(0.06, 0.06, 0.14);
        vec3 c2 = vec3(0.12, 0.06, 0.2);
        vec3 c3 = vec3(0.06, 0.1, 0.18);
        vec3 col = mix(mix(c1, c2, g), c3, sin(t * 0.5) * 0.5 + 0.5);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "mesh",
    label: "Soft Mesh",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.1;
        float d1 = length(uv - vec2(0.3 + sin(t) * 0.1, 0.3 + cos(t * 0.7) * 0.1));
        float d2 = length(uv - vec2(0.7 + cos(t * 0.5) * 0.1, 0.7 + sin(t * 0.8) * 0.1));
        float d3 = length(uv - vec2(0.5, 0.5 + sin(t * 0.3) * 0.15));
        vec3 base = vec3(0.06, 0.06, 0.12);
        vec3 col = base;
        col += vec3(0.12, 0.04, 0.2) * (1.0 - smoothstep(0.0, 0.5, d1));
        col += vec3(0.04, 0.12, 0.2) * (1.0 - smoothstep(0.0, 0.5, d2));
        col += vec3(0.1, 0.06, 0.16) * (1.0 - smoothstep(0.0, 0.4, d3));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];

function BgPreview({ frag, active }: { frag: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT);
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
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(animRef.current);
  }, [frag]);

  return (
    <canvas
      ref={canvasRef}
      className={`dz-bg-preview-canvas${active ? " active" : ""}`}
    />
  );
}

export default function AppearancePage() {
  const [collapsed, setCollapsed] = useState(false);
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
    <div className="dz-platform" style={{ fontFamily: "var(--dz-font, Inter, -apple-system, sans-serif)" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`dz-platform-main${collapsed ? " dz-main-expanded" : ""}`}>
        <header className="dz-platform-header">
          <div>
            <h1>Appearance</h1>
            <p>Customize your portal experience</p>
          </div>
        </header>

        {/* Font Family */}
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

        {/* Background */}
        <div className="dz-appear-section">
          <h2>Background</h2>
          <p className="dz-appear-desc">Choose an animated background for your console</p>
          <div className="dz-bg-grid">
            <button
              className={`dz-bg-card${selectedBg === "none" ? " active" : ""}`}
              onClick={() => setSelectedBg("none")}
            >
              <div className="dz-bg-preview" style={{ background: "#0f0f1e" }}>
                <span style={{ color: "#475569", fontSize: "0.82rem" }}>None</span>
              </div>
              <span className="dz-bg-label">Default</span>
            </button>
            {BG_PRESETS.map((bg) => (
              <button
                key={bg.id}
                className={`dz-bg-card${selectedBg === bg.id ? " active" : ""}`}
                onClick={() => setSelectedBg(bg.id)}
              >
                <div className="dz-bg-preview">
                  <BgPreview frag={bg.frag} active={selectedBg === bg.id} />
                </div>
                <span className="dz-bg-label">{bg.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
