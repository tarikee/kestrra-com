/**
 * The card renderer — one draw path, three callers.
 *
 * The live preview, the still export and every frame of the video export all
 * come through `draw()`. That is the whole architectural point: a preview
 * that runs different code from the export is a preview that will eventually
 * lie to you about what you are posting.
 *
 * The ground is the site's own shader (lib/ground-shader.ts) mounted offscreen
 * at card resolution, so the background of an export is the same field the
 * room is made of rather than a picture of it.
 *
 * The photograph is composited untouched: no crop, no grade, no filter, no
 * colour conversion. It is drawn with `contain` into its box, and a ratio it
 * does not fit simply leaves ground around it. The grade is authored work
 * (CLAUDE.md) and an export is not a licence to edit it.
 */
import { FRAG, VERT, tone, type RGB } from "@/lib/ground-shader";
import { WORDMARK_GLYPHS, WORDMARK_VIEWBOX, WORDMARK_RATIO } from "@/components/wordmark/wordmark-data";
import { layout, contain, type CardLayout } from "./layout";
import { creditLine, type CardSpec } from "./types";

const [VB_X, VB_Y, VB_W, VB_H] = WORDMARK_VIEWBOX.split(" ").map(Number);

/** Cached Path2D per glyph — rebuilding these every frame of a 180-frame
    encode is pure waste, and they never change. */
let glyphPaths: Path2D[] | null = null;
function paths(): Path2D[] {
  if (!glyphPaths) {
    glyphPaths = WORDMARK_GLYPHS.map((g) => {
      const p = new Path2D();
      p.addPath(new Path2D(g.d), new DOMMatrix().translate(g.x, 0));
      return p;
    });
  }
  return glyphPaths;
}

/** The font families as the page resolved them — next/font generates the
    real family names, so they can only be read back off the document. */
function families(): { sans: string; mono: string } {
  const s = getComputedStyle(document.documentElement);
  return {
    sans: s.getPropertyValue("--font-grotesk").trim() || "system-ui",
    mono: s.getPropertyValue("--font-fragment").trim() || "ui-monospace",
  };
}

/** Canvas cannot lay out text in a font it has not loaded, and will silently
    substitute. Await this before the first draw. */
export async function fontsReady(): Promise<void> {
  const f = families();
  try {
    await Promise.all([
      document.fonts.load(`400 40px ${f.mono}`),
      document.fonts.load(`500 40px ${f.sans}`),
      document.fonts.ready,
    ]);
  } catch {
    /* a substituted font is survivable; a thrown renderer is not */
  }
}

