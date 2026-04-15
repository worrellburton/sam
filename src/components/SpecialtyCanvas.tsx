"use client";
import { useRef, useEffect } from "react";

const VERTEX_SHADER = `attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAGMENT_SHADERS: Record<string, string> = {
  // DNA double helix with floating nucleotides
  "sports-medicine": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.4;
      vec3 col = vec3(0.03, 0.06, 0.14);
      float x = uv.x * 6.2832 * 2.0;
      for (float i = 0.0; i < 3.0; i++) {
        float offset = i * 2.094;
        float helix1 = sin(x + t + offset) * 0.12 + 0.5;
        float helix2 = sin(x + t + offset + 3.14159) * 0.12 + 0.5;
        float strand1 = smoothstep(0.008, 0.0, abs(uv.y - helix1)) * (0.6 - i * 0.15);
        float strand2 = smoothstep(0.008, 0.0, abs(uv.y - helix2)) * (0.6 - i * 0.15);
        col += vec3(0.1, 0.3, 0.7) * strand1;
        col += vec3(0.1, 0.5, 0.6) * strand2;
        for (float j = 0.0; j < 12.0; j++) {
          float px = (j + 0.5) / 12.0;
          float py1 = sin(px * 6.2832 * 2.0 + t + offset) * 0.12 + 0.5;
          float py2 = sin(px * 6.2832 * 2.0 + t + offset + 3.14159) * 0.12 + 0.5;
          float rung = smoothstep(0.004, 0.0, abs(uv.x - px)) *
            step(min(py1, py2), uv.y) * step(uv.y, max(py1, py2)) * 0.25;
          col += vec3(0.2, 0.5, 0.8) * rung * (0.5 - i * 0.1);
          float dot1 = smoothstep(0.012, 0.005, length(uv - vec2(px, py1)));
          float dot2 = smoothstep(0.012, 0.005, length(uv - vec2(px, py2)));
          col += vec3(0.3, 0.6, 1.0) * dot1 * 0.4;
          col += vec3(0.2, 0.8, 0.7) * dot2 * 0.4;
        }
      }
      col += vec3(0.02, 0.04, 0.08) * sin(uv.x * 20.0 + t) * sin(uv.y * 15.0 - t * 0.5) * 0.5;
      gl_FragColor = vec4(col, 1.0);
    }`,

  // Arthroscopic camera view — circular lens with tissue fibers
  "arthroscopic-surgery": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    void main() {
      vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
      float t = u_time * 0.3;
      float r = length(uv);
      float a = atan(uv.y, uv.x);
      vec3 col = vec3(0.03, 0.08, 0.18);
      float lens = smoothstep(0.65, 0.62, r);
      float rim = smoothstep(0.62, 0.60, r) - smoothstep(0.60, 0.58, r);
      for (float i = 0.0; i < 8.0; i++) {
        float ang = i * 0.785 + t * 0.2;
        float fiber = sin(uv.x * cos(ang) * 15.0 + uv.y * sin(ang) * 15.0 + t + i) * 0.5 + 0.5;
        fiber = smoothstep(0.45, 0.55, fiber) * 0.08;
        col += vec3(0.1, 0.25, 0.45) * fiber * lens;
      }
      float tissue = sin(a * 8.0 + r * 20.0 - t) * 0.5 + 0.5;
      col += vec3(0.05, 0.15, 0.3) * tissue * 0.15 * lens;
      float light = smoothstep(0.4, 0.0, length(uv - vec2(0.1, 0.1))) * 0.3;
      col += vec3(0.2, 0.5, 0.7) * light * lens;
      col += vec3(0.15, 0.4, 0.7) * rim * 0.8;
      float vignette = smoothstep(0.65, 0.3, r);
      col *= 0.7 + vignette * 0.3;
      float crosshair = smoothstep(0.003, 0.0, abs(uv.x)) * step(r, 0.08) +
                         smoothstep(0.003, 0.0, abs(uv.y)) * step(r, 0.08);
      col += vec3(0.1, 0.4, 0.6) * crosshair * 0.3;
      gl_FragColor = vec4(col, 1.0);
    }`,

  // Platelets and blood cells — floating circular cells with glow
  "regenerative-medicine": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.25;
      vec3 col = vec3(0.03, 0.06, 0.15);
      float flow = sin(uv.x * 3.0 + t) * 0.02;
      uv.y += flow;
      for (float i = 0.0; i < 25.0; i++) {
        float phase = rand(vec2(i, 7.0));
        vec2 pos = vec2(
          fract(rand(vec2(i, 0.0)) + t * (0.02 + phase * 0.04)),
          fract(rand(vec2(0.0, i)) + t * (0.01 + rand(vec2(i, 5.0)) * 0.03))
        );
        float sz = 0.02 + rand(vec2(i, 2.0)) * 0.035;
        float d = length(uv - pos);
        float cell = smoothstep(sz, sz - 0.006, d);
        float membrane = smoothstep(sz, sz - 0.003, d) - smoothstep(sz - 0.003, sz - 0.006, d);
        float nucleus = smoothstep(sz * 0.35, sz * 0.25, d);
        vec3 cellCol = mix(vec3(0.08, 0.2, 0.45), vec3(0.1, 0.35, 0.5), phase);
        col += cellCol * cell * 0.25;
        col += vec3(0.15, 0.4, 0.6) * membrane * 0.4;
        col += vec3(0.1, 0.25, 0.5) * nucleus * 0.3;
        col += cellCol * 0.0002 / (d * d + 0.001);
      }
      gl_FragColor = vec4(col, 1.0);
    }`,

  // Cartilage matrix — honeycomb-like chondrocyte pattern
  "joint-preservation": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.15;
      vec2 st = uv * 6.0;
      vec2 i_st = floor(st);
      vec2 f_st = fract(st);
      float md = 1.0;
      vec2 mp;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = hash(i_st + neighbor);
          point = 0.5 + 0.35 * sin(t * 2.0 + 6.2831 * point);
          float d = length(neighbor + point - f_st);
          if (d < md) { md = d; mp = point; }
        }
      }
      vec3 col = vec3(0.03, 0.08, 0.18);
      float cellBody = smoothstep(0.5, 0.15, md);
      float membrane = smoothstep(0.03, 0.0, abs(md - 0.35)) * 0.6;
      float nucleus = smoothstep(0.15, 0.08, md);
      col += vec3(0.06, 0.18, 0.35) * cellBody;
      col += vec3(0.12, 0.35, 0.55) * membrane;
      col += vec3(0.08, 0.22, 0.42) * nucleus * 0.5;
      float matrix = smoothstep(0.02, 0.0, abs(md - 0.45));
      col += vec3(0.1, 0.3, 0.5) * matrix * 0.4;
      float pulse = sin(t * 3.0 + mp.x * 6.28) * 0.5 + 0.5;
      col += vec3(0.05, 0.15, 0.3) * nucleus * pulse * 0.3;
      gl_FragColor = vec4(col, 1.0);
    }`,

  // Collagen fibers — interwoven tissue strands with shimmer
  "cartilage-repair": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.2;
      vec3 col = vec3(0.03, 0.07, 0.16);
      for (float i = 0.0; i < 12.0; i++) {
        float offset = rand(vec2(i, 0.0)) * 6.28;
        float freq = 3.0 + i * 0.7;
        float amp = 0.08 + rand(vec2(i, 1.0)) * 0.06;
        float speed = 0.3 + rand(vec2(i, 2.0)) * 0.4;
        float yBase = rand(vec2(i, 3.0));
        float fiber = sin(uv.x * freq + t * speed + offset) * amp + yBase;
        float d = abs(uv.y - fiber);
        float strand = smoothstep(0.015, 0.002, d);
        float shimmer = sin(uv.x * 30.0 + t * 2.0 + i) * 0.5 + 0.5;
        vec3 fiberCol = mix(vec3(0.08, 0.22, 0.42), vec3(0.12, 0.38, 0.58), rand(vec2(i, 4.0)));
        col += fiberCol * strand * (0.15 + shimmer * 0.1);
        float node = smoothstep(0.01, 0.004, d) * step(0.92, sin(uv.x * 20.0 + i * 2.0));
        col += vec3(0.15, 0.45, 0.65) * node * 0.3;
      }
      float glow = sin(uv.x * 4.0 + t) * sin(uv.y * 3.0 - t * 0.5) * 0.04;
      col += vec3(0.04, 0.1, 0.2) * (glow + 0.5);
      gl_FragColor = vec4(col, 1.0);
    }`,

  // Bone cross-section — trabecular bone pattern with marrow
  "shoulder-knee-surgery": `precision mediump float;
    uniform float u_time; uniform vec2 u_res;
    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.15;
      vec3 col = vec3(0.04, 0.08, 0.18);
      vec2 st = uv * 4.0;
      vec2 i_st = floor(st);
      vec2 f_st = fract(st);
      float md1 = 1.0, md2 = 1.0;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 nb = vec2(float(x), float(y));
          vec2 pt = hash(i_st + nb);
          pt = 0.5 + 0.4 * sin(t + 6.2831 * pt);
          float d = length(nb + pt - f_st);
          if (d < md1) { md2 = md1; md1 = d; }
          else if (d < md2) { md2 = d; }
        }
      }
      float edge = md2 - md1;
      float trabecular = smoothstep(0.05, 0.02, edge);
      col += vec3(0.1, 0.28, 0.5) * trabecular * 0.7;
      float marrow = smoothstep(0.3, 0.15, md1);
      col += vec3(0.06, 0.15, 0.32) * marrow * 0.4;
      float pulse = sin(t * 2.0 + md1 * 8.0) * 0.5 + 0.5;
      col += vec3(0.05, 0.12, 0.25) * pulse * trabecular * 0.3;
      float cortex = smoothstep(0.08, 0.04, edge) * smoothstep(0.04, 0.08, md1);
      col += vec3(0.08, 0.2, 0.4) * cortex * 0.2;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function SpecialtyCanvas({
  slug,
  className = "specialty-canvas",
}: {
  slug: string;
  /** Override the default class so the same canvas can back other
   *  sections (e.g. the "Get Started" CTA). Still fills its parent. */
  className?: string;
}) {
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

  return <canvas ref={canvasRef} className={className} />;
}
