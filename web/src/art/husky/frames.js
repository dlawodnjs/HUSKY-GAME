// Compiles every hand-drawn husky frame and overlay stamp.
import { PALETTE } from '../palette.js';
import { parseHusky, compileHusky } from './index.js';
import { STAND } from './stand.js';

export const HUSKY_SOURCES = [STAND];
export const HUSKY = compileHusky(parseHusky(...HUSKY_SOURCES), PALETTE);
