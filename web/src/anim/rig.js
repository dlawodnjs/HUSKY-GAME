// Assembles the puppy from parts. Local coordinates: origin is the floor
// point under the middle of the torso, +x is forward (the way the dog faces),
// -y is up. Every position is an integer pixel.

import { blit, hitTest } from '../engine/raster.js';
import { hex } from '../engine/raster.js';

const FAR_TINT = { color: hex('#2a2738'), alpha: 0.28 };

// Where features sit on each head sprite (head-local, top-left origin).
export const HEADS = {
  head_side: { eye: [10, 5], mouth: [12, 9], earNear: [8, 3], earFar: [4, 4] },
  head_up: { eye: [7, 7], mouth: [11, 4], earNear: [6, 5], earFar: [3, 6] },
  head_down: { eye: [9, 5], mouth: [10, 13], earNear: [8, 3], earFar: [4, 4] },
  head_front: { eyes: [[3, 7], [10, 7]], mouth: [6, 12] },
  head_tilt: { eyes: [[5, 7], [12, 7]], mouth: [7, 12] },
};

// Base poses. `legs` keys: f1 near front, f2 far front, b1 near back, b2 far back.
export const POSES = {
  stand: {
    torso: ['torso_stand', 0, -7],
    head: [7, -13],
    tail: [-9, -14, 'tail_up'],
    legs: {
      f2: ['leg_straight', 8, -8],
      b2: ['leg_straight', -9, -8],
      f1: ['leg_straight', 5, -8],
      b1: ['leg_straight', -6, -8],
    },
  },
  sit: {
    torso: ['torso_sit', -2, -1],
    head: [2, -14],
    tail: [-8, -3, 'tail_mid'],
    legs: {
      f2: ['leg_long', 6, -12],
      f1: ['leg_long', 3, -12],
    },
    extras: [['haunch', -6, -1]],
  },
  lie: {
    torso: ['torso_stand', 0, -1],
    head: [7, -7],
    tail: [-10, -3, 'tail_mid'],
    legs: {
      f2: ['leg_front_lie', 6, -4],
      f1: ['leg_front_lie', 5, -3],
    },
    extras: [['haunch', -6, -1]],
  },
  sleep: {
    torso: ['torso_curl', 0, -1],
    head: [8, -2],
    tail: null,
    legs: {},
    extras: [['tail_wrap', -2, -1]],
  },
  bow: {
    torso: ['torso_bow', 0, -3],
    head: [9, -5],
    tail: [-10, -14, 'tail_up'],
    legs: {
      b2: ['leg_straight', -10, -8],
      f2: ['leg_front_lie', 6, -4],
      b1: ['leg_straight', -8, -8],
      f1: ['leg_front_lie', 5, -3],
    },
  },
  crouch: {
    torso: ['torso_stand', 0, -5],
    head: [6, -10],
    tail: [-9, -11, 'tail_down'],
    legs: {
      f2: ['leg_short', 8, -6],
      b2: ['leg_short', -9, -6],
      f1: ['leg_short', 5, -6],
      b1: ['leg_short', -6, -6],
    },
  },
};

const LEG_ORDER_FAR = ['f2', 'b2'];
const LEG_ORDER_NEAR = ['b1', 'f1'];

