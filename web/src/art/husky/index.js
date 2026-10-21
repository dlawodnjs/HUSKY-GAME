// Hand-drawn husky frames. Every frame is one whole-body picture on a fixed
// FRAME_W x FRAME_H canvas whose anchor (the floor under the dog) is ANCHOR.
//
// Frames are written as text, one character per pixel, in a tiny format that
// mirrors how pixel animators work: draw a key frame, then copy it and redraw
// only what moves.
//
//   frame NAME                 a whole new frame; the grid follows
//   frame NAME from BASE       start from a copy of BASE (pixels, points, parts)
//   point NAME x,y             a named spot (eye, head, tail...) used by stamps and effects
//   part NAME x,y,w,h          a touchable region (head, tail, leg, body)
//   set KEY=VALUE ...          which overlay stamps fit this frame (eyes=side ...)
//   move x,y,w,h dx,dy         nudge a rectangle of pixels (points inside move with it)
//   patch x,y                  redraw a rectangle; the grid follows
//   paste STAMP [x,y]          paste a stamp at its point (or at x,y)
//   stamp NAME @POINT dx,dy    a small reusable drawing placed relative to a frame point
//
// Grid characters: palette keys paint, '.' is transparent (erases in a patch)
// and '~' keeps whatever is underneath.

import { compileSprite } from '../../engine/raster.js';

export const FRAME_W = 72;
export const FRAME_H = 60;
export const ANCHOR = [36, 59];

const GRID_LINE = /^[.~A-Za-z]+$/;
const KEEP = '~';

// Parses one or more sources into { frames, stamps } of character grids.
export function parseHusky(...sources) {
  const frames = {};
  const stamps = {};
  let cur = null; // the frame or stamp receiving grid lines
  let grid = null; // { x, y, rows, target: 'frame' | 'patch' | 'stamp' }

  const flush = () => {
    if (!grid) return;
    const { rows } = grid;
    // A new frame's point/part/set lines come before its grid.
    if (grid.target === 'frame' && !rows.length) return;
    if (grid.target === 'frame') {
      if (rows.length !== FRAME_H || rows.some((r) => r.length !== FRAME_W)) {
        throw new Error(`frame ${cur.name}: grid must be ${FRAME_W}x${FRAME_H}, got ${rows[0]?.length}x${rows.length}`);
      }
      cur.px = rows.map((r) => r.split(''));
    } else if (grid.target === 'patch') {
      paint(cur, rows, grid.x, grid.y, `frame ${cur.name} patch ${grid.x},${grid.y}`);
    } else {
      const w = rows[0].length;
      if (rows.some((r) => r.length !== w)) throw new Error(`stamp ${cur.name}: rows of different widths`);
      cur.rows = rows;
    }
    grid = null;
  };

  for (const src of sources) {
    const lines = src.split('\n').map((l) => l.trim());
    for (const [i, line] of lines.entries()) {
      if (!line || line.startsWith('#')) {
        flush();
        continue;
      }
      if (grid && GRID_LINE.test(line)) {
        grid.rows.push(line);
        continue;
      }
      flush();
      const [cmd, ...args] = line.split(/\s+/);
      const where = `line ${i + 1} "${line}"`;
      switch (cmd) {
        case 'frame': {
          const [name, kw, base] = args;
          if (frames[name]) throw new Error(`frame ${name} defined twice`);
          if (kw === 'from') {
            const b = frames[base];
            if (!b) throw new Error(`frame ${name}: unknown base ${base}`);
            cur = {
              name,
              base,
              px: b.px.map((r) => r.slice()),
              points: structuredClone(b.points),
              parts: structuredClone(b.parts),
              sets: { ...b.sets },
            };
          } else {
            cur = { name, px: null, points: {}, parts: [], sets: {} };
            grid = { target: 'frame', rows: [] };
          }
          frames[name] = cur;
          break;
        }
        case 'point': {
          need(cur?.points, where);
          cur.points[args[0]] = nums(args[1], 2, where);
          break;
        }
        case 'part': {
          need(cur?.parts, where);
          // The first `part` of a name in a derived frame replaces the inherited ones.
          const rect = nums(args[1], 4, where);
          cur.redefined ??= new Set();
          if (!cur.redefined.has(args[0])) cur.parts = cur.parts.filter((p) => p.name !== args[0]);
          cur.redefined.add(args[0]);
          cur.parts.push({ name: args[0], rect });
          break;
        }
        case 'set': {
          need(cur?.sets, where);
          for (const kv of args) {
            const [k, v] = kv.split('=');
            if (v === 'none') delete cur.sets[k];
            else cur.sets[k] = v;
          }
          break;
        }
        case 'move': {
          need(cur?.px, where);
          move(cur, nums(args[0], 4, where), nums(args[1], 2, where));
          break;
        }
        case 'patch': {
          need(cur?.px, where);
          const [x, y] = nums(args[0], 2, where);
          grid = { target: 'patch', x, y, rows: [] };
          break;
        }
        case 'paste': {
          need(cur?.px, where);
          const st = stamps[args[0]];
          if (!st) throw new Error(`${where}: unknown stamp ${args[0]}`);
          const [x, y] = args[1] ? nums(args[1], 2, where) : stampOrigin(st, cur);
          paint(cur, st.rows, x, y, where);
          break;
        }
        case 'stamp': {
          const [name, at, off = '0,0'] = args;
          if (!at?.startsWith('@')) throw new Error(`${where}: stamp needs @point`);
          cur = { name, point: at.slice(1), offset: nums(off, 2, where), rows: null };
          stamps[name] = cur;
          grid = { target: 'stamp', rows: [] };
          break;
        }
        default:
          throw new Error(`${where}: unknown command ${cmd}`);
      }
    }
    flush();
  }
  for (const f of Object.values(frames)) if (!f.px) throw new Error(`frame ${f.name} has no grid`);
  return { frames, stamps };
}

