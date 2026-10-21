// Rough-sketch helper for new key poses. Blocks in the silhouette with simple
// shapes (ellipses, capsules, polygons), auto-outlines it and prints a text
// grid in the husky frame format. The printed grid is only a starting rough:
// it gets cleaned up and detailed by hand in src/art/husky/*.js (markings,
// eyes, outline steps, fur clumps), the way a rough sketch is traced.
//   node web/tools/sketch.mjs POSE > rough.txt
import { FRAME_W, FRAME_H } from '../src/art/husky/index.js';

const ell = (cx, cy, rx, ry) => (x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
const cap = (x1, y1, x2, y2, r) => (x, y) => {
  const px = x + 0.5;
  const py = y + 0.5;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)) <= r;
};
const poly = (pts) => (x, y) => {
  const px = x + 0.5;
  const py = y + 0.5;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const any = (...fs) => (x, y) => fs.some((f) => f(x, y));
// A thick stroke through points with a radius per point (tails, curled bodies).
const stroke = (pts) => {
  const segs = [];
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1, r1] = pts[i - 1];
    const [x2, y2, r2] = pts[i];
    for (let t = 0; t <= 1; t += 0.1) segs.push(ell(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r1 + (r2 - r1) * t, r1 + (r2 - r1) * t));
  }
  return any(...segs);
};

// Each pose: list of parts, low z first. line: outline this part where it
// meets a part drawn before it.
const POSES = {
  stand: () => [
    { name: 'legFarB', shape: any(cap(17, 47, 17, 55, 2.4), ell(18, 56.6, 3.3, 2)), color: () => 'w', line: true },
    { name: 'legFarF', shape: any(cap(40.5, 46, 40.5, 55, 2.5), ell(41.5, 56.6, 3.3, 2)), color: () => 'w', line: true },
    { name: 'tail', shape: stroke([[20, 35, 3], [16, 30, 3.6], [16, 24, 3.8], [20, 20.5, 3.5], [25, 21, 2.8], [27, 24, 2]]), color: (x, y) => (y > 27 || x > 24 ? 'W' : 'D'), line: true },
    {
      name: 'body',
      shape: any(ell(31, 41, 13.5, 8), ell(21, 41, 6.5, 7.5), ell(42, 40, 6.5, 8.5), poly([[37, 35], [43, 26], [50, 30], [47, 42]])),
      color: (x, y) => (x > 42 && y > 33 ? 'W' : y < 37 ? 'D' : y < 43 ? 'G' : 'W'),
    },
    { name: 'earFar', shape: poly([[40.5, 22], [41.5, 13], [42.5, 12.5], [46.5, 19]]), color: () => 'D', line: true },
    {
      name: 'head',
      shape: any(ell(50, 25, 9, 8), poly([[55, 24.5], [62.5, 25.5], [64.5, 27.5], [64.5, 30], [62, 32], [55, 33]]), ell(46, 31, 6, 5.5)),
      color: (x, y) => (y < 23 ? 'D' : 'W'),
    },
    { name: 'earNear', shape: poly([[44.5, 19.5], [47.5, 10.5], [48.5, 10], [53.5, 18.5]]), color: () => 'D' },
    { name: 'legNearB', shape: any(ell(23, 43, 6.5, 6.5), cap(21.5, 48, 22, 55, 2.7), ell(23, 56.6, 3.7, 2)), color: (x, y) => (y < 46 ? 'G' : 'W'), line: true },
    { name: 'legNearF', shape: any(cap(45.5, 46, 45.5, 55, 2.8), ell(46.5, 56.6, 3.7, 2)), color: () => 'W', line: true },
  ],
};

const pose = process.argv[2] ?? 'stand';
const parts = POSES[pose]();
const id = [];
const out = [];
for (let y = 0; y < FRAME_H; y++) {
  id.push([]);
  out.push([]);
  for (let x = 0; x < FRAME_W; x++) {
    let top = -1;
    parts.forEach((p, i) => p.shape(x, y) && (top = i));
    id[y].push(top);
    out[y].push(top < 0 ? '.' : parts[top].color(x, y));
  }
}
const at = (x, y) => (x < 0 || y < 0 || x >= FRAME_W || y >= FRAME_H ? -1 : id[y][x]);
for (let y = 0; y < FRAME_H; y++) {
  for (let x = 0; x < FRAME_W; x++) {
    const me = id[y][x];
    if (me < 0) continue;
    const ns = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
    if (ns.some((n) => n < 0) || (parts[me].line && ns.some((n) => n >= 0 && n !== me))) out[y][x] = 'K';
  }
}
console.log(out.map((r) => r.join('')).join('\n'));
