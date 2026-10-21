// Animation clips. Every frame names a hand-drawn husky frame (src/art/husky)
// and how long it is held, so timing is part of the drawing like in classic
// pixel animation: quick in-betweens are short, key poses are held.
// Per-clip fields:
//   pose      – the pose the clip is played in (stand, sit, lie, sleep, bow);
//               changing pose inserts transition clips (TRANSITIONS)
//   loop      – repeat frames forever
//   next      – clip to play when a one-shot clip ends
//   look      – head may follow the look target (cursor) during this clip
//   wag       – tail wag strength multiplier on top of mood (0 = no wag)
//   blink     – random blinking and ear twitches allowed
//   breathe   – breathing rate in breaths per second (0 = none)
//   speed     – px/s the dog travels while playing
// Frame fields: f (frame name), dur (seconds), fx (effect names to spawn).

const T = 1 / 12; // one tick at 12 fps, the base timing unit

export const CLIPS = {
  idle: {
    pose: 'stand', loop: true, look: true, wag: 1, blink: true, breathe: 0.8,
    frames: [{ f: 'stand', dur: 1 }],
  },
  walk: {
    pose: 'stand', loop: true, look: true, wag: 1, blink: true, speed: 26,
    frames: ['walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6'].map((f) => ({ f, dur: 0.9 * T })),
  },
  run: {
    pose: 'stand', loop: true, speed: 70,
    frames: [
      { f: 'run1', dur: 0.6 * T },
      { f: 'run2', dur: 0.6 * T },
      { f: 'run3', dur: 0.5 * T },
      { f: 'run4', dur: 0.6 * T },
      { f: 'run5', dur: 0.6 * T },
      { f: 'run6', dur: 0.5 * T },
    ],
  },
  sit_down: {
    pose: 'stand', next: 'sit', wag: 0.5,
    frames: [{ f: 'crouch', dur: T }, { f: 'sit_down1', dur: T }],
  },
  sit: {
    pose: 'sit', loop: true, look: true, wag: 0.6, blink: true, breathe: 0.7,
    frames: [{ f: 'sit', dur: 1 }],
  },
  stand_up: {
    pose: 'sit', next: 'idle',
    frames: [{ f: 'sit_down1', dur: T }, { f: 'crouch', dur: T }],
  },
  lie_down: {
    pose: 'stand', next: 'lie',
    frames: [{ f: 'crouch', dur: 1.2 * T }, { f: 'lie_down1', dur: 1.2 * T }],
  },
  lie: {
    pose: 'lie', loop: true, look: true, wag: 0.4, blink: true, breathe: 0.6,
    frames: [{ f: 'lie', dur: 1 }],
  },
  get_up: {
    pose: 'lie', next: 'idle',
    frames: [{ f: 'lie_down1', dur: 1.2 * T }, { f: 'crouch', dur: T }],
  },
  curl_up: {
    pose: 'lie', next: 'sleep',
    frames: [{ f: 'curl1', dur: 2 * T }, { f: 'curl2', dur: 2 * T }],
  },
  wake: {
    pose: 'sleep', next: 'lie',
    frames: [{ f: 'curl2', dur: 1.5 * T }, { f: 'curl1', dur: 1.5 * T }],
  },
  sleep: {
    pose: 'sleep', loop: true, breathe: 0.35,
    frames: [
      { f: 'sleep', dur: 1.6, fx: ['zzz_small'] },
      { f: 'sleep', dur: 1.6, fx: ['zzz_big'] },
      { f: 'sleep_flick', dur: 1.5 * T },
      { f: 'sleep', dur: 1.5 * T },
      { f: 'sleep_flick', dur: T },
      { f: 'sleep', dur: 1.2 },
    ],
  },
  happy: {
    pose: 'stand', loop: true, wag: 3,
    frames: [
      { f: 'happy1', dur: 1.2 * T, fx: ['heart'] },
      { f: 'happy2', dur: 0.8 * T },
      { f: 'happy3', dur: 1.2 * T },
      { f: 'happy4', dur: T },
    ],
  },
  pet_lean: {
    pose: 'stand', loop: true, wag: 2.5,
    frames: [
      { f: 'pet1', dur: 6 * T, fx: ['heart'] },
      { f: 'pet2', dur: 6 * T },
    ],
  },
  scratch_kick: {
    pose: 'stand', loop: true, wag: 2,
    frames: [
      { f: 'scratch1', dur: 0.7 * T },
      { f: 'scratch2', dur: 0.7 * T },
      { f: 'scratch3', dur: 0.7 * T },
      { f: 'scratch2', dur: 0.7 * T },
    ],
  },
  shake: {
    pose: 'stand', next: 'idle',
    frames: [
      { f: 'shake1', dur: 0.7 * T, fx: ['drop'] },
      { f: 'shake2', dur: 0.6 * T },
      { f: 'shake3', dur: 0.7 * T, fx: ['drop'] },
      { f: 'shake4', dur: 0.6 * T },
      { f: 'shake1', dur: 0.7 * T, fx: ['drop'] },
      { f: 'shake2', dur: 0.6 * T },
      { f: 'shake3', dur: 0.7 * T },
      { f: 'shake4', dur: 0.6 * T },
      { f: 'shake_end', dur: 2 * T },
    ],
  },
  flinch: {
    pose: 'stand', next: 'idle',
    frames: [
      { f: 'flinch1', dur: T, fx: ['sweat'] },
      { f: 'flinch2', dur: 7 * T },
      { f: 'crouch', dur: 1.2 * T },
    ],
  },
  play_bow: {
    pose: 'bow', loop: true, wag: 3,
    frames: [
      { f: 'bow', dur: 3 * T },
      { f: 'bow2', dur: 1.5 * T },
      { f: 'bow', dur: 3 * T },
      { f: 'bow2', dur: 1.5 * T, fx: ['note'] },
    ],
  },
  yawn: {
    pose: 'sit', next: 'sit',
    frames: [
      { f: 'yawn1', dur: 2 * T },
      { f: 'yawn2', dur: 11 * T },
      { f: 'yawn3', dur: 2 * T },
      { f: 'sit_half', dur: 4 * T },
    ],
  },
  head_tilt: {
    pose: 'sit', next: 'sit', wag: 0.8,
    frames: [
      { f: 'tilt0', dur: 2.5 * T },
      { f: 'tilt1', dur: 14 * T, fx: ['question'] },
      { f: 'tilt0', dur: 2.5 * T },
    ],
  },
  eat: {
    pose: 'stand', loop: true, wag: 2.5,
    frames: [
      { f: 'eat1', dur: 1.7 * T },
      { f: 'eat2', dur: 1.7 * T },
      { f: 'eat1', dur: 1.7 * T },
      { f: 'eat3', dur: 3.6 * T },
    ],
  },
};

// Clips (one or a chain) that must be passed through when changing pose.
export const TRANSITIONS = {
  'stand>sit': ['sit_down'],
  'sit>stand': ['stand_up'],
  'stand>lie': ['lie_down'],
  'lie>stand': ['get_up'],
  'sit>lie': ['lie_down'],
  'lie>sit': ['get_up'],
  'stand>sleep': ['lie_down', 'curl_up'],
  'lie>sleep': ['curl_up'],
  'sleep>stand': ['wake', 'get_up'],
  'sleep>lie': ['wake'],
};

export function basePose(clipName) {
  return CLIPS[clipName]?.pose ?? 'stand';
}

// The pose a clip leaves the dog in (its own pose if it loops, else its `next`).
export function restingPose(clipName, depth = 0) {
  const c = CLIPS[clipName];
  if (!c) return 'stand';
  if (c.loop || !c.next || depth > 4) return c.pose;
  return restingPose(c.next, depth + 1);
}
