import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.cwd());
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
http.createServer(async (req,res) => {
  try {
    const parsed = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + decodeURIComponent(parsed.pathname));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    let target = file;
    if ((await stat(target)).isDirectory()) target = path.join(target,'index.html');
    const data = await readFile(target);
    res.writeHead(200, {'Content-Type': types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(data);
  } catch { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('Страница не найдена'); }
}).listen(port,'127.0.0.1',()=>console.log(`ARGEO preview: http://127.0.0.1:${port}`));
