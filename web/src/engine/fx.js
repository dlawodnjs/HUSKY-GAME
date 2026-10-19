// Floating effects (hearts, zzz, water drops...). Each kind has its own motion.
import { blit } from './raster.js';

const KINDS = {
  heart: { life: 1.3, vx: [-4, 4], vy: [-16, -12], gravity: 0, sway: 4, from: 'head' },
  note: { life: 1.3, vx: [2, 8], vy: [-16, -12], gravity: 0, sway: 3, from: 'head' },
  zzz_small: { life: 1.8, vx: [4, 7], vy: [-9, -7], gravity: 0, sway: 2, from: 'head' },
  zzz_big: { life: 1.8, vx: [4, 7], vy: [-9, -7], gravity: 0, sway: 2, from: 'head' },
  sweat: { life: 0.7, vx: [-10, -6], vy: [-14, -10], gravity: 60, sway: 0, from: 'head' },
  drop: { life: 0.5, vx: [-45, 45], vy: [-40, -20], gravity: 160, sway: 0, from: 'body' },
  question: { life: 1.2, vx: [0, 0], vy: [-3, -3], gravity: 0, sway: 0, from: 'head' },
  exclaim: { life: 0.9, vx: [0, 0], vy: [-3, -3], gravity: 0, sway: 0, from: 'head' },
  sparkle: { life: 0.6, vx: [-6, 6], vy: [-10, -4], gravity: 0, sway: 0, from: 'head' },
  dust: { life: 0.5, vx: [-14, -6], vy: [-6, -2], gravity: 0, sway: 0, from: 'feet' },
};

export class Effects {
  constructor(random = Math.random) {
    this.random = random;
    this.list = [];
  }

  spawn(kind, x, y, facing = 1) {
    const k = KINDS[kind];
    if (!k) return;
    const r = (a, b) => a + (b - a) * this.random();
    this.list.push({ kind, x, y, vx: r(...k.vx) * facing, vy: r(...k.vy), age: 0, life: k.life, seed: this.random() * 6.28 });
  }

  update(dt) {
    for (const p of this.list) {
      const k = KINDS[p.kind];
      p.age += dt;
      p.vy += k.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.list = this.list.filter((p) => p.age < p.life);
  }

  draw(surface, sprites) {
    for (const p of this.list) {
      const k = KINDS[p.kind];
      const spr = sprites[p.kind];
      if (!spr) continue;
      // Blink out during the last 20% of life instead of fading (pixel art has no alpha).
      if (p.age > p.life * 0.8 && Math.floor(p.age * 20) % 2) continue;
      const sway = k.sway ? Math.sin(p.age * 6 + p.seed) * k.sway : 0;
      blit(surface, spr, p.x + sway, p.y);
    }
  }

  static origin(kind) {
    return KINDS[kind]?.from ?? 'head';
  }
}
