// Animation preview: the puppy in its room. Cursor = hand; the head follows it,
// clicking the dog pets it. Buttons play each clip; a gallery shows them all.

import { Surface, compileAll, blit, hex } from './engine/raster.js';
import { Screen } from './engine/screen.js';
import { startLoop } from './engine/loop.js';
import { Effects } from './engine/fx.js';
import { PALETTE } from './art/palette.js';
import { PUPPY } from './art/puppy.js';
import { FX } from './art/fx.js';
import { drawRoom, ROOM_W, ROOM_H, GROUND_Y } from './art/room.js';
import { CLIPS } from './anim/clips.js';
import { Animator } from './anim/animator.js';
import { drawDog, anchors, partAt } from './anim/rig.js';

export const CLIP_NAMES = {
  idle: '대기',
  walk: '걷기',
  run: '뛰기',
  sit: '앉기',
  lie: '엎드리기',
  sleep: '잠자기',
  happy: '기뻐하기',
  pet_lean: '쓰다듬기 반응',
  scratch_kick: '긁어 주기',
  play_bow: '놀자 자세',
  shake: '몸 털기',
  flinch: '움찔',
  yawn: '하품',
  head_tilt: '고개 갸웃',
  eat: '먹기',
};
const GROUPS = [
  ['기본', ['idle', 'walk', 'run']],
  ['자세', ['sit', 'lie', 'sleep']],
  ['교감', ['pet_lean', 'scratch_kick', 'happy', 'play_bow']],
  ['행동', ['yawn', 'head_tilt', 'shake', 'flinch', 'eat']],
];

const sprites = compileAll({ ...PUPPY, ...FX }, PALETTE);
const room = new Surface(ROOM_W, ROOM_H);
drawRoom(room);
const frame = new Surface(ROOM_W, ROOM_H);

const dog = {
  x: 220,
  facing: 1,
  anim: new Animator(),
  fx: new Effects(),
  returnTo: null,
  returnIn: 0,
  behindFor: 0,
};
dog.anim.mood = 0.55;

const ui = {
  speed: 1,
  mouse: null,
  pressing: false,
  over: false,
};

const canvas = document.getElementById('stage');
const screen = new Screen(canvas, ROOM_W, ROOM_H);
screen.zoom = 1.5;

function layoutScreen() {
  const box = document.getElementById('stage-box');
  screen.fit(box.clientWidth, Math.max(270, window.innerHeight - 260));
}
window.addEventListener('resize', layoutScreen);
layoutScreen();

// ---------------------------------------------------------------- controls
function play(name) {
  dog.returnTo = null;
  dog.anim.play(name, { restart: true });
  setActive(name);
}

function setActive(name) {
  for (const b of document.querySelectorAll('[data-clip]')) b.classList.toggle('on', b.dataset.clip === name);
}

const groups = document.getElementById('clips');
for (const [label, names] of GROUPS) {
  const g = document.createElement('div');
  g.className = 'group';
  g.innerHTML = `<span class="label">${label}</span>`;
  for (const n of names) {
    const b = document.createElement('button');
    b.textContent = CLIP_NAMES[n];
    b.dataset.clip = n;
    b.onclick = () => play(n);
    g.appendChild(b);
  }
  groups.appendChild(g);
}
setActive('idle');

document.getElementById('mood').oninput = (e) => (dog.anim.mood = Number(e.target.value) / 100);
for (const b of document.querySelectorAll('[data-speed]')) {
  b.onclick = () => {
    ui.speed = Number(b.dataset.speed);
    for (const o of document.querySelectorAll('[data-speed]')) o.classList.toggle('on', o === b);
  };
}
for (const b of document.querySelectorAll('[data-zoom]')) {
  b.onclick = () => {
    screen.zoom = Number(b.dataset.zoom);
    for (const o of document.querySelectorAll('[data-zoom]')) o.classList.toggle('on', o === b);
  };
}

canvas.addEventListener('pointermove', (e) => {
  ui.mouse = screen.toWorld(e.clientX, e.clientY);
  ui.over = true;
});
canvas.addEventListener('pointerleave', () => {
  ui.over = false;
  ui.mouse = null;
});
canvas.addEventListener('pointerdown', (e) => {
  ui.mouse = screen.toWorld(e.clientX, e.clientY);
  ui.pressing = true;
  const part = partAt(sprites, dog.x, GROUND_Y, dog.facing, dog.anim.state(), ui.mouse[0], ui.mouse[1]);
  if (!part) return;
  const resting = dog.anim.pose === 'sit' ? 'sit' : dog.anim.pose === 'lie' ? 'lie' : 'idle';
  const reaction = part === 'tail' ? 'flinch' : part === 'head' && dog.anim.clip === 'pet_lean' ? 'scratch_kick' : 'pet_lean';
  dog.anim.play(reaction, { restart: reaction !== dog.anim.clip });
  dog.returnTo = CLIPS[resting] ? resting : 'idle';
  dog.returnIn = 2.2;
  setActive(reaction);
});
window.addEventListener('pointerup', () => (ui.pressing = false));

