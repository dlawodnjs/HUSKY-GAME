// Renders hand-drawn husky frames for review: each frame at 1x (true size, on
// a floor strip) and enlarged with a pixel grid, so outline steps and stray
// pixels are easy to spot. Also lints for orphan pixels.
//   node web/tools/husky.mjs out.png [frame,frame|all] [scale] [--overlay=stamp,stamp]
import { Surface, hex, blit, mix } from '../src/engine/raster.js';
import { PALETTE } from '../src/art/palette.js';
import { HUSKY } from '../src/art/husky/frames.js';
import { composeFrame, FRAME_W, FRAME_H } from '../src/art/husky/index.js';
import { writePNG } from './png.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const out = args[0] ?? 'husky.png';
const pick = !args[1] || args[1] === 'all' ? Object.keys(HUSKY.frames) : args[1].split(',');
const scale = Number(args[2] ?? 6);
const overlay = flags.find((f) => f.startsWith('--overlay='))?.slice(10).split(',') ?? [];
// --crop=x,y,w,h enlarges only part of each frame (the true-size strip is skipped).
const crop = flags.find((f) => f.startsWith('--crop='))?.slice(7).split(',').map(Number);

const BG = hex('#efe6d8');
const BG2 = hex('#e6dccb');
const FLOOR = hex('#c49a74');
const GRID = hex('#d8ccb8');

// Enlarged cells drawn into one big surface (scale baked in) plus a 1x strip.
const pad = 4;
const [cx, cy, cw, ch] = crop ?? [0, 0, FRAME_W, FRAME_H];
const cellW = cw + pad;
const big = new Surface(cellW * pick.length * scale, ch * scale + (crop ? 0 : (FRAME_H + pad) * 2));
big.clear(BG);
pick.forEach((name, i) => {
  const spr = composeFrame(HUSKY, name, overlay.filter((o) => HUSKY.stamps[o]));
  const s = new Surface(cellW, ch);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cellW; x++) s.set(x, y, (x + y) % 2 ? BG : BG2);
  blit(s, spr, spr.ax + pad / 2 - cx, spr.ay - cy);
  // enlarged with grid
  const ox = i * cellW * scale;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cellW; x++) {
      big.fillRect(ox + x * scale, y * scale, scale, scale, s.get(x, y));
      if (scale >= 5) {
        big.fillRect(ox + x * scale, y * scale + scale - 1, scale, 1, mixGrid(s.get(x, y)));
        big.fillRect(ox + x * scale + scale - 1, y * scale, 1, scale, mixGrid(s.get(x, y)));
      }
    }
  }
  // true size, scaled by an integer 2 so it is still small
  if (crop) return lint(name);
  const ty = FRAME_H * scale + pad * 2;
  const t = 2;
  big.fillRect(ox, ty + FRAME_H * t - 2, cellW * scale, big.h, FLOOR);
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const c = spr.px[y * FRAME_W + x];
      if (c) big.fillRect(ox + (pad / 2 + x) * t, ty + y * t, t, t, c);
    }
  }
  lint(name);
});

function mixGrid(c) {
  return c === BG || c === BG2 ? GRID : mix(c, hex('#000000'), 0.15);
}

// Orphans: an opaque pixel with no opaque 8-neighbour.
function lint(name) {
  const f = HUSKY.frames[name];
  const g = (x, y) => (x < 0 || y < 0 || x >= FRAME_W || y >= FRAME_H ? 0 : f.px[y * FRAME_W + x]);
  const bad = [];
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      if (!g(x, y)) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && g(x + dx, y + dy)) n++;
      if (!n) bad.push(`${x},${y}`);
    }
  }
  if (bad.length) console.warn(`! ${name}: orphan pixels ${bad.join(' ')}`);
}

writePNG(out, big, 1);
console.log(`wrote ${out} (${pick.join(', ')})`);
