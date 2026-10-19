// The living room, drawn procedurally into a 480x270 surface once and cached.
import { hex } from '../engine/raster.js';

export const ROOM_W = 480;
export const ROOM_H = 270;
export const WALL_BOTTOM = 196;
export const GROUND_Y = 242; // where the dog's feet rest
export const BED = { x: 78, y: 238 }; // centre of the cushion

const C = Object.fromEntries(
  Object.entries({
    outline: '#4a3527',
    wall: '#ecdfcb',
    wallStripe: '#e4d5bf',
    wallShade: '#dccab0',
    baseTop: '#d6b089',
    base: '#b98f6a',
    baseDark: '#7f5c41',
    floorA: '#c99668',
    floorB: '#c28e61',
    floorSeam: '#9f714c',
    floorShade: '#a97850',
    frame: '#f8f1e7',
    frameShade: '#d9cbb8',
    sky1: '#d3ecf8',
    sky2: '#bde2f5',
    sky3: '#a5d6f0',
    cloud: '#ffffff',
    hill: '#8fc28a',
    hillDark: '#6fa46e',
    curtain: '#e8917f',
    curtainShade: '#cc7464',
    curtainLight: '#f3b2a2',
    rod: '#7a5a40',
    picFrame: '#8b6a50',
    picMat: '#f4ebdb',
    mountain: '#9fb3c6',
    mountainDark: '#7c93aa',
    snow: '#ffffff',
    picSky: '#dcedf6',
    shelf: '#a8825f',
    shelfDark: '#7f5f43',
    pot: '#c8744f',
    potDark: '#9e5639',
    leaf: '#6ea86b',
    leafDark: '#4f8250',
    bedOuter: '#d9786a',
    bedOuterDark: '#b45d51',
    bedInner: '#f4c6af',
    bedInnerDark: '#e3a990',
    rug: '#8fb2be',
    rugBorder: '#6f939f',
    rugPattern: '#b3ced6',
    bowl: '#6aa6d9',
    bowlDark: '#4c84b7',
    kibble: '#b07a45',
    shadow: '#000000',
  }).map(([k, v]) => [k, hex(v)]),
);

function fillEllipse(s, cx, cy, rx, ry, color, clip = null) {
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))) + 0.5);
    let x0 = cx - half;
    let x1 = cx + half + 1;
    const yy = cy + y;
    if (clip) {
      if (yy < clip.y || yy >= clip.y + clip.h) continue;
      x0 = Math.max(x0, clip.x);
      x1 = Math.min(x1, clip.x + clip.w);
    }
    if (x1 > x0) s.fillRect(x0, yy, x1 - x0, 1, color);
  }
}

function outlineEllipse(s, cx, cy, rx, ry, fill, line) {
  fillEllipse(s, cx, cy, rx + 1, ry + 1, line);
  fillEllipse(s, cx, cy, rx, ry, fill);
}

function rect(s, x, y, w, h, fill, line) {
  s.fillRect(x, y, w, h, line);
  s.fillRect(x + 1, y + 1, w - 2, h - 2, fill);
}

export function drawRoom(s) {
  // Wall with soft stripes and a darker band under the ceiling.
  s.fillRect(0, 0, ROOM_W, WALL_BOTTOM, C.wall);
  for (let x = 8; x < ROOM_W; x += 20) s.fillRect(x, 0, 3, WALL_BOTTOM, C.wallStripe);
  s.fillRect(0, 0, ROOM_W, 6, C.wallShade);
  s.fillRect(0, 6, ROOM_W, 1, C.wallStripe);

  // Floor planks with staggered joints and a shadow where it meets the wall.
  for (let y = WALL_BOTTOM, row = 0; y < ROOM_H; y += 10, row++) {
    s.fillRect(0, y, ROOM_W, 10, row % 2 ? C.floorA : C.floorB);
    s.fillRect(0, y, ROOM_W, 1, C.floorSeam);
    for (let x = (row * 37) % 70; x < ROOM_W; x += 70) s.fillRect(x, y, 1, 10, C.floorSeam);
  }
  s.fillRect(0, WALL_BOTTOM, ROOM_W, 3, C.floorShade);

  // Baseboard.
  s.fillRect(0, WALL_BOTTOM - 9, ROOM_W, 9, C.base);
  s.fillRect(0, WALL_BOTTOM - 9, ROOM_W, 2, C.baseTop);
  s.fillRect(0, WALL_BOTTOM - 1, ROOM_W, 1, C.baseDark);

  drawWindow(s, 296, 38);
  drawPicture(s, 92, 58);
  drawShelf(s, 172, 96);
  drawRug(s);
  drawBed(s, BED.x, BED.y);
  drawBowl(s, 418, 246);
}

