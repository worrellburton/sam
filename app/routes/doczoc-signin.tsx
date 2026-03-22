import { useEffect, useRef, useState } from "react";
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
  const [mode, setMode] = useState<"choose" | "phone">("choose");
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loaded, setLoaded] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { requestAnimationFrame(() => setLoaded(true)); }, []);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className={`dz-signin-page${loaded ? " dz-loaded" : ""}`}>
      <WebGLBg />

      {/* Back nav */}
      <nav className="dz-signin-nav dz-anim-fade">
        <Link to="/doczoc" className="dz-signin-back">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem" }}>D</div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e8f0" }}>DocZoc</span>
        </Link>
      </nav>

      {/* Sign-in card */}
      <main className="dz-signin-main">
        <div className="dz-sso-card dz-anim-scale" style={{ animationDelay: "0.1s" }}>
          {/* Decorative top glow */}
          <div className="dz-sso-glow" />

          <div className="dz-sso-header">
            <div className="dz-sso-icon-wrap dz-anim-up" style={{ animationDelay: "0.2s" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10" stroke="#34d399" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="dz-anim-up" style={{ animationDelay: "0.25s" }}>Welcome to DocZoc</h1>
            <p className="dz-anim-up" style={{ animationDelay: "0.3s" }}>Secure access to your provider portal</p>
          </div>

          {mode === "choose" && !codeSent && (
            <div className="dz-sso-buttons">
              <Link to="/doczoc/dashboard" className="dz-sso-btn dz-sso-google dz-anim-up" style={{ animationDelay: "0.35s" }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "auto", opacity: 0.4 }}><polyline points="9 18 15 12 9 6"/></svg>
              </Link>

              <div className="dz-sso-divider dz-anim-fade" style={{ animationDelay: "0.4s" }}>
                <span>or</span>
              </div>

              <button
                className="dz-sso-btn dz-sso-phone dz-anim-up"
                style={{ animationDelay: "0.45s" }}
                onClick={() => setMode("phone")}
              >
                <div className="dz-sso-phone-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12" y2="18"/>
                  </svg>
                </div>
                <span>Continue with Phone Number</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "auto", opacity: 0.4 }}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}

          {mode === "phone" && !codeSent && (
            <div className="dz-sso-phone-form">
              <button className="dz-sso-back-btn" onClick={() => setMode("choose")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <div className="dz-sso-field">
                <label htmlFor="phone">Phone number</label>
                <div className="dz-phone-input-wrap">
                  <span className="dz-phone-prefix">+1</span>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(917) 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    autoFocus
                  />
                </div>
              </div>
              <button
                className="dz-sso-submit"
                onClick={() => setCodeSent(true)}
                disabled={phone.replace(/\D/g, "").length < 10}
              >
                Send Verification Code
              </button>
              <p className="dz-sso-hint">We'll text you a 6-digit code to verify your identity.</p>
            </div>
          )}

          {codeSent && (
            <div className="dz-sso-verify">
              <button className="dz-sso-back-btn" onClick={() => { setCodeSent(false); setCode(["","","","","",""]); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <div className="dz-verify-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <p className="dz-verify-text">Enter the 6-digit code sent to<br /><strong>{phone}</strong></p>
              <div className="dz-code-inputs">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="dz-code-input"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <Link
                to="/doczoc/dashboard"
                className={`dz-sso-submit${code.every(d => d) ? "" : " disabled"}`}
                onClick={(e) => { if (!code.every(d => d)) e.preventDefault(); }}
              >
                Verify & Sign In
              </Link>
              <button className="dz-resend-btn" onClick={() => setCode(["","","","","",""])}>
                Didn't receive the code? <span>Resend</span>
              </button>
            </div>
          )}

          <p className="dz-sso-footer-text dz-anim-fade" style={{ animationDelay: "0.5s" }}>
            By signing in you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a>
          </p>
        </div>
      </main>
    </div>
  );
}