export class CardRenderer {
  private ctx: CanvasRenderingContext2D;
  private gl: WebGLRenderingContext | null = null;
  private glCanvas: HTMLCanvasElement;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private photo: CanvasImageSource | null = null;
  private pw = 0;
  private ph = 0;
  private spec: CardSpec | null = null;
  private L: CardLayout | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.glCanvas = document.createElement("canvas");
    this.initGL();
  }

  private initGL() {
    const gl = this.glCanvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return; // no WebGL: the card still renders, on a flat ground
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

    for (const k of ["uRes", "uTime", "uKey", "uFill", "uPointer", "uPointerAmp"]) {
      this.u[k] = gl.getUniformLocation(prog, k);
    }
    this.gl = gl;
  }

  setPhoto(src: CanvasImageSource, w: number, h: number) {
    this.photo = src;
    this.pw = w;
    this.ph = h;
    // the region is sized to the picture, so a new picture is a new layout
    this.relayout();
  }

  /** The one place layout is derived. Size, spec and photograph all feed it,
      and any of the three arriving late has to re-run it — the region now
      depends on the photograph's aspect, not on the card alone. */
  private relayout() {
    if (!this.spec) return;
    const aspect = this.pw > 0 && this.ph > 0 ? this.pw / this.ph : null;
    this.L = layout(this.spec.style, this.canvas.width, this.canvas.height, aspect);
  }

  /** Output size in real pixels. The preview passes its on-screen size; the
      exporters pass the ratio's full resolution. */
  resize(W: number, H: number) {
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
    }
    if (this.glCanvas.width !== W || this.glCanvas.height !== H) {
      this.glCanvas.width = W;
      this.glCanvas.height = H;
      this.gl?.viewport(0, 0, W, H);
    }
    this.relayout();
  }

  setSpec(spec: CardSpec) {
    this.spec = spec;
    this.relayout();
  }

  /** One frame. `t` is seconds of ground drift — 0 for a still. */
  draw(t: number) {
    const { ctx } = this;
    const L = this.L;
    const spec = this.spec;
    if (!L || !spec) return;

    this.drawGround(t, spec.spill);
    ctx.drawImage(this.glCanvas, 0, 0);

    const f = families();
    const box = this.drawPhoto(L);
    // Landscape: the picture and its text are one object, centred together.
    // Laid out against the card's own margins instead, a portrait frame
    // occupies a third of the width it is given and the column ends up a void
    // away from the photograph it describes.
    const col =
      L.column && L.beside
        ? { x: box.x + box.w + L.column.gutter, top: box.y, bottom: box.y + box.h }
        : null;
    this.drawCaption(L, spec, f, box, col);
    this.drawCredit(L, spec, f, col);
  }

  private drawGround(t: number, spill: string) {
    const gl = this.gl;
    const { W, H } = { W: this.glCanvas.width, H: this.glCanvas.height };
    if (!gl) {
      // no WebGL — a flat toned ground rather than a broken card
      const c = this.glCanvas.getContext("2d");
      if (c) {
        c.fillStyle = "#08090a";
        c.fillRect(0, 0, W, H);
      }
      return;
    }
    const { key, fill }: { key: RGB; fill: RGB } = tone(spill);
    gl.uniform2f(this.u.uRes, W, H);
    gl.uniform1f(this.u.uTime, t);
    gl.uniform3f(this.u.uKey, key[0], key[1], key[2]);
    gl.uniform3f(this.u.uFill, fill[0], fill[1], fill[2]);
    // the pointer light is an on-screen interaction; a card has no pointer
    gl.uniform2f(this.u.uPointer, 0.5, 0.5);
    gl.uniform1f(this.u.uPointerAmp, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Returns the photograph's final box so the label can align to its edge
      rather than to the card margin — the label belongs to the picture. */
  private drawPhoto(L: CardLayout) {
    const { ctx } = this;
    if (!this.photo) return L.photo;
    const inner = L.mat ? { ...L.photo, w: L.photo.w - L.mat * 2, h: L.photo.h - L.mat * 2, x: L.photo.x + L.mat, y: L.photo.y + L.mat } : L.photo;
    const box = contain(inner, this.pw, this.ph);

    if (L.beside && L.column) {
      const groupW = box.w + L.column.gutter + L.column.w;
      box.x = Math.round((L.W - groupW) / 2);
    }

    if (L.mat) {
      // the print on its mat — a few percent above the ground, hairline at
      // the outer edge. The same object the Gora sequence opens.
      const m = L.mat;
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(box.x - m, box.y - m, box.w + m * 2, box.h + m * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = Math.max(1, Math.round(L.W / 1080));
      ctx.strokeRect(
        box.x - m + 0.5, box.y - m + 0.5,
        box.w + m * 2 - 1, box.h + m * 2 - 1
      );
    }

    ctx.drawImage(this.photo, box.x, box.y, box.w, box.h);
    return box;
  }

  private line(text: string, x: number, y: number, font: string, size: number, color: string, align: "left" | "right" | "center", tracking: string) {
    const { ctx } = this;
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    // supported in current Chrome and Safari; ignored elsewhere, which only
    // costs the tracking, never the text
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = tracking;
    ctx.fillText(text, x, y);
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
  }

  /**
   * Break a line to fit, at separators.
   *
   * The rig line is not one length: the gallery hands over a short form and
   * the piece page hands over the full one, lens name included — `Canon EOS
   * M6 Mark II · 18-35mm F1.8 DC HSM | Art 013 · 35mm · f/1.8 · 1/320 · ISO
   * 100`. Assuming a width is how it ends up running off the edge of the
   * card, so this measures, and breaks between facts rather than inside one.
   */
  private fitLines(text: string, font: string, size: number, tracking: string, maxW: number, maxLines: number): string[] {
    const { ctx } = this;
    const sp = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    ctx.font = `${size}px ${font}`;
    sp.letterSpacing = tracking;
    const width = (s: string) => ctx.measureText(s).width;

    if (width(text) <= maxW) {
      sp.letterSpacing = "0px";
      return [text];
    }
    const parts = text.split(" · ");
    const lines: string[] = [];
    let cur = "";
    for (const part of parts) {
      const next = cur ? `${cur} · ${part}` : part;
      if (cur && width(next) > maxW) {
        lines.push(cur);
        cur = part;
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);

    // A greedy fill packs the first line full and leaves whatever is left
    // over on the second, which on this line is usually a lone `ISO 100`
    // hanging under a full-width row. When it comes to exactly two, break it
    // nearest the middle instead: both lines then carry weight and the block
    // reads as a block rather than a line with an accident under it.
    if (lines.length === 2) {
      let best: [string, string] | null = null;
      let bestDelta = Infinity;
      for (let i = 1; i < parts.length; i++) {
        const a = parts.slice(0, i).join(" · ");
        const b = parts.slice(i).join(" · ");
        const wa = width(a);
        const wb = width(b);
        if (wa > maxW || wb > maxW) continue;
        const delta = Math.abs(wa - wb);
        if (delta < bestDelta) {
          bestDelta = delta;
          best = [a, b];
        }
      }
      if (best) lines.splice(0, 2, ...best);
    }
    sp.letterSpacing = "0px";

    if (lines.length <= maxLines) return lines;
    // more facts than there is room for: keep the first lines and let the
    // last one say it was cut, rather than silently dropping the exposure
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1] + " …";
    return kept;
  }

  /**
   * The caption — what the picture is, and what made it. Drawn hanging off
   * the photograph's own bottom edge so it reads as belonging to the picture
   * rather than as the top of the signature block.
   */
  private drawCaption(
    L: CardLayout,
    spec: CardSpec,
    f: { sans: string; mono: string },
    photo: { x: number; y: number; w: number; h: number },
    col: { x: number; top: number; bottom: number } | null
  ) {
    const HI = "rgba(255,255,255,0.92)";
    const MID = "rgba(255,255,255,0.64)";
    const LOW = "rgba(255,255,255,0.52)";
    const { step, align } = L.caption;
    // The caption measures against the card's content width, not the
    // photograph's. It is centred on the picture's centre — which, since the
    // picture is itself centred, is the card's centre — so the wider measure
    // changes nothing about where it sits and stops a narrow portrait frame
    // truncating the exposure off the end of its own caption.
    const maxW = L.caption.w;
    // beside: top of the column, level with the top of the picture.
    // portrait: hanging off the picture's bottom edge.
    // portrait anchors on the photograph's centre; landscape on its column
    const x = col ? col.x : Math.round(photo.x + photo.w / 2);
    let y = col
      ? Math.round(col.top + L.t.meta)
      : Math.round(photo.y + photo.h + L.caption.gap + L.t.meta);

    if (spec.style === "label") {
      if (spec.context) {
        this.line(spec.context, x, y, f.sans, L.t.title, HI, align, "-0.01em");
        y += Math.round(L.t.title * 1.35);
      }
      const sub = [spec.position, spec.date].filter(Boolean).join(" · ");
      if (sub) {
        this.line(sub, x, y, f.mono, L.t.meta, LOW, align, "0.015em");
        y += step;
      }
      // the hairline the site uses wherever a label meets its metadata
      const { ctx } = this;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      const ruleW = col ? maxW : Math.min(photo.w, maxW);
      ctx.fillRect(
        align === "center" ? x - ruleW / 2 : align === "right" ? x - ruleW : x,
        y - Math.round(step * 0.45),
        ruleW,
        Math.max(1, Math.round(L.W / 1080))
      );
      y += Math.round(step * 0.55);
      if (spec.rig) {
        for (const part of this.fitLines(spec.rig, f.mono, L.t.meta, "0.015em", maxW, col ? 3 : 2)) {
          this.line(part, x, y, f.mono, L.t.meta, MID, align, "0.015em");
          y += step;
        }
      }
      return;
    }

    // plate and full carry the one technical line and nothing else
    if (spec.rig) {
      const size = spec.style === "full" ? L.t.small : L.t.meta;
      for (const part of this.fitLines(spec.rig, f.mono, size, "0.02em", maxW, col ? 3 : 2)) {
        this.line(part, x, y, f.mono, size, LOW, align, "0.02em");
        y += step;
      }
    }
  }

  /**
   * The signature — the mark and the credit line, sharing one baseline at
   * opposite ends of the card. Stacking them a few points apart made one
   * lockup out of two separate things; holding them apart horizontally is
   * both clearer and the figure the site's own labels already use.
   *
   * A narrow column (landscape's caption column) cannot seat both on one
   * line, so that case is measured and falls back to a stack with real air
   * between the two — never the tight pairing this replaced.
   */
  private drawCredit(
    L: CardLayout,
    spec: CardSpec,
    f: { sans: string; mono: string },
    col: { x: number; top: number; bottom: number } | null
  ) {
    const { ctx } = this;
    const text = creditLine(spec.credit);
    const markH = L.credit.markH;
    const markW = markH * WORDMARK_RATIO;
    // beside: the signature sits on the picture's own bottom edge, so the
    // column is bounded by the photograph at both ends rather than floating
    const baseline = col ? col.bottom : L.credit.y;
    const left = col ? col.x : L.credit.left;
    const right = col ? col.x + L.caption.w : L.credit.right;

    const drawMark = (mx: number, bottom: number) => {
      ctx.save();
      ctx.translate(mx, bottom - markH);
      ctx.scale(markH / VB_H, markH / VB_H);
      ctx.translate(-VB_X, -VB_Y);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      for (const p of paths()) ctx.fill(p);
      ctx.restore();
    };

    if (!text) {
      drawMark(left, baseline);
      return;
    }

    ctx.font = `${L.t.small}px ${f.mono}`;
    const textW = ctx.measureText(text).width;
    const room = right - left;
    const oneLine = !L.credit.mayStack || markW + L.t.small * 2 + textW <= room;

    if (oneLine) {
      drawMark(left, baseline);
      this.line(text, right, baseline, f.mono, L.t.small,
        "rgba(255,255,255,0.52)", "right", "0.02em");
    } else {
      // stacked, but with a full line of air rather than a hair's breadth
      drawMark(left, baseline - L.t.small - Math.round(markH * 0.9));
      this.line(text, left, baseline, f.mono, L.t.small,
        "rgba(255,255,255,0.52)", "left", "0.02em");
    }
  }

  dispose() {
    this.gl?.getExtension("WEBGL_lose_context")?.loseContext();
    this.gl = null;
  }
}
