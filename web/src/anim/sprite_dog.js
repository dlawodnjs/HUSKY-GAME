// Draws the husky from an animator state ({ frame, overlays }). Every frame is
// a whole hand-drawn picture whose anchor is the floor under the dog, so
// drawing is a single blit (mirrored when facing left).

import { blit, hitTest } from '../engine/raster.js';
import { HUSKY } from '../art/husky/frames.js';
import { composeFrame, ANCHOR } from '../art/husky/index.js';

export function dogSprite(state, lib = HUSKY) {
  return composeFrame(lib, state.frame, state.overlays);
}

// Draws the dog with its anchor at (x, y). facing: 1 right, -1 left.
export function drawDog(surface, x, y, facing, state, lib = HUSKY) {
  const spr = dogSprite(state, lib);
  blit(surface, spr, x, y, facing < 0);
  return spr;
}

// Frame-local point -> world, mirrored around the anchor when facing left.
function toWorld(x, y, facing, [px, py]) {
  return [x + (px - ANCHOR[0]) * facing, y + (py - ANCHOR[1])];
}

// Which part of the dog is under the world pixel (px, py)? Only opaque pixels
// count; parts are checked head, tail, leg, then everything else is body.
const PART_ORDER = ['head', 'tail', 'leg'];
export function partAt(x, y, facing, state, px, py, lib = HUSKY) {
  const spr = dogSprite(state, lib);
  if (!hitTest(spr, x, y, facing < 0, px, py)) return null;
  const lx = Math.round(facing < 0 ? x - px : px - x) + ANCHOR[0];
  const ly = Math.round(py - y) + ANCHOR[1];
  for (const name of PART_ORDER) {
    for (const p of spr.parts) {
      const [rx, ry, rw, rh] = p.rect;
      if (p.name === name && lx >= rx && ly >= ry && lx < rx + rw && ly < ry + rh) return name;
    }
  }
  return 'body';
}

// World positions effects spawn from (above the head, the body centre, the
// feet) and the eye, which the head-follows-cursor logic measures from.
export function anchors(x, y, facing, state, lib = HUSKY) {
  const pts = dogSprite(state, lib).points;
  return {
    head: toWorld(x, y, facing, pts.head),
    body: toWorld(x, y, facing, pts.body),
    feet: toWorld(x, y, facing, pts.feet),
    eye: toWorld(x, y, facing, pts.eye ?? pts.head),
  };
}
