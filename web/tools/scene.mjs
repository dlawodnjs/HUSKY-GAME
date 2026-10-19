// Renders the room with dogs in a few states, for checking scale and mood.
//   node web/tools/scene.mjs out.png [scale]
import { Surface, compileAll } from '../src/engine/raster.js';
import { PALETTE } from '../src/art/palette.js';
import { PUPPY } from '../src/art/puppy.js';
import { drawRoom, ROOM_W, ROOM_H, GROUND_Y, BED } from '../src/art/room.js';
import { drawDog } from '../src/anim/rig.js';
import { writePNG } from './png.mjs';

const sprites = compileAll(PUPPY, PALETTE);
const s = new Surface(ROOM_W, ROOM_H);
drawRoom(s);
drawDog(s, sprites, BED.x, BED.y + 2, 1, { pose: 'sleep', eyes: 'eye_closed', ears: 'ear_back' });
drawDog(s, sprites, 240, GROUND_Y, 1, { pose: 'stand' });
drawDog(s, sprites, 360, GROUND_Y, -1, { pose: 'sit', head: 'head_front' });
writePNG(process.argv[2] ?? 'scene.png', s, Number(process.argv[3] ?? 3));
