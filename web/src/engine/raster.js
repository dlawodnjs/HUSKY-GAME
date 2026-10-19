// Pure-JS pixel raster. No DOM, so the same code renders in the browser
// (via ImageData) and in Node tools (via a PNG writer) and tests.
//
// Pixels are packed little-endian ABGR in a Uint32Array, which is exactly the
// byte order ImageData expects on every platform browsers run on.

export const TRANSPARENT = 0;

export function rgba(r, g, b, a = 255) {
  return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

export function hex(color) {
  const h = color.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return rgba((n >> 16) & 255, (n >> 8) & 255, n & 255, 255);
}

export class Surface {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Uint32Array(w * h);
  }

  clear(color = TRANSPARENT) {
    this.px.fill(color);
  }

  copyFrom(other) {
    this.px.set(other.px);
  }

  set(x, y, color) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = color;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return TRANSPARENT;
    return this.px[y * this.w + x];
  }

  fillRect(x, y, w, h, color) {
    const x0 = Math.max(0, x | 0);
    const y0 = Math.max(0, y | 0);
    const x1 = Math.min(this.w, (x + w) | 0);
    const y1 = Math.min(this.h, (y + h) | 0);
    for (let yy = y0; yy < y1; yy++) this.px.fill(color, yy * this.w + x0, yy * this.w + x1);
  }

  // Blends a translucent color over the rect (used for soft shadows / dimming).
  shadeRect(x, y, w, h, color, alpha) {
    for (let yy = Math.max(0, y); yy < Math.min(this.h, y + h); yy++) {
      for (let xx = Math.max(0, x); xx < Math.min(this.w, x + w); xx++) {
        const i = yy * this.w + xx;
        this.px[i] = mix(this.px[i], color, alpha);
      }
    }
  }
}

export function mix(under, over, alpha) {
  const ia = 1 - alpha;
  const r = (under & 255) * ia + (over & 255) * alpha;
  const g = ((under >>> 8) & 255) * ia + ((over >>> 8) & 255) * alpha;
  const b = ((under >>> 16) & 255) * ia + ((over >>> 16) & 255) * alpha;
  return rgba(r | 0, g | 0, b | 0, 255);
}

// A sprite is authored as rows of characters; each character is a palette key
// and '.' (or ' ') is transparent. `anchor` is the pixel that lands on the
// draw position, so parts can be attached by their joints.
export function compileSprite(name, def, palette) {
  const rows = def.rows;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const px = new Uint32Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (color === undefined) throw new Error(`sprite ${name}: unknown palette key '${ch}' at ${x},${y}`);
      px[y * w + x] = color;
    }
  }
  const flipped = new Uint32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) flipped[y * w + (w - 1 - x)] = px[y * w + x];
  const [ax, ay] = def.anchor ?? [0, 0];
  return { name, w, h, px, flipped, ax, ay };
}

export function compileAll(defs, palette) {
  const out = {};
  for (const [name, def] of Object.entries(defs)) out[name] = compileSprite(name, def, palette);
  return out;
}

// Draws `spr` so its anchor lands on (x, y). When flipped, the sprite is
// mirrored around its anchor column so joints stay attached.
export function blit(surface, spr, x, y, flip = false, tint = null) {
  const src = flip ? spr.flipped : spr.px;
  const ax = flip ? spr.w - 1 - spr.ax : spr.ax;
  const ox = Math.round(x) - ax;
  const oy = Math.round(y) - spr.ay;
  const { w, h } = spr;
  const sw = surface.w;
  const sh = surface.h;
  const dst = surface.px;
  for (let yy = 0; yy < h; yy++) {
    const dy = oy + yy;
    if (dy < 0 || dy >= sh) continue;
    const srow = yy * w;
    const drow = dy * sw;
    for (let xx = 0; xx < w; xx++) {
      const c = src[srow + xx];
      if (c === 0) continue;
      const dx = ox + xx;
      if (dx < 0 || dx >= sw) continue;
      dst[drow + dx] = tint === null ? c : mix(c, tint.color, tint.alpha);
    }
  }
}

// Returns true if the opaque pixel of `spr` drawn at (x, y) covers (px, py).
export function hitTest(spr, x, y, flip, px, py) {
  const ax = flip ? spr.w - 1 - spr.ax : spr.ax;
  const lx = Math.round(px) - (Math.round(x) - ax);
  const ly = Math.round(py) - (Math.round(y) - spr.ay);
  if (lx < 0 || ly < 0 || lx >= spr.w || ly >= spr.h) return false;
  return (flip ? spr.flipped : spr.px)[ly * spr.w + lx] !== 0;
}

export function toRGBABytes(surface) {
  const out = new Uint8ClampedArray(surface.w * surface.h * 4);
  new Uint32Array(out.buffer).set(surface.px);
  return out;
}
