#!/usr/bin/env python3
"""Extract 'kestrra' glyph outlines from Most Wasted as SVG path data.

Output: JSON with per-glyph path (y-flipped into SVG coords), advances,
kerning-adjusted x offsets, and overall bbox — ready to become a React
component. Geometry is exact; no rasterisation anywhere.
"""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

FONT = "/Users/tarik/Library/Fonts/Mostwasted.ttf"
WORD = "kestrra"

font = TTFont(FONT)
upm = font["head"].unitsPerEm
cmap = font.getBestCmap()
glyphset = font.getGlyphSet()
hmtx = font["hmtx"]

# kerning: kern table (legacy) or GPOS — try kern first
kern = {}
if "kern" in font:
    for table in font["kern"].kernTables:
        if hasattr(table, "kernTable"):
            kern.update(table.kernTable)

names = [cmap[ord(c)] for c in WORD]
print("glyph names:", names, file=sys.stderr)

glyphs = []
x = 0.0
prev = None
for ch, gname in zip(WORD, names):
    if prev is not None:
        x += kern.get((prev, gname), 0)
    g = glyphset[gname]
    # y-flip: font y-up -> svg y-down. Transform (1,0,0,-1,0,0); shift later via viewBox.
    spen = SVGPathPen(glyphset, ntos=lambda v: f"{v:.1f}")
    tpen = TransformPen(spen, Transform(1, 0, 0, -1, 0, 0))
    g.draw(tpen)
    bpen = BoundsPen(glyphset)
    g.draw(bpen)
    bounds = bpen.bounds  # (xMin, yMin, xMax, yMax) in font coords
    adv = hmtx[gname][0]
    glyphs.append({
        "char": ch, "name": gname, "x": x, "advance": adv,
        "d": spen.getCommands(),
        "bounds": bounds,
    })
    x += adv
    prev = gname

total_advance = x
ymin = min(g["bounds"][1] for g in glyphs if g["bounds"])
ymax = max(g["bounds"][3] for g in glyphs if g["bounds"])
xmin = min(g["bounds"][0] + g["x"] for g in glyphs if g["bounds"])
xmax = max(g["bounds"][2] + g["x"] for g in glyphs if g["bounds"])

out = {
    "word": WORD, "unitsPerEm": upm, "totalAdvance": total_advance,
    "bbox": [xmin, -ymax, xmax, -ymin],  # svg coords after y-flip
    "glyphs": [{"char": g["char"], "x": g["x"], "advance": g["advance"], "d": g["d"]} for g in glyphs],
}
with open(sys.argv[1], "w") as f:
    json.dump(out, f)
print(f"upm={upm} advance={total_advance} bbox={out['bbox']}", file=sys.stderr)

# quick visual check svg
vb = out["bbox"]
pad = upm * 0.05
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]-pad} {vb[1]-pad} {vb[2]-vb[0]+2*pad} {vb[3]-vb[1]+2*pad}">',
       '<rect x="-10000" y="-10000" width="40000" height="40000" fill="#08090A"/>']
for g in out["glyphs"]:
    svg.append(f'<path transform="translate({g["x"]} 0)" d="{g["d"]}" fill="#EDEDED"/>')
svg.append("</svg>")
with open(sys.argv[2], "w") as f:
    f.write("".join(svg))
