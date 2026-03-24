export const BG_VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// All backgrounds are flowing wave patterns that sweep horizontally.
// Each receives u_dark (1.0 = dark, 0.0 = light) for theme-aware colors.
export const BG_PRESETS = [
  {
    id: "pulse",
    label: "Vital Pulse",
    desc: "Smooth flowing pulse waves",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.15;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 c1 = mix(vec3(0.55, 0.48, 0.95), vec3(0.45, 0.38, 0.92), u_dark);
        vec3 c2 = mix(vec3(0.35, 0.65, 0.92), vec3(0.25, 0.55, 0.88), u_dark);

        float w = 0.0;
        for (float i = 1.0; i <= 6.0; i++) {
          float amp = 0.12 / i;
          float freq = i * 1.8;
          float speed = t * (0.8 + i * 0.15);
          w += sin(uv.x * freq + speed + sin(uv.y * 2.0 + t * 0.3) * 0.5) * amp;
          w += cos(uv.x * freq * 0.7 - speed * 0.6 + uv.y * i * 0.8) * amp * 0.5;
        }
        w = w * 0.5 + 0.5;

        float band1 = smoothstep(0.3, 0.5, w) - smoothstep(0.5, 0.7, w);
        float band2 = smoothstep(0.5, 0.7, w) - smoothstep(0.7, 0.9, w);
        float glow = smoothstep(0.2, 0.6, w) * 0.35;

        vec3 col = bg;
        col = mix(col, c1, glow + band1 * 0.5);
        col = mix(col, c2, band2 * 0.4);
        col = mix(col, mix(c1, c2, 0.5), smoothstep(0.45, 0.55, w) * 0.25);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "cells",
    label: "Plasma Flow",
    desc: "Soft layered current waves",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.12;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 c1 = mix(vec3(0.75, 0.3, 0.4), vec3(0.65, 0.2, 0.35), u_dark);
        vec3 c2 = mix(vec3(0.9, 0.45, 0.5), vec3(0.8, 0.35, 0.45), u_dark);
        vec3 c3 = mix(vec3(0.55, 0.25, 0.55), vec3(0.5, 0.2, 0.5), u_dark);

        float w1 = sin(uv.x * 3.0 + t + sin(uv.y * 4.0 + t * 0.5) * 0.6) * 0.5 + 0.5;
        float w2 = sin(uv.x * 2.0 - t * 0.7 + cos(uv.y * 3.0 - t * 0.3) * 0.8) * 0.5 + 0.5;
        float w3 = sin(uv.x * 4.5 + t * 0.5 + sin(uv.y * 2.5 + t * 0.8) * 0.4) * 0.5 + 0.5;

        float f1 = smoothstep(0.25, 0.55, w1) * 0.4;
        float f2 = smoothstep(0.3, 0.6, w2) * 0.35;
        float f3 = smoothstep(0.35, 0.65, w3) * 0.3;

        vec3 col = bg;
        col = mix(col, c1, f1);
        col = mix(col, c2, f2);
        col = mix(col, c3, f3);

        // Bright crests
        float crest = pow(w1 * w2, 2.0) * 0.3;
        col = mix(col, mix(c1, c2, 0.5) + 0.15, crest);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "helix",
    label: "Helix Drift",
    desc: "Intertwining wave ribbons",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.12;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 c1 = mix(vec3(0.45, 0.35, 0.85), vec3(0.5, 0.38, 0.92), u_dark);
        vec3 c2 = mix(vec3(0.2, 0.6, 0.8), vec3(0.25, 0.65, 0.88), u_dark);

        float intensity = 0.0;
        vec3 tint = vec3(0.0);

        for (float i = 0.0; i < 8.0; i++) {
          float offset = i * 0.12;
          float phase = uv.x * 5.0 - t * 1.5 + i * 0.8;

          // Two intertwined sine ribbons
          float y1 = 0.5 + sin(phase) * (0.15 + i * 0.02) + offset - 0.5;
          float y2 = 0.5 + sin(phase + 3.14159) * (0.15 + i * 0.02) + offset - 0.5;

          float d1 = abs(uv.y - y1);
          float d2 = abs(uv.y - y2);

          float s1 = smoothstep(0.04, 0.005, d1) * (0.5 - i * 0.04);
          float s2 = smoothstep(0.04, 0.005, d2) * (0.5 - i * 0.04);

          float g1 = exp(-d1 * d1 * 200.0) * 0.25;
          float g2 = exp(-d2 * d2 * 200.0) * 0.25;

          intensity += s1 + s2 + g1 + g2;
          tint += c1 * (s1 + g1) + c2 * (s2 + g2);
        }

        vec3 col = bg;
        col = mix(col, tint / max(intensity, 0.01), clamp(intensity, 0.0, 0.85));
        col = mix(bg, col, clamp(intensity * 2.0, 0.0, 1.0));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "tissue",
    label: "Neural Tide",
    desc: "Undulating neural wave field",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.1;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 c1 = mix(vec3(0.35, 0.45, 0.88), vec3(0.4, 0.5, 0.95), u_dark);
        vec3 c2 = mix(vec3(0.25, 0.7, 0.75), vec3(0.3, 0.8, 0.85), u_dark);
        vec3 c3 = mix(vec3(0.55, 0.35, 0.8), vec3(0.65, 0.45, 0.9), u_dark);

        // Distorted wave field using noise
        vec2 q = uv;
        q.x += noise(uv * 3.0 + t * 0.5) * 0.15;
        q.y += noise(uv * 2.5 - t * 0.3) * 0.1;

        float w1 = sin(q.x * 6.0 + t * 1.2 + noise(q * 4.0 + t) * 2.0) * 0.5 + 0.5;
        float w2 = sin(q.x * 4.0 - t * 0.8 + noise(q * 3.0 - t * 0.5) * 2.5) * 0.5 + 0.5;
        float w3 = sin(q.x * 8.0 + t * 0.6 + q.y * 3.0) * 0.5 + 0.5;

        vec3 col = bg;
        col = mix(col, c1, smoothstep(0.3, 0.6, w1) * 0.45);
        col = mix(col, c2, smoothstep(0.35, 0.65, w2) * 0.35);
        col = mix(col, c3, smoothstep(0.4, 0.7, w3) * 0.25);

        // Bright wave crests
        float crest = pow(max(w1, w2), 3.0) * 0.2;
        col += crest * mix(c1, c2, 0.5);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "breath",
    label: "Respira",
    desc: "Deep breathing wave rhythm",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.1;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 c1 = mix(vec3(0.2, 0.65, 0.82), vec3(0.25, 0.7, 0.9), u_dark);
        vec3 c2 = mix(vec3(0.15, 0.5, 0.7), vec3(0.2, 0.55, 0.78), u_dark);

        // Slow breathing modulation
        float breath = sin(t * 0.8) * 0.5 + 0.5;
        breath = pow(breath, 0.6);

        float w = 0.0;
        for (float i = 1.0; i <= 8.0; i++) {
          float amp = (0.08 / i) * (0.7 + breath * 0.6);
          float freq = i * 1.5;
          float speed = t * (0.6 + i * 0.1);
          w += sin(uv.x * freq + speed + uv.y * i * 0.3) * amp;
          w += cos(uv.x * freq * 0.6 - speed * 0.4 + uv.y * 2.0) * amp * 0.6;
        }
        w = w * 0.5 + 0.5;

        // Wide flowing bands
        float f1 = smoothstep(0.2, 0.5, w) * 0.5;
        float f2 = smoothstep(0.5, 0.8, w) * 0.4;

        vec3 col = bg;
        col = mix(col, c1, f1);
        col = mix(col, c2, f2);

        // Breathing brightness pulse
        col = mix(col, mix(c1, c2, 0.5) + 0.1, smoothstep(0.55, 0.65, w) * breath * 0.3);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "marrow",
    label: "Biofield",
    desc: "Organic flowing gradient waves",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.08;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 c1 = mix(vec3(0.6, 0.4, 0.8), vec3(0.55, 0.35, 0.85), u_dark);
        vec3 c2 = mix(vec3(0.35, 0.55, 0.85), vec3(0.3, 0.5, 0.9), u_dark);
        vec3 c3 = mix(vec3(0.25, 0.7, 0.65), vec3(0.2, 0.65, 0.7), u_dark);

        // Warped coordinates for organic feel
        vec2 q = uv;
        q += vec2(
          noise(uv * 2.0 + t * 0.4) * 0.12,
          noise(uv * 2.5 + t * 0.3 + 50.0) * 0.1
        );

        // Three flowing wave layers
        float w1 = sin(q.x * 4.0 + t * 1.0 + q.y * 1.5) * 0.5 + 0.5;
        float w2 = sin(q.x * 3.0 - t * 0.7 + q.y * 2.5 + 1.0) * 0.5 + 0.5;
        float w3 = sin(q.x * 5.0 + t * 0.5 - q.y * 1.0 + 2.0) * 0.5 + 0.5;

        vec3 col = bg;
        col = mix(col, c1, smoothstep(0.25, 0.6, w1) * 0.45);
        col = mix(col, c2, smoothstep(0.3, 0.65, w2) * 0.4);
        col = mix(col, c3, smoothstep(0.35, 0.7, w3) * 0.3);

        // Intersection highlights
        float overlap = w1 * w2 * w3;
        col += overlap * mix(c1, c3, 0.5) * 0.2;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
