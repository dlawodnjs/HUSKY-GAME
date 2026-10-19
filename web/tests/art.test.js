import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileAll, compileSprite, Surface, blit, hitTest, rgba } from '../src/engine/raster.js';
import { PALETTE } from '../src/art/palette.js';
import { PUPPY } from '../src/art/puppy.js';
import { FX } from '../src/art/fx.js';
import { drawRoom, ROOM_W, ROOM_H } from '../src/art/room.js';

test('every sprite has rows of one width and only palette characters', () => {
  for (const [name, def] of Object.entries({ ...PUPPY, ...FX })) {
    const widths = new Set(def.rows.map((r) => r.length));
    assert.equal(widths.size, 1, `${name} has rows of widths ${[...widths]}`);
    assert.doesNotThrow(() => compileSprite(name, def, PALETTE), name);
  }
});

test('anchors sit inside their sprite', () => {
  const sprites = compileAll({ ...PUPPY, ...FX }, PALETTE);
  for (const s of Object.values(sprites)) {
    assert.ok(s.ax >= 0 && s.ax < s.w && s.ay >= 0 && s.ay < s.h, `${s.name} anchor ${s.ax},${s.ay} outside ${s.w}x${s.h}`);
  }
});

test('flipping mirrors around the anchor column', () => {
  const red = rgba(255, 0, 0);
  const spr = compileSprite('t', { anchor: [0, 0], rows: ['KR'] }, { K: rgba(0, 0, 0), R: red });
  const s = new Surface(5, 1);
  blit(s, spr, 2, 0, true);
  assert.equal(s.get(2, 0), rgba(0, 0, 0));
  assert.equal(s.get(1, 0), red);
  assert.ok(hitTest(spr, 2, 0, true, 1, 0));
  assert.ok(!hitTest(spr, 2, 0, true, 3, 0));
});

test('the room fills every pixel', () => {
  const s = new Surface(ROOM_W, ROOM_H);
  drawRoom(s);
  assert.ok(s.px.every((p) => p !== 0));
});