function drawWindow(s, x, y) {
  const w = 80;
  const h = 84;
  rect(s, x, y, w, h, C.frame, C.outline);
  const ix = x + 5;
  const iy = y + 5;
  const iw = w - 10;
  const ih = h - 10;
  s.fillRect(ix - 1, iy - 1, iw + 2, ih + 2, C.outline);
  const bands = [C.sky1, C.sky2, C.sky3];
  for (let i = 0; i < ih; i++) s.fillRect(ix, iy + i, iw, 1, bands[Math.min(2, Math.floor((i / ih) * 3))]);
  // Distant hill and clouds.
  const pane = { x: ix, y: iy, w: iw, h: ih };
  fillEllipse(s, ix + 18, iy + ih + 6, 30, 14, C.hillDark, pane);
  fillEllipse(s, ix + 52, iy + ih + 8, 34, 16, C.hill, pane);
  fillEllipse(s, ix + 18, iy + 16, 8, 3, C.cloud);
  fillEllipse(s, ix + 25, iy + 13, 6, 4, C.cloud);
  fillEllipse(s, ix + 50, iy + 28, 7, 2, C.cloud);
  // Cross bars.
  s.fillRect(ix + Math.floor(iw / 2) - 1, iy, 3, ih, C.frame);
  s.fillRect(ix, iy + Math.floor(ih / 2) - 1, iw, 3, C.frame);
  s.fillRect(ix + Math.floor(iw / 2) + 1, iy, 1, ih, C.frameShade);
  s.fillRect(ix, iy + Math.floor(ih / 2) + 1, iw, 1, C.frameShade);
  // Sill.
  rect(s, x - 6, y + h - 1, w + 12, 6, C.frame, C.outline);
  s.fillRect(x - 5, y + h + 4, w + 10, 1, C.frameShade);
  // Curtains and rod.
  s.fillRect(x - 16, y - 7, w + 32, 3, C.rod);
  drawCurtain(s, x - 14, y - 4, 16, h + 14, 1);
  drawCurtain(s, x + w - 2, y - 4, 16, h + 14, -1);
}

function drawCurtain(s, x, y, w, h, side) {
  s.fillRect(x - 1, y, w + 2, h + 1, C.outline);
  s.fillRect(x, y, w, h, C.curtain);
  for (let i = 3; i < w; i += 5) s.fillRect(x + i, y, 1, h, C.curtainShade);
  s.fillRect(side > 0 ? x + 1 : x + w - 2, y, 1, h, C.curtainLight);
  // Tie-back.
  s.fillRect(x - 1, y + Math.floor(h * 0.62), w + 2, 3, C.rod);
}

function drawPicture(s, x, y) {
  rect(s, x, y, 56, 42, C.picFrame, C.outline);
  s.fillRect(x + 4, y + 4, 48, 34, C.picMat);
  const px = x + 8;
  const py = y + 8;
  s.fillRect(px, py, 40, 26, C.picSky);
  // Snowy mountains — a nod to where huskies come from.
  for (let i = 0; i < 18; i++) s.fillRect(px + 2 + i, py + 25 - i, 36 - 2 * i - 2, 1, i > 12 ? C.snow : C.mountainDark);
  for (let i = 0; i < 12; i++) s.fillRect(px + 20 + i, py + 25 - i, 20 - 2 * i, 1, i > 8 ? C.snow : C.mountain);
}

function drawShelf(s, x, y) {
  s.fillRect(x, y, 70, 5, C.shelf);
  s.fillRect(x, y + 4, 70, 1, C.shelfDark);
  s.fillRect(x + 6, y + 5, 3, 6, C.shelfDark);
  s.fillRect(x + 61, y + 5, 3, 6, C.shelfDark);
  // Plant.
  rect(s, x + 10, y - 13, 14, 13, C.pot, C.outline);
  s.fillRect(x + 11, y - 12, 12, 2, C.potDark);
  fillEllipse(s, x + 13, y - 19, 5, 6, C.leafDark);
  fillEllipse(s, x + 21, y - 21, 5, 7, C.leaf);
  fillEllipse(s, x + 17, y - 26, 4, 5, C.leaf);
  // Books.
  const books = [C.curtain, C.bowl, C.leaf, C.picFrame];
  books.forEach((c, i) => rect(s, x + 34 + i * 7, y - 16 + (i % 2) * 2, 7, 16 - (i % 2) * 2, c, C.outline));
}

function drawRug(s) {
  outlineEllipse(s, 240, 248, 92, 15, C.rugBorder, C.outline);
  fillEllipse(s, 240, 248, 86, 12, C.rug);
  for (let x = 170; x <= 310; x += 14) fillEllipse(s, x, 248, 2, 1, C.rugPattern);
}

function drawBed(s, cx, cy) {
  fillEllipse(s, cx, cy + 6, 40, 6, C.floorShade);
  outlineEllipse(s, cx, cy, 38, 11, C.bedOuter, C.outline);
  fillEllipse(s, cx, cy + 3, 36, 7, C.bedOuterDark);
  fillEllipse(s, cx, cy - 1, 31, 7, C.bedInnerDark);
  fillEllipse(s, cx, cy - 2, 29, 6, C.bedInner);
}

function drawBowl(s, cx, cy) {
  fillEllipse(s, cx, cy + 3, 13, 3, C.floorShade);
  s.fillRect(cx - 11, cy - 6, 23, 1, C.outline);
  for (let i = 0; i < 7; i++) s.fillRect(cx - 11 + Math.floor(i / 2), cy - 5 + i, 23 - Math.floor(i / 2) * 2, 1, i < 2 ? C.kibble : C.bowl);
  s.fillRect(cx - 8, cy + 2, 17, 1, C.bowlDark);
}
