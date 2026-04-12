"use client";

import { useRef, useEffect } from "react";

const VERT = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

// Slow-moving gradient that blends navy, dark blue, and a hint of warm gold
// Barely visible — meant to layer on top of the hero overlay at low opacity
const FRAG = `precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Slow drifting coordinates
  float t = u_time * 0.08;

  // Layered sine waves for organic movement
  float n1 = sin(uv.x * 2.0 + t) * cos(uv.y * 1.5 - t * 0.7) * 0.5 + 0.5;
  float n2 = sin(uv.x * 1.2 - t * 0.5 + 1.0) * cos(uv.y * 2.8 + t * 0.3) * 0.5 + 0.5;
  float n3 = sin((uv.x + uv.y) * 1.8 + t * 0.4) * 0.5 + 0.5;

  float blend = n1 * 0.4 + n2 * 0.35 + n3 * 0.25;

  // Color palette: deep navy to slightly warmer dark blue with a whisper of gold
  vec3 navy    = vec3(0.039, 0.086, 0.157);  // #0a1628
  vec3 midBlue = vec3(0.055, 0.118, 0.220);  // #0e1e38
  vec3 warmNav = vec3(0.078, 0.106, 0.180);  // #141b2e with warmth
  vec3 gold    = vec3(0.20, 0.17, 0.11);     // very muted gold

  vec3 col = mix(navy, midBlue, blend);
  col = mix(col, warmNav, n2 * 0.4);
  // Barely perceptible gold shimmer in the top-right area
  float goldMask = smoothstep(0.3, 1.0, uv.x) * smoothstep(0.3, 1.0, uv.y) * n3;
  col = mix(col, gold, goldMask * 0.15);

  gl_FragColor = vec4(col, 1.0);
}`;

export function HeroGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;

    // Compile shaders
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();

    function render() {
      const t = (performance.now() - start) / 1000;
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-webgl-canvas"
      aria-hidden="true"
    />
  );
}
