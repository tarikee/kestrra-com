#!/usr/bin/env python3
"""
The ground — a designed darkness, not a flat colour.

One baked luminance field: domain-warped fBm (the same maths as the fbm
shader, run offline) shaped into slow smoke-veils, lit as if the darkroom
had light arriving from two directions — high left, low right. Strictly
zero-chroma: R=G=B everywhere, so colour on the site still only ever
comes from the work via the spill layer.

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

W, H = 2560, 1440
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

veil = sm(0.44, 1.02, qx * 0.7 + ry * 0.55)          # broad drifting smoke
crest = np.power(np.clip(f, 0, 1), 3.4)              # rare bright crests

# the room's two light directions — high left, low right
light = 1.15 * np.exp(-(((u - 0.14) ** 2) / 0.34 + ((v + 0.04) ** 2) / 0.30)) \
      + 0.85 * np.exp(-(((u - 0.92) ** 2) / 0.24 + ((v - 1.06) ** 2) / 0.22)) \
      + 0.16

BASE = 0.0275                                        # the ground colour, #07
# the veils carry the light; a faint direct glow keeps the room shaped even
# where the smoke is thin
lum = BASE + (veil * 0.085 + crest * 0.105) * light + light * 0.016

# edges settle back toward the ground so the fixed layer never shows a seam
edge = sm(0.0, 0.06, u) * sm(1.0, 0.94, u) * sm(0.0, 0.07, v) * sm(1.0, 0.93, v)
lum = BASE + (lum - BASE) * (0.35 + 0.65 * edge)

img = (np.clip(lum, 0, 1) * 255)
out = np.repeat(img[..., None], 3, axis=2).astype(np.uint8)
dest = Path(__file__).parent / ".cache" / "ground.png"
dest.parent.mkdir(exist_ok=True)
Image.fromarray(out).save(dest)
print(f"{dest} — min {img.min():.1f} max {img.max():.1f} mean {img.mean():.1f} (8-bit)")
