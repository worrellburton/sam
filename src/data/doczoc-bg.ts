export const BG_VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Dark, subtle, moody backgrounds inspired by Flow Waves / Aurora / Mesh / Particles.
// Each receives u_dark (1.0 = dark, 0.0 = light) for theme adaptation.
export const BG_PRESETS = [
  {
    id: "waves",
    label: "Flow Waves",
    desc: "Gentle sine waves flowing across the screen",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.08;

        vec3 bg = mix(vec3(0.94, 0.95, 0.97), vec3(0.03, 0.03, 0.06), u_dark);
        vec3 lineCol = mix(vec3(0.7, 0.72, 0.82), vec3(0.25, 0.27, 0.38), u_dark);

        float intensity = 0.0;
        for (float i = 0.0; i < 5.0; i++) {
          float y = 0.35 + i * 0.07;
          float freq = 2.0 + i * 0.6;
          float speed = t * (0.5 + i * 0.12);
          float amp = 0.04 + i * 0.008;

          float wave = y + sin(uv.x * freq * 3.14159 + speed + sin(uv.x * 1.5 + t * 0.3) * 0.3) * amp;
          float d = abs(uv.y - wave);

          // Thin crisp line
          float line = smoothstep(0.003, 0.0005, d);
          // Soft glow around line
          float glow = exp(-d * d * 2000.0) * 0.15;

          intensity += (line * 0.3 + glow) * (0.8 - i * 0.1);
        }

        vec3 col = mix(bg, lineCol, clamp(intensity, 0.0, 0.6));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "aurora",
    label: "Flow Aurora",
    desc: "Slow-moving aurora borealis effect",
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
        float t = u_time * 0.04;

        vec3 bg = mix(vec3(0.94, 0.95, 0.97), vec3(0.02, 0.02, 0.05), u_dark);

        // Aurora colors — deep blue and teal
        vec3 c1 = mix(vec3(0.5, 0.6, 0.85), vec3(0.05, 0.1, 0.3), u_dark);
        vec3 c2 = mix(vec3(0.4, 0.7, 0.75), vec3(0.02, 0.15, 0.25), u_dark);

        // Warped horizontal band near bottom third
        float n1 = noise(vec2(uv.x * 2.0 + t, uv.y * 0.5 + t * 0.2));
        float n2 = noise(vec2(uv.x * 3.0 - t * 0.5, uv.y * 0.8 + t * 0.15));
        float n3 = noise(vec2(uv.x * 1.5 + t * 0.3, uv.y * 1.2 - t * 0.1));

        // Create aurora band centered around y=0.45
        float band = exp(-pow((uv.y - 0.45 + n1 * 0.08) * 4.0, 2.0));
        float band2 = exp(-pow((uv.y - 0.5 + n2 * 0.06) * 5.0, 2.0));

        float a1 = band * n1 * 0.5;
        float a2 = band2 * n2 * 0.35;

        // Very subtle shimmer
        float shimmer = noise(uv * 8.0 + t * 2.0) * 0.03 * band;

        vec3 col = bg;
        col = mix(col, c1, clamp(a1, 0.0, 0.35));
        col = mix(col, c2, clamp(a2, 0.0, 0.25));
        col += shimmer * c2;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "mesh",
    label: "Flow Mesh",
    desc: "Subtle gradient mesh that shifts slowly",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.03;

        vec3 bg = mix(vec3(0.94, 0.95, 0.97), vec3(0.025, 0.03, 0.065), u_dark);

        // Three gradient blobs that drift very slowly
        vec2 p1 = vec2(0.3 + sin(t * 0.7) * 0.15, 0.35 + cos(t * 0.5) * 0.12);
        vec2 p2 = vec2(0.7 + cos(t * 0.4) * 0.12, 0.6 + sin(t * 0.6) * 0.15);
        vec2 p3 = vec2(0.5 + sin(t * 0.3) * 0.18, 0.5 + cos(t * 0.8) * 0.1);

        float d1 = length(uv - p1);
        float d2 = length(uv - p2);
        float d3 = length(uv - p3);

        float g1 = exp(-d1 * d1 * 3.0) * 0.3;
        float g2 = exp(-d2 * d2 * 4.0) * 0.25;
        float g3 = exp(-d3 * d3 * 2.5) * 0.2;

        vec3 c1 = mix(vec3(0.55, 0.58, 0.78), vec3(0.06, 0.07, 0.18), u_dark);
        vec3 c2 = mix(vec3(0.5, 0.62, 0.72), vec3(0.04, 0.08, 0.16), u_dark);
        vec3 c3 = mix(vec3(0.58, 0.55, 0.75), vec3(0.05, 0.05, 0.14), u_dark);

        vec3 col = bg;
        col = mix(col, c1, g1);
        col = mix(col, c2, g2);
        col = mix(col, c3, g3);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "particles",
    label: "Flow Particles",
    desc: "Drifting particles following a fluid current",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.06;

        vec3 bg = mix(vec3(0.94, 0.95, 0.97), vec3(0.02, 0.02, 0.045), u_dark);
        vec3 dotCol = mix(vec3(0.45, 0.5, 0.8), vec3(0.15, 0.2, 0.6), u_dark);

        float intensity = 0.0;

        // ~30 particles drifting
        for (float i = 0.0; i < 30.0; i++) {
          float h1 = hash(vec2(i, 0.0));
          float h2 = hash(vec2(i, 1.0));
          float h3 = hash(vec2(i, 2.0));

          // Position with slow drift
          vec2 pos = vec2(
            fract(h1 + t * (0.02 + h3 * 0.03)),
            fract(h2 + sin(t * 0.5 + h1 * 6.28) * 0.02 + t * 0.005)
          );

          float d = length(uv - pos);
          float size = 0.002 + h3 * 0.003;

          // Sharp dot with soft glow
          float dot = smoothstep(size, size * 0.3, d);
          float glow = exp(-d * d * 8000.0) * 0.3;

          // Pulsing brightness
          float pulse = 0.6 + 0.4 * sin(t * 3.0 + h1 * 6.28);

          intensity += (dot * 0.5 + glow) * pulse;
        }

        vec3 col = bg;
        col = mix(col, dotCol, clamp(intensity, 0.0, 0.8));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "ribbon",
    label: "Flow Ribbon",
    desc: "Silky ribbons of light drifting across",
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
        float t = u_time * 0.06;

        vec3 bg = mix(vec3(0.94, 0.95, 0.97), vec3(0.025, 0.025, 0.055), u_dark);
        vec3 c1 = mix(vec3(0.6, 0.55, 0.8), vec3(0.12, 0.08, 0.28), u_dark);
        vec3 c2 = mix(vec3(0.45, 0.6, 0.8), vec3(0.06, 0.12, 0.25), u_dark);

        float intensity = 0.0;
        vec3 tint = vec3(0.0);

        // Several ribbon strands
        for (float i = 0.0; i < 4.0; i++) {
          float yBase = 0.25 + i * 0.15;
          float freq = 1.5 + i * 0.4;

          // Noise-warped sine ribbon
          float n = noise(vec2(uv.x * 2.0 + t + i * 10.0, i));
          float wave = yBase + sin(uv.x * freq * 3.14159 + t * (0.8 + i * 0.2) + n * 1.5) * (0.06 + i * 0.01);

          float d = abs(uv.y - wave);

          // Ribbon width varies along x
          float width = 0.015 + noise(vec2(uv.x * 4.0 + t + i * 5.0, 0.0)) * 0.01;
          float ribbon = smoothstep(width, width * 0.1, d);
          float glow = exp(-d * d * 600.0) * 0.2;

          float contrib = (ribbon * 0.25 + glow) * (0.7 - i * 0.1);
          intensity += contrib;

          vec3 rc = mix(c1, c2, i / 3.0);
          tint += rc * contrib;
        }

        vec3 col = bg;
        col += tint;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "pulse",
    label: "Flow Pulse",
    desc: "Gentle radial pulse emanating outward",
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
        float aspect = u_res.x / u_res.y;
        vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
        float t = u_time * 0.05;

        vec3 bg = mix(vec3(0.94, 0.95, 0.97), vec3(0.02, 0.02, 0.05), u_dark);
        vec3 c1 = mix(vec3(0.5, 0.55, 0.82), vec3(0.08, 0.1, 0.25), u_dark);
        vec3 c2 = mix(vec3(0.45, 0.62, 0.78), vec3(0.05, 0.12, 0.22), u_dark);

        float dist = length(p);

        // Expanding rings
        float intensity = 0.0;
        for (float i = 0.0; i < 4.0; i++) {
          float radius = fract(t * 0.3 + i * 0.25) * 1.2;
          float fade = 1.0 - fract(t * 0.3 + i * 0.25);
          float ring = exp(-pow(dist - radius, 2.0) * 300.0) * fade;
          intensity += ring * 0.25;
        }

        // Subtle noise overlay
        float n = noise(uv * 3.0 + t) * 0.03;

        // Central glow
        float glow = exp(-dist * dist * 2.0) * 0.15;

        vec3 col = bg;
        col = mix(col, c1, clamp(intensity + glow, 0.0, 0.4));
        col = mix(col, c2, clamp(glow * 0.5, 0.0, 0.2));
        col += n * c1;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
