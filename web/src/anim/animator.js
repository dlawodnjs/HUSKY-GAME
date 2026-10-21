// Plays clips and layers small hand-drawn overlays on top: breathing, blinking,
// ear twitches, mood-driven tail wag and head-follows-cursor. Pure logic: it
// outputs which frame to show, which overlay stamps to paste on it, and the
// names of effects to spawn.

import { CLIPS, TRANSITIONS, basePose, restingPose } from './clips.js';
import { HUSKY } from '../art/husky/frames.js';

const LOOK_HOLD = 0.12; // seconds a new look direction must persist before the head turns

export class Animator {
  constructor({ random = Math.random, lib = HUSKY } = {}) {
    this.random = random;
    this.lib = lib;
    this.mood = 0.5; // 0 calm .. 1 excited; scales tail wag
    this.look = null; // {dx, dy} from the head to the look target, in dog-local px (+dx = in front)
    this.clip = 'idle';
    this.frame = 0;
    this.t = 0;
    this.queue = [];
    this.time = 0;
    this._blinkIn = 2 + random() * 3;
    this._blinkLeft = 0;
    this._earIn = 4 + random() * 5;
    this._earLeft = 0;
    this._wagPhase = 0;
    this._lookHead = 'side';
    this._lookCandidate = 'side';
    this._lookHeld = 0;
  }

  get pose() {
    return restingPose(this.clip);
  }

  // Plays `name`, inserting transition clips (stand -> sit, ...) as needed.
  play(name, { restart = false } = {}) {
    if (!CLIPS[name]) throw new Error(`unknown clip ${name}`);
    if (name === this.clip && !restart && CLIPS[name].loop) return;
    const from = this.pose;
    const to = basePose(name);
    const chain = [];
    if (from !== to) {
      const direct = TRANSITIONS[`${from}>${to}`];
      if (direct) chain.push(...direct);
      else {
        if (from !== 'stand') chain.push(...(TRANSITIONS[`${from}>stand`] ?? []));
        if (to !== 'stand') chain.push(...(TRANSITIONS[`stand>${to}`] ?? []));
      }
    }
    chain.push(name);
    this.queue = chain.slice(1);
    this._start(chain[0]);
  }

  _start(name) {
    this.clip = name;
    this.frame = 0;
    this.t = 0;
    this._entered = true;
  }

  // Advances time; returns the effect names entered this tick.
  update(dt) {
    const fx = [];
    this.time += dt;
    if (this._entered) {
      this._entered = false;
      fx.push(...(this._frame().fx ?? []));
    }
    this.t += dt;
    let guard = 0;
    while (this.t >= this._frame().dur && guard++ < 64) {
      this.t -= this._frame().dur;
      const clip = CLIPS[this.clip];
      if (this.frame + 1 < clip.frames.length) {
        this.frame++;
      } else if (clip.loop) {
        this.frame = 0;
      } else {
        const next = this.queue.length ? this.queue.shift() : clip.next ?? this.clip;
        if (next === this.clip && !clip.loop) {
          this.frame = clip.frames.length - 1;
          this.t = 0;
          break;
        }
        this._start(next);
        this._entered = false;
      }
      fx.push(...(this._frame().fx ?? []));
    }
    this._secondary(dt);
    return fx;
  }

  _frame() {
    return CLIPS[this.clip].frames[this.frame];
  }

  _secondary(dt) {
    const clip = CLIPS[this.clip];
    this._blinkLeft -= dt;
    this._blinkIn -= dt;
    if (this._blinkIn <= 0) {
      this._blinkLeft = 0.12;
      // Occasionally a double blink.
      this._blinkIn = this.random() < 0.2 ? 0.25 : 2 + this.random() * 3.5;
    }
    this._earLeft -= dt;
    this._earIn -= dt;
    if (this._earIn <= 0) {
      this._earLeft = 0.16;
      this._earIn = 4 + this.random() * 6;
    }
    const strength = (clip.wag ?? 0) * (0.25 + this.mood);
    const period = 0.9 - Math.min(1, strength / 2) * 0.78;
    this._wagPhase = (this._wagPhase + dt / period) % 1;

    const want = this._lookTarget();
    if (want !== this._lookCandidate) {
      this._lookCandidate = want;
      this._lookHeld = 0;
    } else {
      this._lookHeld += dt;
      if (this._lookHeld >= LOOK_HOLD) this._lookHead = want;
    }
  }

  _lookTarget() {
    if (!this.look) return 'side';
    const { dx, dy } = this.look;
    const dist = Math.hypot(dx, dy);
    if (dist < 24 && Math.abs(dy) < 16) return 'front';
    if (dy < -16 && dy < -Math.abs(dx) * 0.5) return 'up';
    if (dy > 12 && dx > 0) return 'down';
    return 'side';
  }

  // What to draw this instant: a frame name plus overlay stamps, in paint order.
  state() {
    const clip = CLIPS[this.clip];
    const frame = this._frame().f;
    const sets = this.lib.frames[frame]?.sets ?? {};
    const has = (name) => Boolean(this.lib.stamps[name]);
    const overlays = [];

    // Tail wag: rest, swing one way, rest, swing the other way.
    const wag = (clip.wag ?? 0) * (0.25 + this.mood);
    if (sets.tail && wag > 0.05) {
      const step = Math.floor(this._wagPhase * 4);
      const name = step === 1 ? `wag_${sets.tail}_1` : step === 3 ? `wag_${sets.tail}_2` : null;
      if (name && has(name)) overlays.push(name);
    }
    // Breathing in for 40% of each breath.
    if (clip.breathe && sets.breathe && (this.time * clip.breathe) % 1 < 0.4 && has(`breathe_${sets.breathe}`)) {
      overlays.push(`breathe_${sets.breathe}`);
    }
    let look = 'side';
    if (clip.look && this.look && sets.look && this._lookHead !== 'side' && has(`look_${this._lookHead}_${sets.look}`)) {
      look = this._lookHead;
      overlays.push(`look_${look}_${sets.look}`);
    }
    if (clip.blink && this._blinkLeft > 0) {
      const name = look === 'side' ? sets.eyes && `blink_${sets.eyes}` : `blink_${look}`;
      if (name && has(name)) overlays.push(name);
    }
    if (clip.blink && this._earLeft > 0 && look === 'side' && sets.ears && has(`twitch_${sets.ears}`)) {
      overlays.push(`twitch_${sets.ears}`);
    }
    return { frame, overlays };
  }
}
