import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/doczoc";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DocZoc | Provider Portal" },
    { name: "description", content: "DocZoc provider portal — manage your bookings, view patient appointments, and streamline your practice." },
  ];
}

// ── WebGL shaders (same as webgl page) ──────────────────────────────
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

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  return p;
}

function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 9999, y: 9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;

    const pointProg = createProgram(gl, POINT_VS, POINT_FS);
    const lineProg = createProgram(gl, LINE_VS, LINE_FS);

    const pPosLoc = gl.getAttribLocation(pointProg, "a_position");
    const pAlphaLoc = gl.getAttribLocation(pointProg, "a_alpha");
    const pColorLoc = gl.getUniformLocation(pointProg, "u_color");
    const pSizeLoc = gl.getUniformLocation(pointProg, "u_pointSize");

    const lPosLoc = gl.getAttribLocation(lineProg, "a_position");
    const lAlphaLoc = gl.getAttribLocation(lineProg, "a_alpha");
    const lColorLoc = gl.getUniformLocation(lineProg, "u_color");

    const N = 300;
    const CONNECTION_DIST = 0.12;
    const col: [number, number, number] = [0.35, 0.34, 0.96]; // Indigo

    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const vx = new Float32Array(N);
    const vy = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      px[i] = Math.random() * 2 - 1;
      py[i] = Math.random() * 2 - 1;
      const angle = Math.random() * Math.PI * 2;
      const mag = 0.0005 + Math.random() * 0.001;
      vx[i] = Math.cos(angle) * mag;
      vy[i] = Math.sin(angle) * mag;
    }

    const pointBuf = gl.createBuffer()!;
    const pointData = new Float32Array(N * 3);
    const lineBuf = gl.createBuffer()!;
    const maxLines = N * 12;
    const lineData = new Float32Array(maxLines * 6);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }
    function onMouseLeave() {
      mouseRef.current.x = 9999;
      mouseRef.current.y = 9999;
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function frame() {
      if (!gl) return;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseRadius = 0.25;

      for (let i = 0; i < N; i++) {
        const dx = px[i] - mx;
        const dy = py[i] - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0.001) {
          const force = ((mouseRadius - dist) / mouseRadius) * 0.15 * 0.002;
          vx[i] += (dx / dist) * force;
          vy[i] += (dy / dist) * force;
        }
        px[i] += vx[i];
        py[i] += vy[i];
        vx[i] *= 0.999;
        vy[i] *= 0.999;
        if (px[i] > 1.05) px[i] = -1.05;
        if (px[i] < -1.05) px[i] = 1.05;
        if (py[i] > 1.05) py[i] = -1.05;
        if (py[i] < -1.05) py[i] = 1.05;
      }

      gl.clearColor(0.06, 0.06, 0.12, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      for (let i = 0; i < N; i++) {
        const dx = px[i] - mx;
        const dy = py[i] - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        const proximity = d < mouseRadius ? 1.0 : 0.5;
        pointData[i * 3] = px[i];
        pointData[i * 3 + 1] = py[i];
        pointData[i * 3 + 2] = 0.3 + proximity * 0.7;
      }

      gl.useProgram(pointProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
      gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(pPosLoc);
      gl.vertexAttribPointer(pPosLoc, 2, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(pAlphaLoc);
      gl.vertexAttribPointer(pAlphaLoc, 1, gl.FLOAT, false, 12, 8);
      gl.uniform3f(pColorLoc, col[0], col[1], col[2]);
      gl.uniform1f(pSizeLoc, 3.0);
      gl.drawArrays(gl.POINTS, 0, N);

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

      if (lineVerts > 0) {
        gl.useProgram(lineProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
        gl.bufferData(gl.ARRAY_BUFFER, lineData.subarray(0, lineVerts * 3), gl.DYNAMIC_DRAW);
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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
      }}
    />
  );
}

export default function DocZocPage() {
  return (
    <div className="dz-page dz-page-dark">
      <WebGLBackground />

      {/* Nav */}
      <nav className="dz-nav dz-nav-glass">
        <div className="dz-nav-inner">
          <div className="dz-nav-left">
            <div className="dz-logo">
              <div className="dz-logo-icon">D</div>
              <span className="dz-logo-text" style={{ color: "#e2e8f0" }}>DocZoc</span>
            </div>
          </div>
          <div className="dz-nav-right">
            <Link to="/doczoc/signin" className="dz-sign-in-btn">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="dz-hero" style={{ position: "relative", zIndex: 1 }}>
        <div className="dz-hero-inner">
          <div className="dz-hero-content">
            <div className="dz-hero-badge" style={{ background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc" }}>For Healthcare Providers</div>
            <h1 style={{ color: "#f1f5f9" }}>Your Patient Bookings,<br /><span style={{ color: "#818cf8" }}>All in One Place</span></h1>
            <p className="dz-hero-sub" style={{ color: "#94a3b8" }}>DocZoc gives doctors a simple, secure portal to view appointments, manage patient bookings, and stay organized — so you can focus on what matters most: your patients.</p>
            <div className="dz-hero-actions">
              <Link to="/doczoc/signin" className="dz-btn-primary" style={{ textDecoration: "none" }}>Get Started Free</Link>
              <button className="dz-btn-outline" style={{ color: "#cbd5e1", borderColor: "rgba(148, 163, 184, 0.3)" }}>Watch Demo</button>
            </div>
            <div className="dz-hero-trust" style={{ color: "#94a3b8" }}>
              <div className="dz-trust-avatars">
                <div className="dz-trust-avatar" style={{ background: "#4f46e5", borderColor: "#0f0f1e" }}>S</div>
                <div className="dz-trust-avatar" style={{ background: "#059669", borderColor: "#0f0f1e" }}>M</div>
                <div className="dz-trust-avatar" style={{ background: "#d97706", borderColor: "#0f0f1e" }}>R</div>
                <div className="dz-trust-avatar" style={{ background: "#dc2626", borderColor: "#0f0f1e" }}>A</div>
              </div>
              <span>Trusted by <strong style={{ color: "#e2e8f0" }}>2,400+</strong> providers across NYC</span>
            </div>
          </div>
          <div className="dz-hero-visual">
            <div className="dz-dashboard-preview" style={{ background: "rgba(15, 23, 42, 0.8)", borderColor: "rgba(99, 102, 241, 0.2)", backdropFilter: "blur(12px)" }}>
              <div className="dz-dash-header" style={{ background: "rgba(15, 23, 42, 0.9)", borderColor: "rgba(99, 102, 241, 0.15)" }}>
                <div className="dz-dash-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="dz-dash-title" style={{ color: "#94a3b8" }}>Dashboard</span>
              </div>
              <div className="dz-dash-body">
                <div className="dz-dash-stat-row">
                  <div className="dz-dash-stat" style={{ background: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(99, 102, 241, 0.15)" }}>
                    <span className="dz-dash-stat-num">24</span>
                    <span className="dz-dash-stat-label" style={{ color: "#94a3b8" }}>Today's Appts</span>
                  </div>
                  <div className="dz-dash-stat" style={{ background: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(99, 102, 241, 0.15)" }}>
                    <span className="dz-dash-stat-num">8</span>
                    <span className="dz-dash-stat-label" style={{ color: "#94a3b8" }}>New Patients</span>
                  </div>
                  <div className="dz-dash-stat" style={{ background: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(99, 102, 241, 0.15)" }}>
                    <span className="dz-dash-stat-num">96%</span>
                    <span className="dz-dash-stat-label" style={{ color: "#94a3b8" }}>Show Rate</span>
                  </div>
                </div>
                <div className="dz-dash-list">
                  <div className="dz-dash-appt" style={{ background: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(99, 102, 241, 0.1)" }}>
                    <div className="dz-appt-time">9:00 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name" style={{ color: "#e2e8f0" }}>Sarah M.</span>
                      <span className="dz-appt-type" style={{ color: "#94a3b8" }}>Follow-up — Shoulder</span>
                    </div>
                    <div className="dz-appt-badge dz-confirmed">Confirmed</div>
                  </div>
                  <div className="dz-dash-appt" style={{ background: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(99, 102, 241, 0.1)" }}>
                    <div className="dz-appt-time">9:30 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name" style={{ color: "#e2e8f0" }}>James K.</span>
                      <span className="dz-appt-type" style={{ color: "#94a3b8" }}>New Patient — Knee</span>
                    </div>
                    <div className="dz-appt-badge dz-new">New</div>
                  </div>
                  <div className="dz-dash-appt" style={{ background: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(99, 102, 241, 0.1)" }}>
                    <div className="dz-appt-time">10:15 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name" style={{ color: "#e2e8f0" }}>Maria L.</span>
                      <span className="dz-appt-type" style={{ color: "#94a3b8" }}>Post-Op — ACL</span>
                    </div>
                    <div className="dz-appt-badge dz-confirmed">Confirmed</div>
                  </div>
                  <div className="dz-dash-appt" style={{ background: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(99, 102, 241, 0.1)" }}>
                    <div className="dz-appt-time">11:00 AM</div>
                    <div className="dz-appt-info">
                      <span className="dz-appt-name" style={{ color: "#e2e8f0" }}>David R.</span>
                      <span className="dz-appt-type" style={{ color: "#94a3b8" }}>Consultation — Hip</span>
                    </div>
                    <div className="dz-appt-badge dz-pending">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dark Footer */}
      <footer className="dz-footer dz-footer-dark">
        <div className="dz-footer-inner">
          <div className="dz-footer-left">
            <div className="dz-logo">
              <div className="dz-logo-icon">D</div>
              <span className="dz-logo-text" style={{ color: "#e2e8f0" }}>DocZoc</span>
            </div>
            <p className="dz-footer-copy" style={{ color: "#64748b" }}>&copy; {new Date().getFullYear()} DocZoc. All rights reserved.</p>
          </div>
          <div className="dz-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
