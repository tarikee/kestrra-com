#!/usr/bin/env python3
"""
The ground — a designed darkness, not a flat colour.

One baked field: domain-warped fBm (the same maths as the fbm shader, run
offline) shaped into slow smoke-veils, lit as if the darkroom had light
arriving from two directions — high left, low right.

The room is toned, the way a print is toned: the key light carries the
colour of the work, the fill carries its complement. The base black stays a
true neutral, so the darks are still darks and the chroma only ever lives in
the light. The tone here is the *corpus* tone — the average of every set's
spill — because a baked still cannot know which set you are looking at; the
live field (components/ground.tsx) re-tones per set on top of it.

Texture is baked in too: a fine grit riding on the veils, a raking striation
across the light, and silver grain — so the field reads as air with
something in it rather than a smooth gradient.

Output: pipeline/.cache/ground.png (2560x1440), encoded to
public/img/ground.avif + .webp by `bun run pipeline/encode-ground.ts`.
"""
import numpy as np
from PIL import Image
from pathlib import Path

def hashv(px, py):
    px = np.modf(px * 234.34)[0]; py = np.modf(py * 435.345)[0]
    d = px * (px + 34.23) + py * (py + 34.23)
    px = px + d; py = py + d
    return np.modf(px * py)[0]

def vnoise(px, py):
    ix, fx = np.floor(px), px - np.floor(px)
    iy, fy = np.floor(py), py - np.floor(py)
    ux = fx * fx * (3 - 2 * fx); uy = fy * fy * (3 - 2 * fy)
    a = hashv(ix, iy); b = hashv(ix + 1, iy); c = hashv(ix, iy + 1); d = hashv(ix + 1, iy + 1)
    return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy

C, S = np.cos(0.62), np.sin(0.62)
def fbm(px, py, octaves=5):
    v = np.zeros_like(px); amp = 0.55
    for _ in range(octaves):
        v += amp * vnoise(px, py)
        px, py = (C * px - S * py) * 2.02, (S * px + C * py) * 2.02
        amp *= 0.5
    return v

def sm(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# ── the toning ──────────────────────────────────────────────────────────
# Every set's spill, averaged in linear light: the colour of the body of
# work as a whole. Keep in sync with corpusSpill() in lib/work.ts.
CORPUS_SPILL = "#5b544d"
KEY_CHROMA = 0.60   # how far the key light departs from neutral
FILL_CHROMA = 0.48  # the complement, in the fill

def _srgb_to_linear(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def tone(hex_spill, key_chroma=KEY_CHROMA, fill_chroma=FILL_CHROMA):
    """Split-tone a spill hex into (key, fill) multipliers around neutral 1.

    The hue is the set's; the *amount* is fixed, so a strongly-coloured set
    never shouts louder than a quiet one — only its hue differs. The fill is
    the reciprocal direction, which is what makes a toned print read as
    toned: warm light, cool shadow (or the reverse), never one flat wash.
    """
    n = int(hex_spill.lstrip("#"), 16)
    rgb = _srgb_to_linear(np.array([(n >> 16) & 255, (n >> 8) & 255, n & 255]) / 255.0)
    d = rgb / rgb.mean()
    def norm(v, target):
        c = np.abs(v - 1).max()
        return 1 + (v - 1) * (target / c if c > 1e-4 else 0)
    inv = 1 / d
    return norm(d, key_chroma), norm(inv / inv.mean(), fill_chroma)

KEY_COL, FILL_COL = tone(CORPUS_SPILL)


BASE = 0.0275   # the ground colour, #07 — a true neutral, always

def render(W, H):
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float64)
    px = (xs - W / 2) / min(W, H) * 0.62   # large scale — veils, not noise
    py = -(ys - H / 2) / min(W, H) * 0.62
    u = xs / W; v = ys / H                  # 0..1 screen coords

    # double warp, frozen at a chosen moment
    qx = fbm(px + 2.0, py + 2.0)
    qy = fbm(px + 5.2 - 1.4, py + 1.3 - 1.4)
    rx = fbm(px + 3.6 * qx + 1.7 + 0.8, py + 3.6 * qy + 9.2 + 0.8)
    ry = fbm(px + 3.6 * qx + 8.3 - 0.6, py + 3.6 * qy + 2.8 - 0.6)
    f = fbm(px + 3.2 * rx, py + 3.2 * ry)

    veil = sm(0.30, 0.95, qx * 0.7 + ry * 0.55)          # broad drifting smoke
    crest = np.power(np.clip(f, 0, 1), 2.8)              # rare bright crests

    # fine grit inside the smoke — structure at the scale you actually see
    grit = fbm(px * 5.4 + rx * 1.3, py * 5.4 + ry * 1.3, octaves=3) - 0.48

    # raking striation — light arriving through something, not through nothing
    streak = fbm(px * 1.1 + 11.0, py * 7.4 - 3.0, octaves=2)
    rake = 1 + (streak - 0.41) * 0.46

    # the room's two light directions — high left, low right
    lightK = 0.92 * np.exp(-(((u - 0.14) ** 2) / 0.46 + ((v + 0.04) ** 2) / 0.40)) * rake
    lightF = 0.82 * np.exp(-(((u - 0.92) ** 2) / 0.40 + ((v - 1.06) ** 2) / 0.34)) * rake
    AMB = 0.36

    # the veils carry the light; a faint direct glow keeps the room shaped even
    # where the smoke is thin
    density = (veil * 0.150 + crest * 0.185) * (1 + grit * 0.85 * (0.35 + 0.65 * veil))
    density = np.clip(density, 0, None)

    lit = (KEY_COL[:, None, None] * lightK
           + FILL_COL[:, None, None] * lightF
           + AMB)
    rgb = BASE + lit * (density + 0.028)

    # edges settle back toward the ground so the fixed layer never shows a seam
    edge = sm(0.0, 0.06, u) * sm(1.0, 0.94, u) * sm(0.0, 0.07, v) * sm(1.0, 0.93, v)
    rgb = BASE + (rgb - BASE) * (0.35 + 0.65 * edge)

    # No grain baked in: AVIF/WebP spend their whole budget on it and then
    # destroy it anyway, blotching the veils in the process. The silver is
    # laid on in the browser instead (.ground-grain), where it costs nothing
    # and stays sharp at any DPR.
    return np.clip(rgb, 0, 1) * 255


# Two crops. `cover` on a phone would throw away most of a 16:9 field, and the
# still is the *only* ground there (no WebGL, no motion) — so the portrait
# room is composed for portrait, not cropped out of the landscape one.
dest = Path(__file__).parent / ".cache"
dest.mkdir(exist_ok=True)
print(f"  key {np.round(KEY_COL, 3)}   fill {np.round(FILL_COL, 3)}")
for name, (W, H) in {"ground": (2560, 1440), "ground-portrait": (1200, 2000)}.items():
    img = render(W, H)
    Image.fromarray(np.moveaxis(img, 0, -1).astype(np.uint8)).save(dest / f"{name}.png")
    spread = img.max(axis=0) - img.min(axis=0)
    stats = "  ".join(f"{c} {img[i].min():.0f}–{img[i].max():.0f}/{img[i].mean():.1f}" for i, c in enumerate("RGB"))
    print(f"{name}.png {W}x{H}  {stats}  chroma p99 {np.percentile(spread, 99):.0f}")