// ---------------------------------------------------------------- simulation
function headPoint(st) {
  const a = anchors(sprites, dog.x, GROUND_Y, dog.facing, st);
  return [a.head[0], a.head[1] + 8];
}

function update(dt) {
  const clip = CLIPS[dog.anim.clip];
  if (clip.speed) {
    dog.x += clip.speed * dog.facing * dt;
    if (dog.x > ROOM_W - 40) dog.facing = -1;
    if (dog.x < 40) dog.facing = 1;
  }
  if (dog.returnTo) {
    dog.returnIn -= dt;
    if (dog.returnIn <= 0) {
      const back = dog.returnTo;
      dog.returnTo = null;
      dog.anim.play(back);
      setActive(back);
    }
  }
  // Head follows the hand; the dog turns around if the hand stays behind it.
  const st = dog.anim.state();
  if (ui.mouse && ui.over && clip.look) {
    const [hx, hy] = headPoint(st);
    const dx = (ui.mouse[0] - hx) * dog.facing;
    dog.anim.look = { dx, dy: ui.mouse[1] - hy };
    dog.behindFor = dx < -24 ? dog.behindFor + dt : 0;
    if (dog.behindFor > 0.45 && clip.loop && !clip.speed) {
      dog.facing *= -1;
      dog.behindFor = 0;
    }
  } else {
    dog.anim.look = null;
  }
  const spawned = dog.anim.update(dt);
  if (spawned.length) {
    const a = anchors(sprites, dog.x, GROUND_Y, dog.facing, dog.anim.state());
    for (const k of spawned) dog.fx.spawn(k, ...a[Effects.origin(k)], dog.facing);
  }
  dog.fx.update(dt);
  gallery.update(dt);
}

function render() {
  frame.copyFrom(room);
  // Soft contact shadow under the dog.
  frame.shadeRect(Math.round(dog.x) - 12, GROUND_Y, 25, 1, hex('#5a3b26'), 0.35);
  drawDog(frame, sprites, Math.round(dog.x), GROUND_Y, dog.facing, dog.anim.state());
  dog.fx.draw(frame, sprites);
  if (ui.over && ui.mouse) blit(frame, sprites[ui.pressing ? 'hand_press' : 'hand_open'], ui.mouse[0], ui.mouse[1]);
  screen.present(frame, [dog.x, GROUND_Y]);
  gallery.render();
}

// ---------------------------------------------------------------- gallery
const gallery = (() => {
  const cellW = 72;
  const cellH = 56;
  const names = Object.keys(CLIP_NAMES);
  const cols = 5;
  const rows = Math.ceil(names.length / cols);
  const surf = new Surface(cols * cellW, rows * cellH);
  const gCanvas = document.getElementById('gallery');
  const gScreen = new Screen(gCanvas, surf.w, surf.h);
  const cells = names.map((n) => {
    const a = new Animator();
    a.mood = 0.6;
    a.play(n);
    a.queue = [];
    a._start(n);
    return { name: n, anim: a, fx: new Effects() };
  });
  const bg = hex('#efe6d8');
  const floor = hex('#c49a74');
  const ink = hex('#7a6552');
  let visible = false;
  document.getElementById('toggle-gallery').onclick = (e) => {
    visible = !visible;
    document.getElementById('gallery-box').hidden = !visible;
    e.target.classList.toggle('on', visible);
    if (visible) {
      gScreen.fit(document.getElementById('gallery-box').clientWidth, 2000);
      document.getElementById('gallery-labels').innerHTML = cells
        .map((c, i) => `<span style="left:${((i % cols) * 100) / cols}%;top:${(Math.floor(i / cols) * 100) / rows}%;width:${100 / cols}%">${CLIP_NAMES[c.name]}</span>`)
        .join('');
    }
  };
  return {
    update(dt) {
      if (!visible) return;
      for (const c of cells) {
        const spawned = c.anim.update(dt);
        const i = cells.indexOf(c);
        const ox = (i % cols) * cellW + cellW / 2;
        const oy = Math.floor(i / cols) * cellH + cellH - 8;
        if (spawned.length) {
          const a = anchors(sprites, ox, oy, 1, c.anim.state());
          for (const k of spawned) c.fx.spawn(k, ...a[Effects.origin(k)], 1);
        }
        c.fx.update(dt);
      }
    },
    render() {
      if (!visible) return;
      surf.clear(bg);
      cells.forEach((c, i) => {
        const x0 = (i % cols) * cellW;
        const y0 = Math.floor(i / cols) * cellH;
        surf.fillRect(x0, y0 + cellH - 8, cellW, 8, floor);
        surf.fillRect(x0, y0, 1, cellH, ink);
        surf.fillRect(x0, y0, cellW, 1, ink);
      });
      cells.forEach((c, i) => {
        const ox = (i % cols) * cellW + cellW / 2;
        const oy = Math.floor(i / cols) * cellH + cellH - 8;
        drawDog(surf, sprites, ox, oy, 1, c.anim.state());
        c.fx.draw(surf, sprites);
      });
      gScreen.present(surf);
    },
  };
})();

startLoop({ update, render, getSpeed: () => ui.speed });
window.__preview = { dog, play, screen };
