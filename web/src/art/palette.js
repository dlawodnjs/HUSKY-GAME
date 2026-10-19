// Shared palette. One character per colour so sprites read as text grids.
import { hex } from '../engine/raster.js';

export const COLORS = {
  // husky
  K: '#221f2b', // outline
  D: '#3d4357', // dark saddle fur
  G: '#5e6780', // grey fur
  L: '#929bb1', // light grey fur
  W: '#f5f2eb', // white fur
  w: '#cfcad6', // white fur in shade
  B: '#5fb6ff', // iris
  b: '#24508f', // pupil / deep iris
  E: '#ffffff', // eye highlight
  N: '#16141c', // nose
  P: '#f28aa2', // tongue / inner ear
  p: '#bf5873', // tongue shade
  R: '#5a1e2d', // inside of mouth
  // fx
  H: '#ff5c7c', // heart
  h: '#c23558', // heart shade
  Y: '#ffd166', // note / sparkle
  y: '#d99a2b', // note shade
  Z: '#a9d4ff', // zzz
  z: '#5e8fd1', // zzz shade
  S: '#9fdcff', // sweat / water
  U: '#e2d6c3', // dust
  u: '#b8a993', // dust shade
  F: '#ffd8bf', // hand skin
  f: '#e7b395', // hand skin shade
  T: '#f0c27a', // treat
  t: '#b88342', // treat shade
};

export const PALETTE = Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, hex(v)]));
