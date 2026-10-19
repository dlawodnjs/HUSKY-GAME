// Plays clips and layers secondary motion on top: breathing, blinking, ear
// twitches, mood-driven tail wag and head-follows-cursor. Pure logic: it
// outputs a rig state and the names of effects to spawn, nothing else.

import { CLIPS, TRANSITIONS, basePose, restingPose } from './clips.js';

const STATE_SKIP = new Set(['dur', 'fx']);
const LOOK_HOLD = 0.12; // seconds a new look direction must persist before the head turns

export class Animator {
  constructor({ random = Math.random } = {}) {
    this.random = random;
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
    this._lookHead = 'head_side';
    this._lookCandidate = 'head_side';
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
      const key = `${from}>${to}`;
      const direct = TRANSITIONS[key];
      if (direct) chain.push(direct);
      else if (direct === null) {
        // Allowed without an in-between clip (e.g. lying -> sleeping).
      } else {
        if (from !== 'stand' && TRANSITIONS[`${from}>stand`]) chain.push(TRANSITIONS[`${from}>stand`]);
        if (to !== 'stand' && TRANSITIONS[`stand>${to}`]) chain.push(TRANSITIONS[`stand>${to}`]);
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
    if (!this.look) return 'head_side';
    const { dx, dy } = this.look;
    const dist = Math.hypot(dx, dy);
    if (dist < 24 && Math.abs(dy) < 16) return 'head_front';
    if (dy < -16 && dy < -Math.abs(dx) * 0.5) return 'head_up';
    if (dy > 12 && dx > 0) return 'head_down';
    return 'head_side';
  }

  // The full rig state for this instant.
  state() {
    const clip = CLIPS[this.clip];
    const s = { ...clip.base };
    for (const [k, v] of Object.entries(this._frame())) if (!STATE_SKIP.has(k)) s[k] = v;
    if (clip.base.legs || this._frame().legs) s.legs = { ...(clip.base.legs ?? {}), ...(this._frame().legs ?? {}) };

    if (clip.blink && this._blinkLeft > 0 && (s.eyes ?? 'eye_open') === 'eye_open') s.eyes = 'eye_closed';
    if (this._earLeft > 0 && (s.ears ?? 'ear_up') === 'ear_up') s.ears = 'ear_back';

    if (clip.breathe) {
      const phase = (this.time * clip.breathe) % 1;
      if (phase < 0.4) s.bodyDy = (s.bodyDy ?? 0) - 1;
    }

    const tailFamily = !s.tail || s.tail === 'tail_up';
    const wag = (clip.wag ?? 0) * (0.25 + this.mood);
    if (tailFamily && wag > 0.05 && s.pose !== 'sit' && s.pose !== 'lie' && s.pose !== 'sleep') {
      s.tail = this._wagPhase < 0.5 ? 'tail_up' : 'tail_up_b';
    } else if (wag > 0.05 && (s.pose === 'sit' || s.pose === 'lie')) {
      // Tail lying on the floor sweeps by a pixel.
      s.tailDx = this._wagPhase < 0.5 ? 0 : -1;
    }

    if (clip.look && !s.head && this.look) {
      s.head = this._lookHead;
      if (s.head === 'head_side' && Math.abs(this.look.dy) > 6) s.headDy = (s.headDy ?? 0) + Math.sign(this.look.dy);
    }
    return s;
  }
}
