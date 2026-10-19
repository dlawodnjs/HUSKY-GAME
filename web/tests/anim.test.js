import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileAll, Surface } from '../src/engine/raster.js';
import { PALETTE } from '../src/art/palette.js';
import { PUPPY } from '../src/art/puppy.js';
import { CLIPS, TRANSITIONS } from '../src/anim/clips.js';
import { Animator } from '../src/anim/animator.js';
import { POSES, HEADS, layout, drawDog, partAt } from '../src/anim/rig.js';

const sprites = compileAll(PUPPY, PALETTE);
const seeded = () => {
  let s = 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
};

test('every clip frame references existing poses and sprites', () => {
  for (const [name, clip] of Object.entries(CLIPS)) {
    assert.ok(clip.frames.length > 0, name);
    for (const f of clip.frames) {
      assert.ok(f.dur > 0, `${name} has a frame without duration`);
      const st = { ...clip.base, ...f };
      assert.ok(POSES[st.pose], `${name}: unknown pose ${st.pose}`);
      for (const op of layout(st)) assert.ok(sprites[op.sprite], `${name}: missing sprite ${op.sprite}`);
      for (const k of ['eyes', 'mouth', 'ears', 'tail', 'head']) if (st[k]) assert.ok(sprites[st[k]], `${name}: missing ${k} ${st[k]}`);
      if (st.head) assert.ok(HEADS[st.head], `${name}: head ${st.head} has no feature map`);
    }
    if (clip.next) assert.ok(CLIPS[clip.next], `${name}: next clip ${clip.next} missing`);
  }
  for (const t of Object.values(TRANSITIONS)) if (t) assert.ok(CLIPS[t], `transition ${t} missing`);
});

test('every clip renders in both directions without throwing', () => {
  for (const name of Object.keys(CLIPS)) {
    const a = new Animator({ random: seeded() });
    a.play(name);
    for (let i = 0; i < 90; i++) {
      a.update(1 / 30);
      const s = new Surface(80, 60);
      drawDog(s, sprites, 40, 50, 1, a.state());
      drawDog(s, sprites, 40, 50, -1, a.state());
    }
  }
});

test('changing pose inserts the transition clip', () => {
  const a = new Animator({ random: seeded() });
  a.play('sit');
  assert.equal(a.clip, 'sit_down');
  for (let i = 0; i < 60; i++) a.update(1 / 60);
  assert.equal(a.clip, 'sit');
  a.play('sleep');
  assert.equal(a.clip, 'stand_up', 'sit -> sleep goes through standing');
  for (let i = 0; i < 120; i++) a.update(1 / 60);
  assert.equal(a.clip, 'sleep');
});

test('one-shot clips hand over to their next clip', () => {
  const a = new Animator({ random: seeded() });
  a.play('shake');
  for (let i = 0; i < 120; i++) a.update(1 / 60);
  assert.equal(a.clip, 'idle');
});

test('blinking and ear twitches happen on their own', () => {
  const a = new Animator({ random: seeded() });
  let blinked = false;
  let twitched = false;
  for (let i = 0; i < 60 * 15; i++) {
    a.update(1 / 60);
    const st = a.state();
    if (st.eyes === 'eye_closed') blinked = true;
    if (st.ears === 'ear_back') twitched = true;
  }
  assert.ok(blinked && twitched);
});

test('tail wags faster when the dog is excited', () => {
  const changes = (mood) => {
    const a = new Animator({ random: seeded() });
    a.mood = mood;
    let last = null;
    let n = 0;
    for (let i = 0; i < 180; i++) {
      a.update(1 / 60);
      const t = a.state().tail;
      if (last && t !== last) n++;
      last = t;
    }
    return n;
  };
  assert.ok(changes(1) > changes(0) * 1.5);
});

test('the head follows a look target after a short hold', () => {
  const a = new Animator({ random: seeded() });
  a.look = { dx: 10, dy: -40 };
  a.update(1 / 60);
  assert.notEqual(a.state().head, 'head_up', 'does not snap on the first frame');
  for (let i = 0; i < 12; i++) a.update(1 / 60);
  assert.equal(a.state().head, 'head_up');
  a.look = { dx: 6, dy: 2 };
  for (let i = 0; i < 12; i++) a.update(1 / 60);
  assert.equal(a.state().head, 'head_front', 'a close hand gets a look straight at you');
});

test('parts can be picked under a point, mirrored when facing left', () => {
  const st = { pose: 'stand' };
  const ops = layout(st);
  const head = ops.find((o) => o.part === 'head');
  assert.equal(partAt(sprites, 100, 100, 1, st, 100 + head.x + 2, 100 + head.y - 6), 'head');
  assert.equal(partAt(sprites, 100, 100, -1, st, 100 - head.x - 2, 100 + head.y - 6), 'head');
  assert.equal(partAt(sprites, 100, 100, 1, st, 100, 100 - 12), 'torso');
  assert.equal(partAt(sprites, 100, 100, 1, st, 300, 100), null);
});