// state: { pose, legs: {f1:'leg_fwd',...}, tail, head, eyes, mouth, ears,
//          dy, headDx, headDy, tailDx }
// Returns the list of draw ops so callers can also hit-test parts.
export function layout(state) {
  const pose = POSES[state.pose] ?? POSES.stand;
  const legDy = state.dy ?? 0;
  const dy = legDy + (state.bodyDy ?? 0);
  const bdx = state.bodyDx ?? 0;
  const ops = [];
  const legSprite = (key, def) => (state.legs && state.legs[key]) || def;

  for (const key of LEG_ORDER_FAR) {
    const leg = pose.legs[key];
    if (leg) ops.push({ part: 'leg', sprite: legSprite(key, leg[0]), x: leg[1], y: leg[2] + legDy, far: true });
  }
  if (pose.tail) {
    const t = pose.tail;
    ops.push({ part: 'tail', sprite: state.tail ?? t[2], x: t[0] + bdx + (state.tailDx ?? 0), y: t[1] + dy });
  }
  const [ts, tx, ty] = pose.torso;
  ops.push({ part: 'torso', sprite: state.torso ?? ts, x: tx + bdx, y: ty + dy });
  for (const [s, ex, ey] of pose.extras ?? []) ops.push({ part: s === 'tail_wrap' ? 'tail' : 'haunch', sprite: s, x: ex + bdx, y: ey + dy });
  for (const key of LEG_ORDER_NEAR) {
    const leg = pose.legs[key];
    if (leg) ops.push({ part: 'leg', sprite: legSprite(key, leg[0]), x: leg[1], y: leg[2] + legDy });
  }
  const headName = state.head ?? 'head_side';
  const hx = pose.head[0] + bdx + (state.headDx ?? 0);
  const hy = pose.head[1] + dy + (state.headDy ?? 0);
  ops.push({ part: 'head', sprite: headName, x: hx, y: hy, features: HEADS[headName] });
  return ops;
}

// Draws the dog with its origin at (x, y). facing: 1 right, -1 left.
export function drawDog(surface, sprites, x, y, facing, state) {
  const flip = facing < 0;
  const ops = layout(state);
  for (const op of ops) {
    const spr = sprites[op.sprite];
    if (!spr) continue;
    const px = x + (flip ? -op.x : op.x);
    const py = y + op.y;
    if (op.part === 'head' && op.features) {
      drawHead(surface, sprites, spr, px, py, flip, op.features, state);
    } else {
      blit(surface, spr, px, py, flip, op.far ? FAR_TINT : null);
    }
  }
  return ops;
}

// The far ear goes behind the head; the near ear, eyes and mouth on top.
function drawHead(surface, sprites, head, hx, hy, flip, f, state) {
  const left = flip ? hx + head.ax - (head.w - 1) : hx - head.ax;
  const top = hy - head.ay;
  // Feature positions are where the feature sprite's anchor lands, in
  // head-local pixels; mirrored with the head when facing left.
  const at = (lx, ly) => [flip ? left + (head.w - 1 - lx) : left + lx, top + ly];
  const ear = f.earNear ? sprites[state.ears ?? 'ear_up'] : null;
  if (ear) blit(surface, ear, ...at(f.earFar[0], f.earFar[1]), flip, FAR_TINT);
  blit(surface, head, hx, hy, flip);
  if (ear) blit(surface, ear, ...at(f.earNear[0], f.earNear[1]), flip);
  const eye = sprites[state.eyes ?? 'eye_open'];
  if (eye) for (const [ex, ey] of f.eyes ?? [f.eye]) blit(surface, eye, ...at(ex, ey), flip);
  const mouthName = state.mouth && (f.eyes ? state.mouth.replace('mouth_', 'mouthf_') : state.mouth);
  const mouth = mouthName && (sprites[mouthName] ?? sprites[state.mouth]);
  if (mouth) blit(surface, mouth, ...at(f.mouth[0], f.mouth[1]), flip);
}

// Which part of the dog is under the world pixel (px, py)? Topmost wins.
export function partAt(sprites, x, y, facing, state, px, py) {
  const flip = facing < 0;
  const ops = layout(state);
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i];
    const spr = sprites[op.sprite];
    if (spr && hitTest(spr, x + (flip ? -op.x : op.x), y + op.y, flip, px, py)) return op.part;
  }
  return null;
}

// World positions effects spawn from: above the head, the body centre, the feet.
export function anchors(sprites, x, y, facing, state) {
  const flip = facing < 0;
  const ops = layout(state);
  const head = ops.find((o) => o.part === 'head');
  const torso = ops.find((o) => o.part === 'torso');
  const hs = sprites[head.sprite];
  const ts = sprites[torso.sprite];
  const sx = (lx) => x + (flip ? -lx : lx);
  return {
    head: [sx(head.x + Math.round(hs.w / 2) - hs.ax), y + head.y - hs.ay - 4],
    body: [sx(torso.x), y + torso.y - Math.round(ts.h / 2)],
    feet: [sx(-6), y - 1],
  };
}
