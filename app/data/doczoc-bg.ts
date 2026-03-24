export const BG_VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// All backgrounds output transparent colors (alpha channel) so they overlay
// cleanly on both dark (#0f0f1e) and light (#f5f7fa) theme backgrounds.
export const BG_PRESETS = [
  {
    id: "pulse",
    label: "Vital Signs",
    desc: "Gentle EKG-inspired pulse waves",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.3;

        // Multiple EKG-like horizontal waves at different heights
        float a = 0.0;
        for (float i = 0.0; i < 4.0; i++) {
          float y = 0.2 + i * 0.2;
          float speed = 0.8 + i * 0.15;
          float freq = 3.0 + i * 1.5;
          float x = uv.x * freq - t * speed;

          // Heartbeat shape: flat, then sharp spike, then flat
          float beat = 0.0;
          float phase = mod(x, 6.2832);
          beat += exp(-pow(phase - 2.0, 2.0) * 8.0) * 0.3;    // P wave
          beat -= exp(-pow(phase - 2.8, 2.0) * 30.0) * 0.15;   // Q dip
          beat += exp(-pow(phase - 3.14, 2.0) * 40.0) * 0.8;   // R spike
          beat -= exp(-pow(phase - 3.5, 2.0) * 20.0) * 0.25;   // S dip
          beat += exp(-pow(phase - 4.5, 2.0) * 6.0) * 0.15;    // T wave

          float wave = y + beat * 0.06;
          float d = abs(uv.y - wave);
          float line = smoothstep(0.008, 0.001, d);
          float glow = exp(-d * d * 800.0) * 0.3;
          a += (line + glow) * (0.08 - i * 0.015);
        }

        // Subtle radial glow at center
        float center = exp(-length(uv - 0.5) * 1.5) * 0.02;
        a += center;

        vec3 col = vec3(0.39, 0.4, 0.95); // indigo tint
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.12));
      }
    `,
  },
  {
    id: "cells",
    label: "Cell Flow",
    desc: "Floating cells drifting through plasma",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.08;
        float a = 0.0;

        // Grid of drifting cell-like circles
        for (float i = 0.0; i < 5.0; i++) {
          for (float j = 0.0; j < 5.0; j++) {
            vec2 id = vec2(i, j);
            float h = hash(id);
            float h2 = hash(id + 100.0);

            // Each cell drifts slowly
            vec2 center = vec2(
              (i + 0.5) / 5.0 + sin(t * (0.3 + h * 0.2) + h * 6.28) * 0.06,
              (j + 0.5) / 5.0 + cos(t * (0.25 + h2 * 0.15) + h2 * 6.28) * 0.06
            );

            float radius = 0.04 + h * 0.03;
            float d = length(uv - center);

            // Cell membrane (ring)
            float ring = smoothstep(radius + 0.005, radius, d) - smoothstep(radius, radius - 0.005, d);
            // Cell interior (soft fill)
            float fill = smoothstep(radius, radius * 0.3, d) * 0.3;
            // Nucleus
            float nucleus = smoothstep(radius * 0.35, radius * 0.15, d) * 0.4;

            a += (ring * 0.6 + fill + nucleus) * 0.06;
          }
        }

        vec3 col = mix(vec3(0.13, 0.82, 0.65), vec3(0.39, 0.4, 0.95), uv.y);
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.1));
      }
    `,
  },
  {
    id: "helix",
    label: "DNA Helix",
    desc: "Rotating double helix strands",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float aspect = u_res.x / u_res.y;
        vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
        float t = u_time * 0.15;
        float a = 0.0;

        // Two helix strands rotating
        for (float i = -8.0; i < 8.0; i++) {
          float y = i * 0.08;
          float phase = y * 12.0 + t * 2.0;

          // Strand 1
          float x1 = sin(phase) * 0.12;
          float d1 = length(p - vec2(x1, y));
          a += smoothstep(0.015, 0.003, d1) * 0.08;
          a += exp(-d1 * d1 * 2000.0) * 0.04;

          // Strand 2 (opposite phase)
          float x2 = sin(phase + 3.14159) * 0.12;
          float d2 = length(p - vec2(x2, y));
          a += smoothstep(0.015, 0.003, d2) * 0.08;
          a += exp(-d2 * d2 * 2000.0) * 0.04;

          // Connecting rungs (only when strands are in front)
          float depth = cos(phase);
          if (depth > 0.0) {
            float rungX = p.x;
            float rungD = abs(p.y - y);
            float inRung = step(min(x1, x2), rungX) * step(rungX, max(x1, x2));
            a += inRung * smoothstep(0.006, 0.001, rungD) * 0.04 * depth;
          }
        }

        vec3 col = mix(vec3(0.55, 0.36, 0.95), vec3(0.2, 0.7, 0.9), uv.y);
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.1));
      }
    `,
  },
  {
    id: "tissue",
    label: "Neural Network",
    desc: "Branching neural pathways",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;

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
        float a = 0.0;

        // Branching network via layered noise
        float n1 = noise(uv * 8.0 + t);
        float n2 = noise(uv * 16.0 - t * 0.5);
        float n3 = noise(uv * 4.0 + vec2(t * 0.3, -t * 0.2));

        // Create vein-like patterns by taking derivatives
        float nx = noise(uv * 8.0 + vec2(0.01, 0.0) + t) - n1;
        float ny = noise(uv * 8.0 + vec2(0.0, 0.01) + t) - n1;
        float edge = abs(nx) + abs(ny);
        edge = pow(edge * 40.0, 1.5);

        // Neuron nodes (bright spots at noise peaks)
        float nodes = smoothstep(0.72, 0.78, n1) * 0.15;
        float nodeGlow = smoothstep(0.65, 0.78, n1) * 0.05;

        // Firing pulses traveling along network
        float pulse = sin(n1 * 20.0 + t * 3.0) * 0.5 + 0.5;
        pulse *= smoothstep(0.5, 0.7, n1);

        a += edge * 0.04;
        a += nodes + nodeGlow;
        a += pulse * 0.03;
        a += n3 * 0.02;

        vec3 col = mix(vec3(0.39, 0.4, 0.95), vec3(0.55, 0.8, 0.95), n2);
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.1));
      }
    `,
  },
  {
    id: "breath",
    label: "Respiration",
    desc: "Rhythmic breathing wave pattern",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.2;
        float a = 0.0;

        // Breathing rhythm: slow inhale, pause, exhale
        float breathCycle = sin(t * 0.5) * 0.5 + 0.5; // 0..1
        breathCycle = pow(breathCycle, 0.7); // more time at top (inhale)

        // Expanding/contracting concentric rings from center
        vec2 center = vec2(0.5, 0.5);
        float dist = length(uv - center);

        for (float i = 0.0; i < 6.0; i++) {
          float radius = (i + 1.0) * 0.08 * (0.8 + breathCycle * 0.4);
          float ring = exp(-pow(dist - radius, 2.0) * 3000.0);
          a += ring * 0.06 * (1.0 - i * 0.12);
        }

        // Soft radial glow that breathes
        float glow = exp(-dist * dist * 4.0) * breathCycle * 0.06;
        a += glow;

        // Subtle particle drift
        float drift = sin(uv.x * 20.0 + t) * sin(uv.y * 20.0 - t * 0.7);
        a += max(0.0, drift) * 0.01;

        vec3 col = mix(vec3(0.2, 0.7, 0.85), vec3(0.39, 0.4, 0.95), dist * 2.0);
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.1));
      }
    `,
  },
  {
    id: "marrow",
    label: "Bone Structure",
    desc: "Trabecular bone-like lattice pattern",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      // Voronoi for trabecular structure
      float voronoi(vec2 p) {
        vec2 n = floor(p);
        float d = 8.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = vec2(hash(n + g), hash(n + g + 100.0));
            vec2 r = g + o - fract(p);
            d = min(d, dot(r, r));
          }
        }
        return sqrt(d);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.03;

        // Slow drift for organic feel
        vec2 p = uv * 6.0 + vec2(t * 0.5, t * 0.3);

        // Trabecular pattern — edges of voronoi cells
        float v = voronoi(p);
        float edges = 1.0 - smoothstep(0.0, 0.15, v);

        // Second layer at different scale
        float v2 = voronoi(p * 1.8 + 50.0);
        float edges2 = 1.0 - smoothstep(0.0, 0.12, v2);

        float a = edges * 0.06 + edges2 * 0.03;

        // Marrow glow in cell centers
        float center = smoothstep(0.3, 0.5, v) * 0.03;
        a += center;

        // Subtle pulsation
        a *= 0.85 + 0.15 * sin(t * 5.0 + v * 8.0);

        vec3 col = mix(vec3(0.85, 0.75, 0.55), vec3(0.39, 0.4, 0.95), 0.4 + edges * 0.3);
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.1));
      }
    `,
  },
];
