"use client";

import { useEffect, useRef } from "react";

/**
 * Animated dark overlay for the hero image. Renders the same dark-navy
 * wash the static `.hero-overlay` provided, but as two slowly-rotating
 * linear gradients crossing each other, with a whisper of muted gold
 * that drifts through the upper-right. Movement is intentionally very
 * slow — one cycle takes minutes — so the effect reads as ambient
 * depth rather than motion. Opacity ramps along the 135deg axis so
 * top-left stays dark (nav legibility) and bottom-right is lighter,
 * matching the original CSS gradient's alpha falloff.
 */

const VERT = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Aspect-corrected centered coords so the bands read evenly on wide screens
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  // Extremely slow base time
  float t = u_time * 0.02;

  // Gradient 1 — direction rotates slowly one way
  float a1 = t * 0.40;
  vec2 d1 = vec2(cos(a1), sin(a1));
  float band1 = sin(dot(p, d1) * 1.4 + t * 0.6) * 0.5 + 0.5;

  // Gradient 2 — rotates the other direction at a different rate,
  // so the two bands cross each other on their own schedule
  float a2 = -t * 0.28 + 2.1;
  vec2 d2 = vec2(cos(a2), sin(a2));
  float band2 = sin(dot(p, d2) * 1.0 - t * 0.45 + 0.7) * 0.5 + 0.5;

  // Palette — three dark-navy tones plus a muted gold whisper
  vec3 deepNavy = vec3(0.020, 0.055, 0.110);
  vec3 navy     = vec3(0.039, 0.086, 0.157); // matches site --hero-bg #0a1628
  vec3 steel    = vec3(0.055, 0.125, 0.210);
  vec3 gold     = vec3(0.180, 0.140, 0.070); // barely saturated

  vec3 col = mix(deepNavy, navy, band1);
  col = mix(col, steel, band2 * 0.45);

  // Soft gold drift — only in the upper-right area, modulated by both bands
  float goldArea = smoothstep(0.45, 1.0, uv.x) * smoothstep(0.35, 1.0, uv.y);
  float goldBlend = goldArea * band1 * band2 * 0.18;
  col = mix(col, gold, goldBlend);

  // Gentle radial vignette keeps the edges a touch darker
  float vig = 1.0 - smoothstep(0.3, 0.95, length(uv - vec2(0.5, 0.55)));
  col *= 0.84 + vig * 0.16;

  // Alpha ramps along the 135deg axis to mirror the original overlay:
  // 0.92 at top-left -> 0.60 at bottom-right
  float diag = (uv.x + (1.0 - uv.y)) * 0.5;
  float alpha = mix(0.92, 0.60, diag);

  gl_FragColor = vec4(col, alpha);
}`;

export function HeroOverlayGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect user preference — don't animate if reduced motion is requested.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

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

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    function resize() {
      // Cap DPR at 1 — this is a background overlay, extra pixels buy nothing
      const dpr = Math.min(window.devicePixelRatio, 1);
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();

    function render() {
      const t = reduced ? 0 : (performance.now() - start) / 1000;
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      if (!reduced) rafRef.current = requestAnimationFrame(render);
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
      className="hero-overlay-webgl"
      aria-hidden="true"
    />
  );
}
