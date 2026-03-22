import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "WebGL Lab | DocZoc" },
    {
      name: "description",
      content:
        "Interactive WebGL particle field demo with mouse-reactive mesh connections.",
    },
  ];
}

// ── Color presets (RGB 0-1) ──────────────────────────────────────────
const COLOR_PRESETS: Record<string, [number, number, number]> = {
  Indigo: [0.35, 0.34, 0.96],
  Cyan: [0.0, 0.75, 0.85],
  Violet: [0.58, 0.27, 0.92],
  Emerald: [0.12, 0.78, 0.55],
  Rose: [0.92, 0.28, 0.5],
};

// ── Shader sources ───────────────────────────────────────────────────
const POINT_VS = `
  attribute vec2 a_position;
  attribute float a_alpha;
  uniform float u_pointSize;
  varying float v_alpha;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = u_pointSize;
    v_alpha = a_alpha;
  }
`;

const POINT_FS = `
  precision mediump float;
  uniform vec3 u_color;
  varying float v_alpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    gl_FragColor = vec4(u_color, v_alpha * glow);
  }
`;

const LINE_VS = `
  attribute vec2 a_position;
  attribute float a_alpha;
  varying float v_alpha;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_alpha = a_alpha;
  }
`;

const LINE_FS = `
  precision mediump float;
  uniform vec3 u_color;
  varying float v_alpha;
  void main() {
    gl_FragColor = vec4(u_color, v_alpha * 0.35);
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────
function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string
): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: string,
  fs: string
): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  return p;
}

// ── Main component ──────────────────────────────────────────────────
export default function WebGLLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 9999, y: 9999 });

  // Controls state
  const [particleCount, setParticleCount] = useState(400);
  const [colorName, setColorName] = useState<string>("Indigo");
  const [speed, setSpeed] = useState(0.5);
  const [panelOpen, setPanelOpen] = useState(true);

  // Refs that the render loop reads each frame
  const colorRef = useRef(COLOR_PRESETS["Indigo"]);
  const speedRef = useRef(0.5);
  const countRef = useRef(400);

  useEffect(() => {
    colorRef.current = COLOR_PRESETS[colorName];
  }, [colorName]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    countRef.current = particleCount;
  }, [particleCount]);

  // ── WebGL bootstrap ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;

    // Programs
    const pointProg = createProgram(gl, POINT_VS, POINT_FS);
    const lineProg = createProgram(gl, LINE_VS, LINE_FS);

    // Locations — points
    const pPosLoc = gl.getAttribLocation(pointProg, "a_position");
    const pAlphaLoc = gl.getAttribLocation(pointProg, "a_alpha");
    const pColorLoc = gl.getUniformLocation(pointProg, "u_color");
    const pSizeLoc = gl.getUniformLocation(pointProg, "u_pointSize");

    // Locations — lines
    const lPosLoc = gl.getAttribLocation(lineProg, "a_position");
    const lAlphaLoc = gl.getAttribLocation(lineProg, "a_alpha");
    const lColorLoc = gl.getUniformLocation(lineProg, "u_color");

    // Max particles we'll ever allocate for
    const MAX = 800;
    const CONNECTION_DIST = 0.12;

    // Particle state arrays
    const px = new Float32Array(MAX);
    const py = new Float32Array(MAX);
    const vx = new Float32Array(MAX);
    const vy = new Float32Array(MAX);

    function initParticle(i: number) {
      px[i] = Math.random() * 2 - 1;
      py[i] = Math.random() * 2 - 1;
      const angle = Math.random() * Math.PI * 2;
      const mag = 0.0005 + Math.random() * 0.001;
      vx[i] = Math.cos(angle) * mag;
      vy[i] = Math.sin(angle) * mag;
    }

    for (let i = 0; i < MAX; i++) initParticle(i);

    // Buffers
    const pointBuf = gl.createBuffer()!;
    // 3 floats per point: x, y, alpha
    const pointData = new Float32Array(MAX * 3);

    const lineBuf = gl.createBuffer()!;
    // worst-case connections: each pair — 6 floats per segment (2 verts x 3)
    const maxLines = MAX * 12; // heuristic cap
    const lineData = new Float32Array(maxLines * 6);

    // Resize helper
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking (convert to clip-space)
    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }
    function onMouseLeave() {
      mouseRef.current.x = 9999;
      mouseRef.current.y = 9999;
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((t.clientY - rect.top) / rect.height) * 2 - 1);
    }
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // ── Render loop ───────────────────────────────────────────────────
    function frame() {
      if (!gl) return;
      const N = countRef.current;
      const spd = speedRef.current;
      const col = colorRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseInfluence = 0.15;
      const mouseRadius = 0.25;

      // Update particles
      for (let i = 0; i < N; i++) {
        // Mouse repulsion / attraction
        const dx = px[i] - mx;
        const dy = py[i] - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0.001) {
          const force = ((mouseRadius - dist) / mouseRadius) * mouseInfluence * 0.002;
          vx[i] += (dx / dist) * force;
          vy[i] += (dy / dist) * force;
        }

        px[i] += vx[i] * spd * 2;
        py[i] += vy[i] * spd * 2;

        // Damping
        vx[i] *= 0.999;
        vy[i] *= 0.999;

        // Wrap
        if (px[i] > 1.05) px[i] = -1.05;
        if (px[i] < -1.05) px[i] = 1.05;
        if (py[i] > 1.05) py[i] = -1.05;
        if (py[i] < -1.05) py[i] = 1.05;
      }

      // Clear
      gl.clearColor(0.06, 0.06, 0.12, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Build point data
      for (let i = 0; i < N; i++) {
        const dx = px[i] - mx;
        const dy = py[i] - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        const proximity = d < mouseRadius ? 1.0 : 0.5;
        pointData[i * 3] = px[i];
        pointData[i * 3 + 1] = py[i];
        pointData[i * 3 + 2] = 0.3 + proximity * 0.7;
      }

      // Draw points
      gl.useProgram(pointProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
      gl.bufferData(gl.ARRAY_BUFFER, pointData.subarray(0, N * 3), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(pPosLoc);
      gl.vertexAttribPointer(pPosLoc, 2, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(pAlphaLoc);
      gl.vertexAttribPointer(pAlphaLoc, 1, gl.FLOAT, false, 12, 8);
      gl.uniform3f(pColorLoc, col[0], col[1], col[2]);
      gl.uniform1f(pSizeLoc, 3.0);
      gl.drawArrays(gl.POINTS, 0, N);

      // Build line data (spatial grid for perf)
      let lineVerts = 0;
      const cd = CONNECTION_DIST;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = px[i] - px[j];
          const dy = py[i] - py[j];
          const d2 = dx * dx + dy * dy;
          if (d2 < cd * cd) {
            const d = Math.sqrt(d2);
            const alpha = 1.0 - d / cd;
            const off = lineVerts * 3;
            lineData[off] = px[i];
            lineData[off + 1] = py[i];
            lineData[off + 2] = alpha;
            lineData[off + 3] = px[j];
            lineData[off + 4] = py[j];
            lineData[off + 5] = alpha;
            lineVerts += 2;
            if (lineVerts >= maxLines * 2) break;
          }
        }
        if (lineVerts >= maxLines * 2) break;
      }

      // Draw lines
      if (lineVerts > 0) {
        gl.useProgram(lineProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          lineData.subarray(0, lineVerts * 3),
          gl.DYNAMIC_DRAW
        );
        gl.enableVertexAttribArray(lPosLoc);
        gl.vertexAttribPointer(lPosLoc, 2, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(lAlphaLoc);
        gl.vertexAttribPointer(lAlphaLoc, 1, gl.FLOAT, false, 12, 8);
        gl.uniform3f(lColorLoc, col[0], col[1], col[2]);
        gl.drawArrays(gl.LINES, 0, lineVerts);
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, [particleCount]); // re-init when count changes to re-seed new particles

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0f0f1e",
        color: "#e2e8f0",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background:
            "linear-gradient(to bottom, rgba(15,15,30,0.85), transparent)",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              background: "linear-gradient(135deg, #818cf8, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            DocZoc
          </span>
        </Link>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#94a3b8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          WebGL Lab
        </span>
      </header>

      {/* ── Canvas ──────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {/* ── Controls toggle button ──────────────────────────────────── */}
      <button
        onClick={() => setPanelOpen((p) => !p)}
        aria-label="Toggle controls"
        style={{
          position: "absolute",
          top: 72,
          right: panelOpen ? 276 : 16,
          zIndex: 30,
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "1px solid rgba(99,102,241,0.3)",
          background: "rgba(15,15,30,0.8)",
          color: "#818cf8",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transition: "right 0.3s ease",
          backdropFilter: "blur(8px)",
        }}
      >
        {panelOpen ? "\u2715" : "\u2699"}
      </button>

      {/* ── Controls panel ──────────────────────────────────────────── */}
      <aside
        style={{
          position: "absolute",
          top: 64,
          right: panelOpen ? 0 : -276,
          width: 260,
          bottom: 0,
          zIndex: 25,
          padding: "24px 20px",
          background: "rgba(15,15,30,0.85)",
          backdropFilter: "blur(12px)",
          borderLeft: "1px solid rgba(99,102,241,0.15)",
          transition: "right 0.3s ease",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#818cf8",
          }}
        >
          Controls
        </h2>

        {/* Particle count */}
        <ControlGroup label={`Particles: ${particleCount}`}>
          <input
            type="range"
            min={50}
            max={800}
            step={50}
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            style={sliderStyle}
          />
        </ControlGroup>

        {/* Speed */}
        <ControlGroup label={`Speed: ${speed.toFixed(1)}x`}>
          <input
            type="range"
            min={0.1}
            max={2.0}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={sliderStyle}
          />
        </ControlGroup>

        {/* Color presets */}
        <ControlGroup label="Color">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(COLOR_PRESETS).map(([name, rgb]) => (
              <button
                key={name}
                onClick={() => setColorName(name)}
                title={name}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border:
                    colorName === name
                      ? "2px solid #e2e8f0"
                      : "2px solid transparent",
                  background: `rgb(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)})`,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              />
            ))}
          </div>
        </ControlGroup>

        {/* Info */}
        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "#475569",
            lineHeight: 1.6,
          }}
        >
          Move your mouse over the canvas to interact with the particle field.
          Particles near the cursor glow brighter and connections form between
          nearby particles.
        </div>
      </aside>
    </div>
  );
}

// ── Small helper components / styles ─────────────────────────────────
function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#94a3b8",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const sliderStyle: React.CSSProperties = {
  width: "100%",
  accentColor: "#6366f1",
  height: 4,
  cursor: "pointer",
};
