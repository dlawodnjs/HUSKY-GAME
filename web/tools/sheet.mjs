// Renders every sprite of a set into one PNG sheet (with a checkerboard so
// transparent pixels are visible) and reports rows of inconsistent width.
//   node web/tools/sheet.mjs [out.png] [scale]
import { Surface, compileAll, blit, hex } from '../src/engine/raster.js';
import { PALETTE } from '../src/art/palette.js';
import { PUPPY } from '../src/art/puppy.js';
import { writePNG } from './png.mjs';

const out = process.argv[2] ?? 'sheet.png';
const scale = Number(process.argv[3] ?? 8);

for (const [name, def] of Object.entries(PUPPY)) {
  const widths = new Set(def.rows.map((r) => r.length));
  if (widths.size > 1) console.warn(`! ${name}: row widths ${[...widths].join(', ')}`);
}

const sprites = compileAll(PUPPY, PALETTE);
const list = Object.values(sprites);
const cell = 2 + Math.max(...list.map((s) => Math.max(s.w, s.h)));
const cols = 8;
const rowsN = Math.ceil(list.length / cols);
const sheet = new Surface(cols * cell, rowsN * cell);
const a = hex('#e9e4dc');
const b = hex('#d9d2c7');
for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) sheet.set(x, y, (x + y) % 2 ? a : b);
list.forEach((s, i) => {
  const cx = (i % cols) * cell + 1;
  const cy = Math.floor(i / cols) * cell + 1;
  blit(sheet, s, cx + s.ax, cy + s.ay);
  sheet.set(cx + s.ax, cy + s.ay + 0, sheet.get(cx + s.ax, cy + s.ay));
  console.log(`${String(i).padStart(2)} ${s.name} ${s.w}x${s.h}`);
});
writePNG(out, sheet, scale);
console.log(`wrote ${out}`);
