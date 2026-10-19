// Renders animation clips headlessly: a contact sheet of every clip and, with
// --gif, one animated GIF per clip (needs ffmpeg).
//   node web/tools/clips.mjs outDir [--gif] [--only=name,name] [--scale=4]
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Surface, compileAll, hex } from '../src/engine/raster.js';
import { PALETTE } from '../src/art/palette.js';
import { PUPPY } from '../src/art/puppy.js';
import { FX } from '../src/art/fx.js';
import { CLIPS } from '../src/anim/clips.js';
import { Animator } from '../src/anim/animator.js';
import { drawDog, anchors } from '../src/anim/rig.js';
import { Effects } from '../src/engine/fx.js';
import { writePNG } from './png.mjs';

const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith('--')) ?? 'clips-out';
const gif = args.includes('--gif');
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const scale = Number(args.find((a) => a.startsWith('--scale='))?.slice(8) ?? 4);
mkdirSync(outDir, { recursive: true });

const sprites = compileAll({ ...PUPPY, ...FX }, PALETTE);
const W = 72;
const H = 54;
const GROUND = 46;
const BG = hex('#efe6d8');
const FLOOR = hex('#c49a74');
const FLOOR_LINE = hex('#a77f5d');

// Deterministic randomness so renders are reproducible.
let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function renderClip(name, seconds, fps = 30) {
  const anim = new Animator({ random });
  anim.mood = 0.6;
  anim.play(name);
  // Start from the clip itself, skipping any lead-in transition.
  anim.queue = [];
  anim._start(name);
  const fx = new Effects(random);
  const frames = [];
  const dt = 1 / fps;
  for (let i = 0; i < seconds * fps; i++) {
    const spawned = anim.update(dt);
    const st = anim.state();
    const ax = anchors(sprites, W / 2, GROUND, 1, st);
    for (const k of spawned) {
      const [x, y] = ax[Effects.origin(k)];
      fx.spawn(k, x, y, 1);
    }
    fx.update(dt);
    const s = new Surface(W, H);
    s.clear(BG);
    s.fillRect(0, GROUND, W, H - GROUND, FLOOR);
    s.fillRect(0, GROUND, W, 1, FLOOR_LINE);
    drawDog(s, sprites, W / 2, GROUND, 1, st);
    fx.draw(s, sprites);
    frames.push(s);
  }
  return frames;
}

const names = only ?? Object.keys(CLIPS);
// Contact sheet: 6 evenly spaced frames per clip.
const PER = 6;
const sheet = new Surface(W * PER, H * names.length);
names.forEach((name, row) => {
  const frames = renderClip(name, 2.4, 10);
  for (let i = 0; i < PER; i++) {
    const f = frames[Math.floor((i * frames.length) / PER)];
    for (let y = 0; y < H; y++) sheet.px.set(f.px.subarray(y * W, (y + 1) * W), (row * H + y) * sheet.w + i * W);
  }
});
writePNG(join(outDir, 'contact.png'), sheet, scale);
console.log('clips:', names.join(', '));

if (gif) {
  for (const name of names) {
    const tmp = join(outDir, `_${name}`);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp);
    const frames = renderClip(name, CLIPS[name].loop ? 2.4 : 3.0, 30);
    frames.forEach((f, i) => writePNG(join(tmp, `f${String(i).padStart(4, '0')}.png`), f, scale));
    const out = join(outDir, `${name}.gif`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', join(tmp, 'f%04d.png'),
      '-vf', 'split[a][b];[a]palettegen=reserve_transparent=0[p];[b][p]paletteuse=dither=none', out]);
    rmSync(tmp, { recursive: true, force: true });
    console.log('gif', out);
  }
}
