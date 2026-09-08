const http = require('http');
const fs = require('fs');
const path = require('path');
const { route: apiRoute } = require('./api');
const port = process.env.PORT || 3000;
const dist = path.join(__dirname, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', app: 'softwall-cashflow' }));
  }
  if (req.url.startsWith('/api/')) {
    if (apiRoute(req, res)) return;
    res.writeHead(404, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    const safe = path.normalize(requested).replace(/^\.\.(?:[\\/]|$)/, '');
    const target = path.join(dist, safe);
    const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(dist, 'index.html');
    const ext = path.extname(file);
    res.writeHead(200, { 'content-type': mime[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('MVP build not found');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Softwall Cashflow listening on ${port}`));
