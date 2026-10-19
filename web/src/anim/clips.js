// Animation clips. A clip has a base state (pose + overrides) and frames that
// add per-frame overrides for `dur` seconds. Optional per-clip flags:
//   loop      – repeat frames forever
//   next      – clip to play when a one-shot clip ends
//   look      – head may follow the look target (cursor) during this clip
//   wag       – tail wag strength multiplier on top of mood (0 = no wag)
//   blink     – random blinking allowed
//   breathe   – breathing rate in breaths per second (0 = none)
// Frame keys: dur, plus any state key (legs, head, eyes, mouth, ears, tail,
// dy, bodyDy, bodyDx, headDx, headDy) and `fx` (effect names to spawn).

const WALK_A = { f1: 'leg_fwd', f2: 'leg_back', b1: 'leg_back', b2: 'leg_fwd' };
const WALK_B = { f1: 'leg_straight', f2: 'leg_lift', b1: 'leg_lift', b2: 'leg_straight' };
const WALK_C = { f1: 'leg_back', f2: 'leg_fwd', b1: 'leg_fwd', b2: 'leg_back' };
const WALK_D = { f1: 'leg_lift', f2: 'leg_straight', b1: 'leg_straight', b2: 'leg_lift' };
const RUN_REACH = { f1: 'leg_fwd', f2: 'leg_fwd', b1: 'leg_back', b2: 'leg_back' };
const RUN_GATHER = { f1: 'leg_lift', f2: 'leg_back', b1: 'leg_fwd', b2: 'leg_lift' };
const RUN_PUSH = { f1: 'leg_back', f2: 'leg_back', b1: 'leg_fwd', b2: 'leg_fwd' };

