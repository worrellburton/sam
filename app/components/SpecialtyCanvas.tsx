import { useRef, useEffect } from "react";

const VERTEX_SHADER = `attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAGMENT_SHADERS: Record<string, string> = {
  "sports-medicine": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.4;
      float v = 0.0;
      for (float i = 1.0; i < 8.0; i++) {
        uv.y += sin(uv.x * 3.0 * i + t * (0.5 + i * 0.2)) * 0.08 / i;
        uv.x += cos(uv.y * 2.5 * i + t * (0.3 + i * 0.15)) * 0.06 / i;
        v += sin(uv.x * 6.0 + t) * 0.5 + 0.5;
      }
      v /= 7.0;
      vec3 c1 = vec3(0.04, 0.12, 0.30);
      vec3 c2 = vec3(0.08, 0.35, 0.55);
      vec3 c3 = vec3(0.15, 0.50, 0.65);
      vec3 col = mix(c1, c2, v);
      col = mix(col, c3, smoothstep(0.5, 0.9, v));
      gl_FragColor = vec4(col, 1.0);
    }`,

  "arthroscopic-surgery": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    void main() {
      vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
      float t = u_time * 0.3;
      float a = atan(uv.y, uv.x);
      float r = length(uv);
      float v = sin(a * 6.0 + t) * cos(r * 12.0 - t * 1.5) * 0.5 + 0.5;
      v += sin(r * 8.0 - t * 0.8 + a * 3.0) * 0.3;
      float ring = smoothstep(0.01, 0.0, abs(sin(r * 15.0 - t) * 0.5) - 0.48);
      vec3 c1 = vec3(0.06, 0.10, 0.22);
      vec3 c2 = vec3(0.10, 0.30, 0.50);
      vec3 c3 = vec3(0.20, 0.55, 0.70);
      vec3 col = mix(c1, c2, v);
      col += c3 * ring * 0.3;
      gl_FragColor = vec4(col, 1.0);
    }`,

  "regenerative-medicine": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.3;
      vec3 col = vec3(0.04, 0.10, 0.22);
      float wave = sin(uv.x * 8.0 + t) * cos(uv.y * 6.0 - t * 0.7) * 0.08;
      col += vec3(0.02, 0.06, 0.10) * (wave + 0.5);
      for (float i = 0.0; i < 20.0; i++) {
        vec2 pos = vec2(rand(vec2(i, 0.0)), fract(rand(vec2(0.0, i)) + t * (0.05 + rand(vec2(i, i)) * 0.08)));
        float sz = 0.005 + rand(vec2(i, 2.0)) * 0.008;
        float d = length(uv - pos);
        float glow = sz / (d * d + 0.001);
        vec3 pc = mix(vec3(0.1, 0.4, 0.6), vec3(0.15, 0.55, 0.5), rand(vec2(i, 3.0)));
        col += pc * glow * 0.0004;
      }
      gl_FragColor = vec4(col, 1.0);
    }`,

  "joint-preservation": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    void main() {
      vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
      float t = u_time * 0.25;
      float r = length(uv);
      float a = atan(uv.y, uv.x);
      float v = 0.0;
      for (float i = 0.0; i < 5.0; i++) {
        float offset = i * 0.15 + 0.2;
        float wave = sin(a * (3.0 + i) + t * (0.5 + i * 0.2)) * 0.04;
        v += smoothstep(0.02, 0.0, abs(r - offset - wave)) * (1.0 - i * 0.15);
      }
      float bg = sin(uv.x * 4.0 + t) * sin(uv.y * 4.0 + t * 0.7) * 0.1 + 0.15;
      vec3 c1 = vec3(0.04, 0.14, 0.25);
      vec3 c2 = vec3(0.06, 0.40, 0.50);
      vec3 c3 = vec3(0.10, 0.55, 0.65);
      vec3 col = mix(c1, c1 + 0.05, bg);
      col += mix(c2, c3, r) * v;
      gl_FragColor = vec4(col, 1.0);
    }`,

  "cartilage-repair": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.2;
      vec2 st = uv * 5.0;
      vec2 i_st = floor(st);
      vec2 f_st = fract(st);
      float md = 1.0;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = hash(i_st + neighbor);
          point = 0.5 + 0.5 * sin(t + 6.2831 * point);
          float d = length(neighbor + point - f_st);
          md = min(md, d);
        }
      }
      vec3 c1 = vec3(0.05, 0.12, 0.28);
      vec3 c2 = vec3(0.08, 0.32, 0.48);
      vec3 c3 = vec3(0.15, 0.48, 0.58);
      vec3 col = mix(c2, c1, md);
      col += c3 * smoothstep(0.04, 0.0, md - 0.02) * 0.5;
      col += vec3(0.03, 0.06, 0.08) * (1.0 - md);
      gl_FragColor = vec4(col, 1.0);
    }`,

  "shoulder-knee-surgery": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.25;
      float v = 0.0;
      for (float i = 1.0; i < 6.0; i++) {
        float s = sin(uv.x * 10.0 * i * 0.3 + t + i) * 0.5 + 0.5;
        float c = cos(uv.y * 8.0 * i * 0.3 - t * 0.7 + i * 1.5) * 0.5 + 0.5;
        float line1 = smoothstep(0.02, 0.0, abs(s - uv.y) - 0.005);
        float line2 = smoothstep(0.02, 0.0, abs(c - uv.x) - 0.005);
        v += (line1 + line2) * (0.4 / i);
      }
      float pulse = sin(length(uv - 0.5) * 12.0 - t * 2.0) * 0.1 + 0.1;
      vec3 c1 = vec3(0.04, 0.10, 0.24);
      vec3 c2 = vec3(0.10, 0.35, 0.55);
      vec3 c3 = vec3(0.15, 0.50, 0.65);
      vec3 col = c1 + pulse;
      col += mix(c2, c3, uv.y) * v;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function SpecialtyCanvas({ slug }: { slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fsrc = FRAGMENT_SHADERS[slug];
    if (!fsrc) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) {
      canvas.style.background = "#0a1628";
      return;
    }

    function resize() {
      if (!canvas || !gl) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");

    resize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener("resize", handleResize);

    runningRef.current = false;

    function frame(t: number) {
      if (!runningRef.current || !gl || !canvas) return;
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(frame);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !runningRef.current) {
            runningRef.current = true;
            resize();
            requestAnimationFrame(frame);
          } else if (!e.isIntersecting) {
            runningRef.current = false;
          }
        });
      },
      { threshold: 0.05 }
    );
    obs.observe(canvas);

    return () => {
      runningRef.current = false;
      obs.disconnect();
      window.removeEventListener("resize", handleResize);
      gl.deleteProgram(prog);
    };
  }, [slug]);

  return <canvas ref={canvasRef} className="specialty-canvas" />;
}
