"use client";

/**
 * The living ground — the darkroom's air, moving. One fullscreen WebGL layer
 * under everything: the fbm domain-warp field, drifting very slowly, with
 * grit inside the smoke and a raking striation across the light.
 *
 * The room is *toned*, the way a print is toned. Two lights — high left, low
 * right — and each carries a colour: the key takes the hue of the set you
 * are looking at, the fill takes its complement. The base black stays a true
 * neutral, so the chroma only ever lives in the light, and its hue only ever
 * comes from the work. Same model as the bake (pipeline/render_ground.py),
 * which is the poster and the whole ground on phones.
 *
 * 30fps cap, DPR cap 1.25, paused when the tab hides. Desktop only —
 * phones keep the baked still and their battery.
 */
import { useEffect, useRef } from "react";
import {
  FRAG,
  VERT,
  CORPUS_SPILL,
  tone,
  parseHex,
  type RGB,
} from "@/lib/ground-shader";

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
      key: gl.getUniformLocation(prog, "uKey"),
      fill: gl.getUniformLocation(prog, "uFill"),
      pointer: gl.getUniformLocation(prog, "uPointer"),
      pointerAmp: gl.getUniformLocation(prog, "uPointerAmp"),
    };

    // the toning, eased — the room drifts between worlds as you cross sets
    let target = tone(CORPUS_SPILL);
    const key: RGB = [...target.key];
    const fill: RGB = [...target.fill];
    const readSpill = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--spill");
      if (parseHex(raw)) target = tone(raw);
    };
    readSpill();
    const mo = new MutationObserver(readSpill);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    let raf = 0;
    let last = 0;
    let running = true;
    const t0 = performance.now();
    const pointer = { x: 0.5, y: 0.5, amp: 0 };
    const aim = { x: 0.5, y: 0.5, amp: 0 };

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
      pointer.x += (aim.x - pointer.x) * 0.04;
      pointer.y += (aim.y - pointer.y) * 0.04;
      pointer.amp += (aim.amp - pointer.amp) * 0.03;
      for (let i = 0; i < 3; i++) {
        key[i] += (target.key[i] - key[i]) * 0.02;
        fill[i] += (target.fill[i] - fill[i]) * 0.02;
      }
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, (now - t0) / 1000);
      gl.uniform3f(u.key, key[0], key[1], key[2]);
      gl.uniform3f(u.fill, fill[0], fill[1], fill[2]);
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
      aim.x = e.clientX / window.innerWidth;
      aim.y = e.clientY / window.innerHeight;
      aim.amp = 1;
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

  // the grain lives in the shader here, and in body::before's own background
  // layers for the baked ground — never as a layer over the page
  return <canvas ref={canvasRef} className="ground-live" aria-hidden="true" />;
}