function need(v, where) {
  if (!v) throw new Error(`${where}: no frame to apply this to`);
}

function nums(s, n, where) {
  const v = (s ?? '').split(',').map(Number);
  if (v.length !== n || v.some((x) => !Number.isInteger(x))) throw new Error(`${where}: expected ${n} integers`);
  return v;
}

function paint(frame, rows, x0, y0, where) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === KEEP) continue;
      const fx = x0 + x;
      const fy = y0 + y;
      if (fx < 0 || fy < 0 || fx >= FRAME_W || fy >= FRAME_H) {
        if (ch === '.') continue;
        throw new Error(`${where}: pixel ${fx},${fy} outside the frame`);
      }
      frame.px[fy][fx] = ch;
    }
  });
}

function move(frame, [x, y, w, h], [dx, dy]) {
  const copy = [];
  for (let yy = 0; yy < h; yy++) {
    copy.push(frame.px[y + yy].slice(x, x + w));
    for (let xx = 0; xx < w; xx++) frame.px[y + yy][x + xx] = '.';
  }
  copy.forEach((row, yy) => {
    row.forEach((ch, xx) => {
      const fx = x + xx + dx;
      const fy = y + yy + dy;
      if (ch !== '.' && fx >= 0 && fy >= 0 && fx < FRAME_W && fy < FRAME_H) frame.px[fy][fx] = ch;
    });
  });
  const inside = (px, py) => px >= x && py >= y && px < x + w && py < y + h;
  for (const p of Object.values(frame.points)) {
    if (inside(p[0], p[1])) {
      p[0] += dx;
      p[1] += dy;
    }
  }
  for (const p of frame.parts) {
    const [rx, ry, rw, rh] = p.rect;
    if (inside(rx, ry) && inside(rx + rw - 1, ry + rh - 1)) p.rect = [rx + dx, ry + dy, rw, rh];
  }
}

export function stampOrigin(stamp, frame) {
  const p = frame.points[stamp.point];
  if (!p) throw new Error(`stamp ${stamp.name} needs point ${stamp.point} on frame ${frame.name}`);
  return [p[0] + stamp.offset[0], p[1] + stamp.offset[1]];
}

// Compiles parsed frames into sprites (with flipped copies) for raster.blit.
export function compileHusky(parsed, palette) {
  const frames = {};
  for (const f of Object.values(parsed.frames)) {
    const rows = f.px.map((r) => r.join(''));
    frames[f.name] = {
      ...compileSprite(f.name, { anchor: ANCHOR, rows }, palette),
      points: f.points,
      parts: f.parts,
      sets: f.sets,
      grid: f.px,
    };
  }
  return { frames, stamps: parsed.stamps, palette };
}

// A frame with overlay stamps pasted on (blink, ear twitch, look...), cached.
export function composeFrame(lib, name, overlays = []) {
  const base = lib.frames[name];
  if (!base) throw new Error(`unknown husky frame ${name}`);
  if (!overlays.length) return base;
  lib.cache ??= new Map();
  const key = `${name}|${overlays.join(',')}`;
  let spr = lib.cache.get(key);
  if (spr) return spr;
  const tmp = { name: key, px: base.grid.map((r) => r.slice()), points: base.points };
  for (const o of overlays) {
    const st = lib.stamps[o];
    if (!st) throw new Error(`unknown husky stamp ${o}`);
    const [x, y] = stampOrigin(st, base);
    paint(tmp, st.rows, x, y, `${key}`);
  }
  spr = { ...compileSprite(key, { anchor: ANCHOR, rows: tmp.px.map((r) => r.join('')) }, lib.palette), points: base.points, parts: base.parts, sets: base.sets };
  lib.cache.set(key, spr);
  return spr;
}
