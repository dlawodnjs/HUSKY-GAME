// Renders named dog states side by side on a floor strip, for reviewing the
// rig and art without a browser.
//   node web/tools/poses.mjs out.png [scale]
import { Surface, compileAll, hex } from '../src/engine/raster.js';
import { PALETTE } from '../src/art/palette.js';
import { PUPPY } from '../src/art/puppy.js';
import { drawDog } from '../src/anim/rig.js';
import { writePNG } from './png.mjs';

const out = process.argv[2] ?? 'poses.png';
const scale = Number(process.argv[3] ?? 6);
const sprites = compileAll(PUPPY, PALETTE);

export const SAMPLES = [
  { pose: 'stand' },
  { pose: 'stand', mouth: 'mouth_open', eyes: 'eye_happy', tail: 'tail_up_b' },
  { pose: 'stand', legs: { f1: 'leg_fwd', f2: 'leg_back', b1: 'leg_back', b2: 'leg_fwd' } },
  { pose: 'stand', dy: -1, legs: { f1: 'leg_straight', f2: 'leg_lift', b1: 'leg_lift', b2: 'leg_straight' } },
  { pose: 'stand', facing: -1 },
  { pose: 'sit', eyes: 'eye_half' },
  { pose: 'lie', ears: 'ear_back' },
  { pose: 'sleep', eyes: 'eye_closed' },
  { pose: 'stand', head: 'head_down' },
  { pose: 'sit', head: 'head_up' },
  { pose: 'sit', head: 'head_front' },
  { pose: 'sit', head: 'head_tilt' },
];

const pick = process.argv[4] ? process.argv[4].split(',').map(Number) : SAMPLES.map((_, i) => i);
const chosen = pick.map((i) => SAMPLES[i]);
const cellW = 56;
const s = new Surface(cellW * chosen.length, 48);
s.clear(hex('#e8dfd0'));
s.fillRect(0, 40, s.w, 8, hex('#b98f6a'));
chosen.forEach((st, i) => drawDog(s, sprites, i * cellW + cellW / 2, 40, st.facing ?? 1, st));
writePNG(out, s, scale);
console.log(`wrote ${out}`);
