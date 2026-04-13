"use client";

import { useEffect, useRef } from "react";

/**
 * Animated dark overlay for the hero image. Two slowly counter-rotating
 * linear gradients in the site's navy + muted-gold palette, layered on
 * top of the static `.hero-overlay` (which acts as a no-WebGL fallback).
 *
 * The alpha ramps along the 135deg diagonal (darker top-left, lighter
 * bottom-right) so nav + headline contrast is preserved while the
 * right-side image breathes through. Movement is intentionally very
 * slow — one visible cycle spans minutes.
 */

const VERT = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Aspect-corrected centered coords so the bands read evenly on wide screens
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  // Slow base time — one full axis rotation takes ~90s
  float t = u_time * 0.035;

  // Gradient 1 — direction rotates one way
  float a1 = t * 0.55;
  vec2 d1 = vec2(cos(a1), sin(a1));
  float band1 = sin(dot(p, d1) * 1.5 + t * 0.7) * 0.5 + 0.5;

  // Gradient 2 — rotates the other way at a different rate
  float a2 = -t * 0.40 + 2.1;
  vec2 d2 = vec2(cos(a2), sin(a2));
  float band2 = sin(dot(p, d2) * 1.1 - t * 0.55 + 0.7) * 0.5 + 0.5;

  // Palette — brighter than the previous version so the bands actually
  // read through the partial alpha. Still firmly in the navy range.
  vec3 deepNavy = vec3(0.035, 0.080, 0.150);
  vec3 navy     = vec3(0.060, 0.120, 0.215);
  vec3 steel    = vec3(0.090, 0.175, 0.290);
  vec3 gold     = vec3(0.240, 0.190, 0.090);

  vec3 col = mix(deepNavy, navy, band1);
  col = mix(col, steel, band2 * 0.55);

  // Gold whisper drifts through the upper-right area only
  float goldArea = smoothstep(0.45, 1.0, uv.x) * smoothstep(0.30, 1.0, uv.y);
  float goldBlend = goldArea * band1 * band2 * 0.22;
  col = mix(col, gold, goldBlend);

  // Gentle vignette — edges sit a touch darker than the center
  float vig = 1.0 - smoothstep(0.3, 0.95, length(uv - vec2(0.5, 0.55)));
  col *= 0.88 + vig * 0.12;

  // Alpha ramp along 135deg — dark at top-left for nav legibility,
  // light at bottom-right so the image shows through cleanly.
  float diag = (uv.x + (1.0 - uv.y)) * 0.5;
  float alpha = mix(0.62, 0.22, diag);

  gl_FragColor = vec4(col, alpha);
}`;

export function HeroOverlayGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) {
      // No WebGL — static .hero-overlay already covers this case.
      return;
    }

    function compile(type: number, src: string): WebGLShader | null {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.warn("HeroOverlayGradient shader compile failed:", gl!.getShaderInfoLog(s));
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      // eslint-disable-next-line no-console
      console.warn("HeroOverlayGradient program link failed:", gl.getProgramInfoLog(prog));
      return;
    }
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

    // Premultiply the shader's alpha ourselves via blend func so the
    // canvas composites cleanly over the hero image + static overlay.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function sizeToParent() {
      // Fallback to offsetWidth if clientWidth is 0 on first frame,
      // and to a minimum 1x1 so drawArrays never silently draws into
      // a zero-sized framebuffer.
      const dpr = Math.min(window.devicePixelRatio || 1, 1);
      const parent = canvas!.parentElement;
      const w =
        canvas!.clientWidth ||
        canvas!.offsetWidth ||
        parent?.clientWidth ||
        window.innerWidth ||
        1;
      const h =
        canvas!.clientHeight ||
        canvas!.offsetHeight ||
        parent?.clientHeight ||
        window.innerHeight ||
        1;
      const targetW = Math.max(1, Math.floor(w * dpr));
      const targetH = Math.max(1, Math.floor(h * dpr));
      if (canvas!.width !== targetW || canvas!.height !== targetH) {
        canvas!.width = targetW;
        canvas!.height = targetH;
        gl!.viewport(0, 0, targetW, targetH);
      }
    }

    sizeToParent();

    // Keep the canvas in sync with layout — the hero image loads async,
    // and viewport resizes change the aspect-corrected UVs.
    const ro = new ResizeObserver(sizeToParent);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    ro.observe(canvas);
    window.addEventListener("resize", sizeToParent);

    const start = performance.now();

    function render() {
      sizeToParent();
      const t = reduced ? 0 : (performance.now() - start) / 1000;
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      if (!reduced) rafRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("resize", sizeToParent);
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
