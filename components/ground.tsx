"use client";

/**
 * The living ground — the darkroom's air, moving. One fullscreen WebGL
 * layer under everything: the fbm domain-warp field at ambient presence,
 * drifting very slowly, tinted by the current set's spill (colour still
 * only ever comes from the work), nudged almost imperceptibly by the
 * pointer. The baked field (body::before) stays underneath as the poster
 * and takes over entirely on mobile, reduced-motion, or no-WebGL.
 *
 * 30fps cap, DPR cap 1.25, paused when the tab hides. Desktop only —
 * phones keep the baked still and their battery.
 */
import { useEffect, useRef } from "react";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uSpill;
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

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  mat2 m = rot(0.62);
  for (int i = 0; i < 5; i++) {
    v += amp * vnoise(p);
    p = m * p * 2.02;
    amp *= 0.5;
  }
  return v;
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

  float veil = smoothstep(0.44, 1.02, q.x * 0.7 + r.y * 0.55);
  float crest = pow(clamp(f, 0.0, 1.0), 3.4);

  // the room's two light directions — high left, low right (matches the bake)
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float light = 1.15 * exp(-((uv.x - 0.14) * (uv.x - 0.14) / 0.34 + (1.0 - uv.y + 0.04) * (1.0 - uv.y + 0.04) / 0.30))
              + 0.85 * exp(-((uv.x - 0.92) * (uv.x - 0.92) / 0.24 + (0.06 - uv.y) * (0.06 - uv.y) / 0.22))
              + 0.16;

  vec3 ground = vec3(0.0275);
  float lum = (veil * 0.085 + crest * 0.105) * light + light * 0.016;
  // the veils take the set's colour where they're brightest — the spill
  // breathing inside the air itself
  vec3 col = ground + vec3(lum) + uSpill * lum * 2.4;

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.010;
  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function Ground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      spill: gl.getUniformLocation(prog, "uSpill"),
      pointer: gl.getUniformLocation(prog, "uPointer"),
      pointerAmp: gl.getUniformLocation(prog, "uPointerAmp"),
    };

    // the spill hue, eased — the field drifts between worlds like the layer above it
    const NEUTRAL_LIFT = 0.028; // how much of the hue the air may carry
    let spillTarget: [number, number, number] = [0, 0, 0];
    const spill = { r: 0, g: 0, b: 0 };
    const readSpill = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--spill");
      const rgb = parseHex(raw);
      if (!rgb) return;
      // normalise to a hue direction scaled to ambient level
      const mean = (rgb[0] + rgb[1] + rgb[2]) / 3 + 1e-5;
      spillTarget = [
        (rgb[0] / mean - 1) * NEUTRAL_LIFT,
        (rgb[1] / mean - 1) * NEUTRAL_LIFT,
        (rgb[2] / mean - 1) * NEUTRAL_LIFT,
      ];
    };
    readSpill();
    const mo = new MutationObserver(readSpill);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    let raf = 0;
    let last = 0;
    let running = true;
    const t0 = performance.now();
    const pointer = { x: 0.5, y: 0.5, amp: 0 };
    const target = { x: 0.5, y: 0.5, amp: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running || now - last < 33) return;
      last = now;
      resize();
      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;
      pointer.amp += (target.amp - pointer.amp) * 0.03;
      spill.r += (spillTarget[0] - spill.r) * 0.02;
      spill.g += (spillTarget[1] - spill.g) * 0.02;
      spill.b += (spillTarget[2] - spill.b) * 0.02;
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, (now - t0) / 1000);
      gl.uniform3f(u.spill, spill.r, spill.g, spill.b);
      gl.uniform2f(u.pointer, pointer.x, 1 - pointer.y);
      gl.uniform1f(u.pointerAmp, pointer.amp);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!canvas.dataset.alive) {
        canvas.dataset.alive = "1";
        canvas.style.opacity = "1";
        document.documentElement.dataset.ground = "live";
      }
    };

    const onPointer = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = e.clientY / window.innerHeight;
      target.amp = 1;
    };
    const onVis = () => (running = !document.hidden);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      delete document.documentElement.dataset.ground;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="ground-live" aria-hidden="true" />;
}
