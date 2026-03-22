import { useEffect, useRef } from "react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Sign In | DocZoc" },
    { name: "description", content: "Sign in to your DocZoc provider portal." },
  ];
}

// Reuse the same WebGL background
const POINT_VS = `
  attribute vec2 a_position; attribute float a_alpha; uniform float u_pointSize; varying float v_alpha;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); gl_PointSize = u_pointSize; v_alpha = a_alpha; }
`;
const POINT_FS = `
  precision mediump float; uniform vec3 u_color; varying float v_alpha;
  void main() { float d = length(gl_PointCoord - vec2(0.5)); if (d > 0.5) discard; float glow = 1.0 - smoothstep(0.0, 0.5, d); gl_FragColor = vec4(u_color, v_alpha * glow); }
`;
const LINE_VS = `
  attribute vec2 a_position; attribute float a_alpha; varying float v_alpha;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); v_alpha = a_alpha; }
`;
const LINE_FS = `
  precision mediump float; uniform vec3 u_color; varying float v_alpha;
  void main() { gl_FragColor = vec4(u_color, v_alpha * 0.35); }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s;
}
function prog(gl: WebGLRenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p); return p;
}

function WebGLBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 9999, y: 9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;

    const pp = prog(gl, POINT_VS, POINT_FS);
    const lp = prog(gl, LINE_VS, LINE_FS);
    const pPosLoc = gl.getAttribLocation(pp, "a_position");
    const pAlphaLoc = gl.getAttribLocation(pp, "a_alpha");
    const pColorLoc = gl.getUniformLocation(pp, "u_color");
    const pSizeLoc = gl.getUniformLocation(pp, "u_pointSize");
    const lPosLoc = gl.getAttribLocation(lp, "a_position");
    const lAlphaLoc = gl.getAttribLocation(lp, "a_alpha");
    const lColorLoc = gl.getUniformLocation(lp, "u_color");

    const N = 200;
    const CD = 0.14;
    const col: [number, number, number] = [0.35, 0.34, 0.96];
    const px = new Float32Array(N), py = new Float32Array(N);
    const vx = new Float32Array(N), vy = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      px[i] = Math.random() * 2 - 1; py[i] = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2, m = 0.0003 + Math.random() * 0.0008;
      vx[i] = Math.cos(a) * m; vy[i] = Math.sin(a) * m;
    }
    const ptBuf = gl.createBuffer()!, ptData = new Float32Array(N * 3);
    const lnBuf = gl.createBuffer()!, maxL = N * 12, lnData = new Float32Array(maxL * 6);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize(); window.addEventListener("resize", resize);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function frame() {
      if (!gl) return;
      for (let i = 0; i < N; i++) {
        px[i] += vx[i]; py[i] += vy[i]; vx[i] *= 0.999; vy[i] *= 0.999;
        if (px[i] > 1.05) px[i] = -1.05; if (px[i] < -1.05) px[i] = 1.05;
        if (py[i] > 1.05) py[i] = -1.05; if (py[i] < -1.05) py[i] = 1.05;
      }
      gl.clearColor(0.06, 0.06, 0.12, 1.0); gl.clear(gl.COLOR_BUFFER_BIT);
      for (let i = 0; i < N; i++) { ptData[i*3] = px[i]; ptData[i*3+1] = py[i]; ptData[i*3+2] = 0.5; }
      gl.useProgram(pp); gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
      gl.bufferData(gl.ARRAY_BUFFER, ptData, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(pPosLoc); gl.vertexAttribPointer(pPosLoc, 2, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(pAlphaLoc); gl.vertexAttribPointer(pAlphaLoc, 1, gl.FLOAT, false, 12, 8);
      gl.uniform3f(pColorLoc, col[0], col[1], col[2]); gl.uniform1f(pSizeLoc, 2.5);
      gl.drawArrays(gl.POINTS, 0, N);
      let lv = 0;
      for (let i = 0; i < N; i++) { for (let j = i+1; j < N; j++) {
        const dx = px[i]-px[j], dy = py[i]-py[j], d2 = dx*dx+dy*dy;
        if (d2 < CD*CD) { const d = Math.sqrt(d2), a = 1-d/CD, o = lv*3;
          lnData[o]=px[i]; lnData[o+1]=py[i]; lnData[o+2]=a;
          lnData[o+3]=px[j]; lnData[o+4]=py[j]; lnData[o+5]=a;
          lv += 2; if (lv >= maxL*2) break; }
      } if (lv >= maxL*2) break; }
      if (lv > 0) {
        gl.useProgram(lp); gl.bindBuffer(gl.ARRAY_BUFFER, lnBuf);
        gl.bufferData(gl.ARRAY_BUFFER, lnData.subarray(0, lv*3), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(lPosLoc); gl.vertexAttribPointer(lPosLoc, 2, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(lAlphaLoc); gl.vertexAttribPointer(lAlphaLoc, 1, gl.FLOAT, false, 12, 8);
        gl.uniform3f(lColorLoc, col[0], col[1], col[2]); gl.drawArrays(gl.LINES, 0, lv);
      }
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", display: "block", zIndex: 0 }} />;
}

export default function DocZocSignIn() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <WebGLBg />

      {/* Back nav */}
      <nav style={{ position: "relative", zIndex: 10, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/doczoc" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem" }}>D</div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e8f0" }}>DocZoc</span>
        </Link>
      </nav>

      {/* Sign-in card */}
      <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px 60px" }}>
        <div className="dz-sso-card">
          <div className="dz-sso-header">
            <h1>Welcome back</h1>
            <p>Sign in to your DocZoc provider portal</p>
          </div>

          <div className="dz-sso-buttons">
            <Link to="/doczoc/dashboard" className="dz-sso-btn">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </Link>

            <Link to="/doczoc/dashboard" className="dz-sso-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </Link>

            <Link to="/doczoc/dashboard" className="dz-sso-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#e2e8f0" }}>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Continue with Apple</span>
            </Link>

            <Link to="/doczoc/dashboard" className="dz-sso-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#e2e8f0" }}>
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd"/>
              </svg>
              <span>Continue with GitHub</span>
            </Link>
          </div>

          <div className="dz-sso-divider">
            <span>or</span>
          </div>

          <form className="dz-sso-form" onSubmit={(e) => e.preventDefault()}>
            <div className="dz-sso-field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" placeholder="doctor@practice.com" autoComplete="email" />
            </div>
            <div className="dz-sso-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="Enter your password" autoComplete="current-password" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "#6366f1" }} /> Remember me
              </label>
              <a href="#" style={{ color: "#818cf8", textDecoration: "none" }}>Forgot password?</a>
            </div>
            <Link to="/doczoc/dashboard" className="dz-sso-submit">Sign In</Link>
          </form>

          <p className="dz-sso-footer-text">
            Don't have an account? <a href="#">Create one free</a>
          </p>
        </div>
      </main>
    </div>
  );
}
