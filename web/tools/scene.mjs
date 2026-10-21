// Renders the room with dogs in a few poses, for checking scale and mood.
//   node web/tools/scene.mjs out.png [scale]
import { Surface } from '../src/engine/raster.js';
import { drawRoom, ROOM_W, ROOM_H, GROUND_Y, BED } from '../src/art/room.js';
import { drawDog } from '../src/anim/sprite_dog.js';
import { writePNG } from './png.mjs';

const s = new Surface(ROOM_W, ROOM_H);
drawRoom(s);
drawDog(s, BED.x, BED.y + 2, 1, { frame: 'sleep', overlays: [] });
drawDog(s, 240, GROUND_Y, 1, { frame: 'stand', overlays: [] });
drawDog(s, 360, GROUND_Y, -1, { frame: 'sit', overlays: ['look_front_sit'].filter(() => false) });
writePNG(process.argv[2] ?? 'scene.png', s, Number(process.argv[3] ?? 3));
