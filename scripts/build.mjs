import { mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import './bundle.mjs';
const out = path.resolve('dist');
if (path.basename(out) !== 'dist' || path.dirname(out) !== process.cwd()) throw new Error('Unexpected output path');
await rm(out, { recursive: true, force: true });
await mkdir(out,{recursive:true});
for (const file of ['index.html','styles.css','app.js','assets','.nojekyll','404.html']) await cp(file, path.join(out,file),{recursive:true});
console.log('Built static website in dist/ — ready for GitHub Pages.');
