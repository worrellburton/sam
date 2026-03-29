import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_HEADERS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const APPT_COLORS = ['#a78bfa','#34d399','#fbbf24','#60a5fa','#f472b6'];

function getAvail(d: number, m: number, y: number, dow: number) {
  if (dow === 0 || dow === 6) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  if (new Date(y, m, d) < today) return 0;
  const seed = (d * 7 + m * 13 + y) % 30;
  return seed > 20 ? 4 : seed > 12 ? 3 : seed > 5 ? 2 : 1;
}

function HeroCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const weeks = useMemo(() => {
    const rows: (number | null)[][] = [];
    let row: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) row.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(d);
      if (row.length === 7) { rows.push(row); row = []; }
    }
    if (row.length > 0) { while (row.length < 7) row.push(null); rows.push(row); }
    return rows;
  }, []);

  return (
    <div className="dz-hero-cal">
      <div className="dz-hero-cal-header">
        <span className="dz-hero-cal-month">{MONTHS[month]} {year}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="dz-hero-cal-nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button className="dz-hero-cal-nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
      <div className="dz-hero-cal-days">
        {DAY_HEADERS.map(d => <div key={d} className="dz-hero-cal-dh">{d}</div>)}
      </div>
      <div className="dz-hero-cal-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="dz-hero-cal-week" style={{ animationDelay: `${0.4 + wi * 0.08}s` }}>
            {week.map((day, di) => {
              if (day === null) return <div key={di} className="dz-hero-cal-cell empty" />;
              const dow = new Date(year, month, day).getDay();
              const count = getAvail(day, month, year, dow);
              const isToday = day === todayDate;
              return (
                <div key={di} className={`dz-hero-cal-cell${count > 0 ? ' has' : ''}${isToday ? ' today-cell' : ''}`}>
                  <span className={`dz-hero-cal-num${isToday ? ' today' : ''}`}>{day}</span>
                  {count > 0 && (
                    <div className="dz-hero-cal-dots">
                      {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                        <span key={i} className="dz-hero-cal-dot" style={{ background: APPT_COLORS[(day + i) % APPT_COLORS.length] }} />
                      ))}
                    </div>
                  )}
                  <span className="dz-hero-cal-avail">{count > 0 ? 'Avail.' : dow === 0 || dow === 6 ? '' : 'No avail.'}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocZocPage() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setLoaded(true)); }, []);

  return (
    <div className={`dz-page dz-page-dark${loaded ? ' dz-loaded' : ''}`}>
      <WebGLBackground />

      {/* Nav */}
      <nav className="dz-nav dz-nav-glass dz-anim-fade" style={{ animationDelay: "0s" }}>
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
            <div className="dz-hero-badge dz-anim-up" style={{ background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", animationDelay: "0.1s" }}>For Healthcare Providers</div>
            <h1 className="dz-anim-up" style={{ color: "#f1f5f9", animationDelay: "0.2s" }}>Your Patient Bookings,<br /><span style={{ color: "#818cf8" }}>All in One Place</span></h1>
            <p className="dz-hero-sub dz-anim-up" style={{ color: "#94a3b8", animationDelay: "0.3s" }}>DocZoc gives doctors a simple, secure portal to view appointments, manage patient bookings, and stay organized — so you can focus on what matters most: your patients.</p>
            <div className="dz-hero-actions dz-anim-up" style={{ animationDelay: "0.4s" }}>
              <Link to="/doczoc/signin" className="dz-btn-primary" style={{ textDecoration: "none" }}>Get Started Free</Link>
              <button className="dz-btn-outline" style={{ color: "#cbd5e1", borderColor: "rgba(148, 163, 184, 0.3)" }}>Watch Demo</button>
            </div>
            <div className="dz-hero-trust dz-anim-up" style={{ color: "#94a3b8", animationDelay: "0.5s" }}>
              <div className="dz-trust-avatars">
                <div className="dz-trust-avatar" style={{ background: "#4f46e5", borderColor: "#0f0f1e" }}>S</div>
                <div className="dz-trust-avatar" style={{ background: "#059669", borderColor: "#0f0f1e" }}>M</div>
                <div className="dz-trust-avatar" style={{ background: "#d97706", borderColor: "#0f0f1e" }}>R</div>
                <div className="dz-trust-avatar" style={{ background: "#dc2626", borderColor: "#0f0f1e" }}>A</div>
              </div>
              <span>Trusted by <strong style={{ color: "#e2e8f0" }}>2,400+</strong> providers across NYC</span>
            </div>
          </div>
          <div className="dz-hero-visual dz-anim-scale" style={{ animationDelay: "0.3s" }}>
            <HeroCalendar />
          </div>
        </div>
      </header>

      {/* Dark Footer */}
      <footer className="dz-footer dz-footer-dark dz-anim-fade" style={{ animationDelay: "0.6s" }}>
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
