import { build } from 'esbuild';
await build({
  entryPoints: ['phone-scene.js'],
  outfile: 'assets/phone-scene.min.js',
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2022'],
  legalComments: 'linked',
});
