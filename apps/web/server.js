const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;
const file = path.join(__dirname, 'dist', 'index.html');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', app: 'softwall-cashflow' }));
  }
  try {
    const html = fs.readFileSync(file);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('MVP build not found');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Softwall Cashflow listening on ${port}`));
