// Bundles the preview into one self-contained HTML file (for sharing as a
// single page). Uses esbuild through npx.
//   node web/tools/build-artifact.mjs out.html
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] ?? join(root, 'preview-bundle.html');
const js = execFileSync('npx', ['--yes', 'esbuild@0.24.0', join(root, 'src/preview.js'), '--bundle', '--format=iife', '--minify'], { encoding: 'utf8', maxBuffer: 1 << 26 });
let html = readFileSync(join(root, 'index.html'), 'utf8');
html = html
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/i, '')
  .replace(/<\/html>\s*/i, '')
  .replace(/<\/?head>\s*/gi, '')
  .replace(/<body>\s*/i, '')
  .replace(/<\/body>\s*/i, '')
  .replace(/<meta charset="utf-8">\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '<meta name="claude:viewport-fit-sides" content="cover">\n')
  .replace('<script type="module" src="src/preview.js"></script>', `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`);
writeFileSync(out, html);
console.log(`wrote ${out} (${Math.round(html.length / 1024)} KB)`);
