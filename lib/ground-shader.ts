/**
 * The ground, as source — one shader, two mounts.
 *
 * `components/ground.tsx` mounts this fullscreen behind the site;
 * `lib/export/compose.ts` mounts it offscreen at export resolution behind a
 * share card. They are the same pixels by construction, which is the point:
 * pipeline/render_ground.py is already a deliberate bit-for-bit port of this
 * field, and BUILD-NOTES says change both or neither. A third hand-copy for
 * the exporter would have made that three. Extracting it instead leaves two.
 *
 * Nothing here is new — FRAG, VERT, tone(), parseHex() and the three
 * constants moved out of ground.tsx unchanged. If this file and
 * render_ground.py ever disagree, this file is the one that is wrong.
 */

export const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uKey;
uniform vec3 uFill;
uniform vec2 uPointer;
uniform float uPointerAmp;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
const mat2 M = mat2(0.81385, -0.58104, 0.58104, 0.81385); // rot(0.62)

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 5; i++) {
    v += amp * vnoise(p);
    p = M * p * 2.02;
    amp *= 0.5;
  }
  return v;
}
// cheaper cousins for the two texture terms — they don't need the tail
float fbm3(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 3; i++) {
    v += amp * vnoise(p);
    p = M * p * 2.02;
    amp *= 0.5;
  }
  return v;
}
float fbm2(vec2 p) {
  return 0.55 * vnoise(p) + 0.275 * vnoise(M * p * 2.02);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / min(uRes.x, uRes.y);
  p *= 0.62; // large scale — veils, not noise
  float t = uTime * 0.014; // the air barely moves

  vec2 pt = (uPointer - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 0.62;
  float pd = length(p - pt);
  vec2 push = normalize(p - pt + 0.0001) * exp(-pd * 3.4) * uPointerAmp * 0.12;

  vec2 q = vec2(
    fbm(p + t),
    fbm(p + vec2(5.2, 1.3) - t * 0.7)
  );
  vec2 r = vec2(
    fbm(p + 3.6 * q + vec2(1.7, 9.2) + t * 0.4 + push),
    fbm(p + 3.6 * q + vec2(8.3, 2.8) - t * 0.3)
  );
  float f = fbm(p + 3.2 * r + push * 2.0);

  float veil = smoothstep(0.30, 0.95, q.x * 0.7 + r.y * 0.55);
  float crest = pow(clamp(f, 0.0, 1.0), 2.8);

  // fine grit inside the smoke — structure at the scale you actually see
  float grit = fbm3(p * 5.4 + r * 1.3 + t * 0.8) - 0.48;
  // raking striation — light arriving through something, not through nothing
  float rake = 1.0 + (fbm2(vec2(p.x * 1.1 + 11.0, p.y * 7.4 - 3.0) + t * 0.3) - 0.41) * 0.46;

  // the room's two light directions — high left, low right (matches the bake)
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float vv = 1.0 - uv.y; // the bake's v runs down the frame
  float lightK = 0.92 * exp(-((uv.x - 0.14) * (uv.x - 0.14) / 0.46 + (vv + 0.04) * (vv + 0.04) / 0.40)) * rake;
  float lightF = 0.82 * exp(-((uv.x - 0.92) * (uv.x - 0.92) / 0.40 + (vv - 1.06) * (vv - 1.06) / 0.34)) * rake;
  const float AMB = 0.36;

  float density = (veil * 0.150 + crest * 0.185) * (1.0 + grit * 0.85 * (0.35 + 0.65 * veil));
  density = max(density, 0.0);

  // the chroma lives in the light, never in the black
  vec3 lit = uKey * lightK + uFill * lightF + AMB;
  vec3 col = vec3(0.0275) + lit * (density + 0.028);

  // silver — fixed to the screen like grain in a gate, never crawling with
  // the drift, and multiplicative so it lives in the light and not the black
  col *= 0.87 + 0.26 * hash(gl_FragCoord.xy * 0.37);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.004; // dither the ramps
  gl_FragColor = vec4(col, 1.0);
}
`;

export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/** the corpus tone — every set's spill averaged; keep in sync with lib/work.ts */
export const CORPUS_SPILL = "#5b544d";
const KEY_CHROMA = 0.60;
const FILL_CHROMA = 0.48;

export type RGB = [number, number, number];

export function parseHex(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return [lin(((n >> 16) & 255) / 255), lin(((n >> 8) & 255) / 255), lin((n & 255) / 255)];
}

/**
 * Split-tone a spill into (key, fill) light colours around neutral 1.
 * The hue is the set's; the *amount* is fixed, so a strongly-coloured set
 * never shouts louder than a quiet one — only its hue changes. The fill is
 * the reciprocal direction, which is what makes a print read as toned:
 * warm light against cool shadow, or the reverse — never one flat wash.
 */
export function tone(hex: string): { key: RGB; fill: RGB } {
  const rgb = parseHex(hex) ?? parseHex(CORPUS_SPILL)!;
  const mean = (rgb[0] + rgb[1] + rgb[2]) / 3 + 1e-6;
  const dir = rgb.map((c) => c / mean) as RGB;
  const norm = (v: RGB, target: number): RGB => {
    const c = Math.max(...v.map((x) => Math.abs(x - 1)));
    const k = c > 1e-4 ? target / c : 0;
    return v.map((x) => 1 + (x - 1) * k) as RGB;
  };
  const inv = dir.map((x) => 1 / x) as RGB;
  const im = (inv[0] + inv[1] + inv[2]) / 3;
  return {
    key: norm(dir, KEY_CHROMA),
    fill: norm(inv.map((x) => x / im) as RGB, FILL_CHROMA),
  };
}