export const CLIPS = {
  idle: {
    base: { pose: 'stand' },
    loop: true, look: true, wag: 1, blink: true, breathe: 0.8,
    frames: [{ dur: 1 }],
  },
  walk: {
    base: { pose: 'stand' },
    loop: true, look: true, wag: 1, blink: true, breathe: 0, speed: 26,
    frames: [
      { dur: 0.11, legs: WALK_A },
      { dur: 0.11, legs: WALK_B, dy: -1, headDy: 1 },
      { dur: 0.11, legs: WALK_C },
      { dur: 0.11, legs: WALK_D, dy: -1, headDy: 1 },
    ],
  },
  run: {
    base: { pose: 'stand', mouth: 'mouth_open', ears: 'ear_back' },
    loop: true, wag: 0, blink: false, breathe: 0, speed: 70,
    frames: [
      { dur: 0.07, legs: RUN_REACH, dy: -2, headDy: 1, tail: 'tail_mid' },
      { dur: 0.07, legs: RUN_PUSH, dy: -1, tail: 'tail_mid' },
      { dur: 0.07, legs: RUN_GATHER, dy: 0, headDy: -1, tail: 'tail_mid' },
      { dur: 0.07, legs: RUN_PUSH, dy: -1, tail: 'tail_mid' },
    ],
  },
  sit_down: {
    base: { pose: 'stand' },
    next: 'sit', wag: 0.5,
    frames: [
      { dur: 0.08, legs: { b1: 'leg_short', b2: 'leg_short' }, dy: 0, bodyDy: 1 },
      { dur: 0.08, pose: 'crouch', ears: 'ear_up', tail: 'tail_mid', headDy: -2 },
    ],
  },
  sit: {
    base: { pose: 'sit' },
    loop: true, look: true, wag: 0.6, blink: true, breathe: 0.7,
    frames: [{ dur: 1 }],
  },
  stand_up: {
    base: { pose: 'crouch', tail: 'tail_mid', ears: 'ear_up' },
    next: 'idle', wag: 0,
    frames: [{ dur: 0.08, headDy: -2 }, { dur: 0.08, pose: 'stand', bodyDy: 1 }],
  },
  lie_down: {
    base: { pose: 'crouch', ears: 'ear_up', tail: 'tail_mid' },
    next: 'lie',
    frames: [{ dur: 0.1 }, { dur: 0.1, pose: 'lie', bodyDy: -1 }],
  },
  lie: {
    base: { pose: 'lie' },
    loop: true, look: true, wag: 0.4, blink: true, breathe: 0.6,
    frames: [{ dur: 1 }],
  },
  get_up: {
    base: { pose: 'lie' },
    next: 'idle',
    frames: [{ dur: 0.1, pose: 'crouch', tail: 'tail_mid' }, { dur: 0.08, pose: 'stand', bodyDy: 1 }],
  },
  sleep: {
    base: { pose: 'sleep', eyes: 'eye_closed', ears: 'ear_back' },
    loop: true, wag: 0, blink: false, breathe: 0.35,
    frames: [
      { dur: 1.6, fx: ['zzz_small'] },
      { dur: 1.6, fx: ['zzz_big'] },
      { dur: 0.12, headDy: 1 },
      { dur: 0.12 },
      { dur: 1.2 },
    ],
  },
  happy: {
    base: { pose: 'stand', mouth: 'mouth_open', eyes: 'eye_happy' },
    loop: true, wag: 3, blink: false, breathe: 0,
    frames: [
      { dur: 0.09, bodyDx: -1, fx: ['heart'] },
      { dur: 0.09, bodyDx: 0, dy: -1 },
      { dur: 0.09, bodyDx: 1 },
      { dur: 0.09, bodyDx: 0, dy: -1 },
      { dur: 0.09, bodyDx: -1 },
      { dur: 0.09, bodyDx: 0, dy: -1 },
      { dur: 0.09, bodyDx: 1 },
      { dur: 0.09, bodyDx: 0, dy: -1 },
    ],
  },
  pet_lean: {
    base: { pose: 'stand', eyes: 'eye_happy', ears: 'ear_back', mouth: 'mouth_open' },
    loop: true, wag: 2.5, blink: false, breathe: 0.6,
    frames: [
      { dur: 0.5, headDx: -1, headDy: 1, fx: ['heart'] },
      { dur: 0.5, headDx: -1, headDy: 1, bodyDy: 1 },
    ],
  },
  scratch_kick: {
    base: { pose: 'stand', eyes: 'eye_closed', mouth: 'mouth_open', head: 'head_up' },
    loop: true, wag: 2, blink: false, breathe: 0,
    frames: [
      { dur: 0.06, legs: { b1: 'leg_lift' } },
      { dur: 0.06, legs: { b1: 'leg_fwd' }, dy: -1 },
    ],
  },
  shake: {
    base: { pose: 'stand', eyes: 'eye_closed' },
    next: 'idle', wag: 0, blink: false,
    frames: [
      { dur: 0.05, bodyDx: -1, headDx: 1, ears: 'ear_back', fx: ['drop'] },
      { dur: 0.05, bodyDx: 1, headDx: -1 },
      { dur: 0.05, bodyDx: -1, headDx: 1, ears: 'ear_back', fx: ['drop'] },
      { dur: 0.05, bodyDx: 1, headDx: -1 },
      { dur: 0.05, bodyDx: -1, headDx: 1, ears: 'ear_back', fx: ['drop'] },
      { dur: 0.05, bodyDx: 1, headDx: -1 },
      { dur: 0.05, bodyDx: -1, headDx: 1, ears: 'ear_back' },
      { dur: 0.05, bodyDx: 1, headDx: -1 },
      { dur: 0.15, eyes: 'eye_open' },
    ],
  },
  flinch: {
    base: { pose: 'crouch', ears: 'ear_back', eyes: 'eye_half' },
    next: 'idle', wag: 0, blink: false,
    frames: [{ dur: 0.08, bodyDx: -1, fx: ['sweat'] }, { dur: 0.6 }, { dur: 0.1, pose: 'stand', tail: 'tail_mid' }],
  },
  play_bow: {
    base: { pose: 'bow', mouth: 'mouth_open', eyes: 'eye_happy' },
    loop: true, wag: 3, blink: false,
    frames: [
      { dur: 0.25 },
      { dur: 0.12, dy: -1 },
      { dur: 0.25 },
      { dur: 0.12, dy: -1, fx: ['note'] },
    ],
  },
  yawn: {
    base: { pose: 'sit' },
    next: 'sit', wag: 0,
    frames: [
      { dur: 0.15, head: 'head_up' },
      { dur: 0.9, head: 'head_up', mouth: 'mouth_yawn', eyes: 'eye_closed', ears: 'ear_back' },
      { dur: 0.15, head: 'head_up', eyes: 'eye_half' },
      { dur: 0.3, eyes: 'eye_half' },
    ],
  },
  head_tilt: {
    base: { pose: 'sit', head: 'head_front' },
    next: 'sit', wag: 0.8, blink: true,
    frames: [{ dur: 0.2 }, { dur: 1.2, head: 'head_tilt', fx: ['question'] }, { dur: 0.2 }],
  },
  eat: {
    base: { pose: 'stand', head: 'head_down', eyes: 'eye_happy', headDy: 3, headDx: 1 },
    loop: true, wag: 2.5, blink: false,
    frames: [
      { dur: 0.14, mouth: 'mouth_chomp', headDy: 4 },
      { dur: 0.14 },
      { dur: 0.14, mouth: 'mouth_chomp', headDy: 4 },
      { dur: 0.3 },
    ],
  },
};

// Clips that must be passed through when changing base pose.
export const TRANSITIONS = {
  'stand>sit': 'sit_down',
  'sit>stand': 'stand_up',
  'stand>lie': 'lie_down',
  'lie>stand': 'get_up',
  'sit>lie': 'lie_down',
  'lie>sit': 'get_up',
  'stand>sleep': 'lie_down',
  'lie>sleep': null,
  'sleep>stand': 'get_up',
  'sleep>lie': null,
};

export function basePose(clipName) {
  const c = CLIPS[clipName];
  return c ? c.base.pose : 'stand';
}

// The pose a clip leaves the dog in (its own pose if it loops, else its `next`).
export function restingPose(clipName, depth = 0) {
  const c = CLIPS[clipName];
  if (!c) return 'stand';
  if (c.loop || !c.next || depth > 4) return c.base.pose;
  return restingPose(c.next, depth + 1);
}
