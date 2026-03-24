export const BG_VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Each shader receives u_dark (1.0 = dark mode, 0.0 = light mode) so it can
// blend between theme-appropriate base colors while sharing the same animation.
export const BG_PRESETS = [
  {
    id: "pulse",
    label: "Vital Signs",
    desc: "Gentle EKG-inspired pulse waves",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.3;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 lineCol = mix(vec3(0.35, 0.38, 0.85), vec3(0.45, 0.48, 0.95), u_dark);

        float intensity = 0.0;
        for (float i = 0.0; i < 5.0; i++) {
          float y = 0.15 + i * 0.18;
          float speed = 0.7 + i * 0.12;
          float freq = 2.5 + i * 1.2;
          float x = uv.x * freq - t * speed;

          float beat = 0.0;
          float phase = mod(x, 6.2832);
          beat += exp(-pow(phase - 2.0, 2.0) * 8.0) * 0.3;
          beat -= exp(-pow(phase - 2.8, 2.0) * 30.0) * 0.15;
          beat += exp(-pow(phase - 3.14, 2.0) * 40.0) * 0.8;
          beat -= exp(-pow(phase - 3.5, 2.0) * 20.0) * 0.25;
          beat += exp(-pow(phase - 4.5, 2.0) * 6.0) * 0.15;

          float wave = y + beat * 0.07;
          float d = abs(uv.y - wave);
          float line = smoothstep(0.006, 0.0005, d);
          float glow = exp(-d * d * 400.0) * 0.5;
          intensity += (line * 0.8 + glow) * (0.35 - i * 0.04);
        }

        // Grid lines
        float gridX = smoothstep(0.003, 0.0, abs(mod(uv.x * 20.0, 1.0) - 0.5) - 0.48);
        float gridY = smoothstep(0.003, 0.0, abs(mod(uv.y * 12.0, 1.0) - 0.5) - 0.48);
        float grid = max(gridX, gridY) * 0.06;

        vec3 col = mix(bg, lineCol, clamp(intensity, 0.0, 1.0));
        col = mix(col, lineCol * 0.5, grid);
        gl_FragColor = vec4(col, 1.0);
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
      uniform float u_dark;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.1;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);

        float intensity = 0.0;
        vec3 cellTint = vec3(0.0);

        for (float i = 0.0; i < 6.0; i++) {
          for (float j = 0.0; j < 5.0; j++) {
            vec2 id = vec2(i, j);
            float h = hash(id);
            float h2 = hash(id + 100.0);
            float h3 = hash(id + 200.0);

            vec2 center = vec2(
              (i + 0.5) / 6.0 + sin(t * (0.4 + h * 0.3) + h * 6.28) * 0.07,
              (j + 0.5) / 5.0 + cos(t * (0.35 + h2 * 0.2) + h2 * 6.28) * 0.07
            );

            float radius = 0.04 + h * 0.035;
            float d = length(uv - center);

            // Cell membrane ring
            float ring = smoothstep(radius + 0.004, radius, d) - smoothstep(radius - 0.001, radius - 0.006, d);
            // Soft interior
            float fill = smoothstep(radius * 0.95, radius * 0.2, d) * 0.25;
            // Nucleus
            float nucleus = smoothstep(radius * 0.35, radius * 0.1, d) * 0.5;

            float cell = ring * 0.7 + fill + nucleus;
            intensity += cell * 0.35;

            // Vary tint per cell: red blood cells, white cells, platelets
            vec3 tint = h3 < 0.5
              ? mix(vec3(0.85, 0.2, 0.25), vec3(0.5, 0.15, 0.2), u_dark)  // red
              : h3 < 0.8
                ? mix(vec3(0.3, 0.4, 0.85), vec3(0.4, 0.5, 0.95), u_dark) // blue/white
                : mix(vec3(0.6, 0.35, 0.7), vec3(0.7, 0.45, 0.8), u_dark); // purple
            cellTint += tint * cell * 0.35;
          }
        }

        vec3 col = bg + cellTint;
        col = clamp(col, 0.0, 1.0);
        gl_FragColor = vec4(col, 1.0);
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
      uniform float u_dark;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float aspect = u_res.x / u_res.y;
        vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
        float t = u_time * 0.2;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 strandCol1 = mix(vec3(0.3, 0.35, 0.85), vec3(0.5, 0.4, 0.95), u_dark);
        vec3 strandCol2 = mix(vec3(0.15, 0.55, 0.75), vec3(0.25, 0.7, 0.9), u_dark);
        vec3 rungCol = mix(vec3(0.55, 0.45, 0.75), vec3(0.7, 0.6, 0.85), u_dark);

        vec3 col = bg;

        for (float i = -10.0; i < 10.0; i++) {
          float y = i * 0.065;
          float phase = y * 10.0 + t * 2.0;
          float depth1 = cos(phase);
          float depth2 = cos(phase + 3.14159);

          float x1 = sin(phase) * 0.15;
          float x2 = sin(phase + 3.14159) * 0.15;

          float d1 = length(p - vec2(x1, y));
          float d2 = length(p - vec2(x2, y));

          // Strand nodes (spheres)
          float s1 = smoothstep(0.018, 0.004, d1) * (0.6 + depth1 * 0.4);
          float s2 = smoothstep(0.018, 0.004, d2) * (0.6 + depth2 * 0.4);

          // Glow around strands
          float g1 = exp(-d1 * d1 * 800.0) * 0.4 * max(0.3, depth1);
          float g2 = exp(-d2 * d2 * 800.0) * 0.4 * max(0.3, depth2);

          col = mix(col, strandCol1, clamp(s1 + g1, 0.0, 1.0));
          col = mix(col, strandCol2, clamp(s2 + g2, 0.0, 1.0));

          // Connecting rungs
          float rungD = abs(p.y - y);
          float minX = min(x1, x2);
          float maxX = max(x1, x2);
          float inRung = step(minX, p.x) * step(p.x, maxX);
          float rung = inRung * smoothstep(0.005, 0.0005, rungD) * 0.5;
          // Depth-based fade for rungs
          float rungDepth = (depth1 + depth2) * 0.5;
          rung *= max(0.0, rungDepth * 0.7 + 0.3);
          col = mix(col, rungCol, clamp(rung, 0.0, 0.6));
        }

        gl_FragColor = vec4(col, 1.0);
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
        vec3 pathCol = mix(vec3(0.3, 0.45, 0.8), vec3(0.45, 0.55, 0.95), u_dark);
        vec3 nodeCol = mix(vec3(0.5, 0.3, 0.8), vec3(0.7, 0.5, 0.95), u_dark);
        vec3 pulseCol = mix(vec3(0.3, 0.75, 0.85), vec3(0.4, 0.85, 0.95), u_dark);

        float n1 = noise(uv * 6.0 + t);
        float n2 = noise(uv * 12.0 - t * 0.5);
        float n3 = noise(uv * 3.0 + vec2(t * 0.3, -t * 0.2));

        // Network edges via noise gradient
        float nx = noise(uv * 6.0 + vec2(0.01, 0.0) + t) - n1;
        float ny = noise(uv * 6.0 + vec2(0.0, 0.01) + t) - n1;
        float edge = abs(nx) + abs(ny);
        edge = pow(edge * 50.0, 2.0);
        edge = clamp(edge, 0.0, 1.0);

        // Neuron nodes at noise peaks
        float nodes = smoothstep(0.68, 0.75, n1);
        float nodeGlow = smoothstep(0.58, 0.72, n1) * 0.4;

        // Synaptic firing pulses
        float pulse = sin(n1 * 25.0 + t * 4.0) * 0.5 + 0.5;
        pulse *= smoothstep(0.45, 0.65, n1) * 0.6;

        vec3 col = bg;
        col = mix(col, pathCol, edge * 0.5);
        col = mix(col, nodeCol, clamp(nodes + nodeGlow, 0.0, 1.0) * 0.7);
        col = mix(col, pulseCol, pulse * 0.4);

        // Subtle background variation
        col += (n3 - 0.5) * 0.03;

        gl_FragColor = vec4(col, 1.0);
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
      uniform float u_dark;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.25;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 ringCol = mix(vec3(0.2, 0.6, 0.8), vec3(0.3, 0.7, 0.9), u_dark);

        // Breathing cycle
        float breathCycle = sin(t * 0.5) * 0.5 + 0.5;
        breathCycle = pow(breathCycle, 0.7);

        vec2 center = vec2(0.5, 0.5);
        float dist = length(uv - center);

        float intensity = 0.0;
        for (float i = 0.0; i < 7.0; i++) {
          float radius = (i + 1.0) * 0.065 * (0.7 + breathCycle * 0.5);
          float ring = exp(-pow(dist - radius, 2.0) * 1500.0);
          intensity += ring * (0.6 - i * 0.06);
        }

        // Central glow
        float glow = exp(-dist * dist * 3.0) * breathCycle * 0.4;
        intensity += glow;

        // Subtle particle flow
        float drift = sin(uv.x * 25.0 + t * 1.5) * sin(uv.y * 25.0 - t) * 0.5 + 0.5;
        drift *= exp(-dist * 2.0) * 0.08;
        intensity += drift;

        vec3 col = mix(bg, ringCol, clamp(intensity, 0.0, 0.8));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "marrow",
    label: "Bone Structure",
    desc: "Trabecular bone lattice pattern",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

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
        float t = u_time * 0.04;
        vec3 bg = mix(vec3(0.95, 0.96, 0.98), vec3(0.06, 0.06, 0.12), u_dark);
        vec3 boneCol = mix(vec3(0.75, 0.65, 0.5), vec3(0.85, 0.75, 0.6), u_dark);
        vec3 marrowCol = mix(vec3(0.45, 0.35, 0.6), vec3(0.55, 0.4, 0.7), u_dark);

        vec2 p = uv * 5.0 + vec2(t * 0.4, t * 0.25);

        float v = voronoi(p);
        float edges = 1.0 - smoothstep(0.0, 0.18, v);

        float v2 = voronoi(p * 1.6 + 50.0);
        float edges2 = 1.0 - smoothstep(0.0, 0.14, v2);

        // Combine layers
        float lattice = clamp(edges * 0.8 + edges2 * 0.4, 0.0, 1.0);

        // Cell centers glow (marrow)
        float marrow = smoothstep(0.25, 0.5, v) * 0.3;

        // Subtle pulse
        lattice *= 0.85 + 0.15 * sin(t * 6.0 + v * 8.0);

        vec3 col = bg;
        col = mix(col, marrowCol, marrow);
        col = mix(col, boneCol, lattice * 0.6);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
