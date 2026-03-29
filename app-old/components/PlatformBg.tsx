import { useEffect, useRef } from "react";
import { BG_VERT, BG_PRESETS } from "~/data/doczoc-bg";

function isDarkMode() {
  return document.documentElement.getAttribute("data-theme") !== "light";
}

export function PlatformBg({ bgId }: { bgId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (bgId === "none") return;
    const preset = BG_PRESETS.find((p) => p.id === bgId);
    if (!preset) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, BG_VERT);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, preset.frag);
    gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const posLoc = gl.getAttribLocation(prog, "a_pos");
    const timeLoc = gl.getUniformLocation(prog, "u_time");
    const resLoc = gl.getUniformLocation(prog, "u_res");
    const darkLoc = gl.getUniformLocation(prog, "u_dark");

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();

    function frame() {
      if (!gl) return;
      resize();
      gl.viewport(0, 0, canvas!.width, canvas!.height);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLoc, (performance.now() - start) / 1000);
      gl.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl.uniform1f(darkLoc, isDarkMode() ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [bgId]);

  if (bgId === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="dz-platform-bg"
    />
  );
}
