export const BG_VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const BG_PRESETS = [
  {
    id: "flow",
    label: "Gentle Flow",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.15;
        float v = sin(uv.x * 3.0 + t) * 0.5 + sin(uv.y * 2.0 + t * 0.7) * 0.5;
        v = v * 0.5 + 0.5;
        vec3 c1 = vec3(0.06, 0.06, 0.12);
        vec3 c2 = vec3(0.15, 0.12, 0.28);
        gl_FragColor = vec4(mix(c1, c2, v * 0.6), 1.0);
      }
    `,
  },
  {
    id: "aurora",
    label: "Aurora",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.1;
        float wave = sin(uv.x * 4.0 + t) * cos(uv.y * 3.0 + t * 0.5);
        float wave2 = sin(uv.x * 2.0 - t * 0.3) * sin(uv.y * 5.0 + t * 0.8);
        vec3 base = vec3(0.06, 0.06, 0.12);
        vec3 green = vec3(0.05, 0.25, 0.15);
        vec3 purple = vec3(0.18, 0.08, 0.28);
        vec3 col = base + green * max(0.0, wave * 0.4) + purple * max(0.0, wave2 * 0.3);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "waves",
    label: "Ocean Waves",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.12;
        float w = 0.0;
        for (float i = 1.0; i < 4.0; i++) {
          w += sin(uv.x * i * 2.5 + t * i * 0.5 + uv.y * i) / i;
        }
        w = w * 0.25 + 0.5;
        vec3 deep = vec3(0.04, 0.06, 0.14);
        vec3 mid = vec3(0.08, 0.12, 0.22);
        gl_FragColor = vec4(mix(deep, mid, w), 1.0);
      }
    `,
  },
  {
    id: "nebula",
    label: "Nebula",
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
        float t = u_time * 0.05;
        float n = noise(uv * 3.0 + t) * 0.5 + noise(uv * 6.0 - t * 0.5) * 0.25;
        vec3 base = vec3(0.06, 0.04, 0.1);
        vec3 pink = vec3(0.22, 0.06, 0.18);
        vec3 blue = vec3(0.06, 0.08, 0.22);
        vec3 col = base + pink * n * 0.6 + blue * (1.0 - n) * 0.3;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "gradient",
    label: "Shifting Gradient",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.08;
        float angle = t;
        vec2 dir = vec2(cos(angle), sin(angle));
        float g = dot(uv - 0.5, dir) + 0.5;
        vec3 c1 = vec3(0.06, 0.06, 0.14);
        vec3 c2 = vec3(0.12, 0.06, 0.2);
        vec3 c3 = vec3(0.06, 0.1, 0.18);
        vec3 col = mix(mix(c1, c2, g), c3, sin(t * 0.5) * 0.5 + 0.5);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: "mesh",
    label: "Soft Mesh",
    frag: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.1;
        float d1 = length(uv - vec2(0.3 + sin(t) * 0.1, 0.3 + cos(t * 0.7) * 0.1));
        float d2 = length(uv - vec2(0.7 + cos(t * 0.5) * 0.1, 0.7 + sin(t * 0.8) * 0.1));
        float d3 = length(uv - vec2(0.5, 0.5 + sin(t * 0.3) * 0.15));
        vec3 base = vec3(0.06, 0.06, 0.12);
        vec3 col = base;
        col += vec3(0.12, 0.04, 0.2) * (1.0 - smoothstep(0.0, 0.5, d1));
        col += vec3(0.04, 0.12, 0.2) * (1.0 - smoothstep(0.0, 0.5, d2));
        col += vec3(0.1, 0.06, 0.16) * (1.0 - smoothstep(0.0, 0.4, d3));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
