const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = { '/': ['index.html','text/html'], '/index.html': ['index.html','text/html'], '/styles.css': ['styles.css','text/css'], '/engine.js': ['engine.js','text/javascript'], '/app.js': ['app.js','text/javascript'], '/assets/tokenizer.js': ['assets/tokenizer.js','text/javascript'], '/token-worker-client.js': ['token-worker-client.js','text/javascript'] };
http.createServer((req, res) => {
  const entry = files[req.url.split('?')[0]];
  if (!entry) { res.writeHead(404); res.end('No encontrado'); return; }
  res.setHeader('Content-Type', `${entry[1]}; charset=utf-8`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  fs.createReadStream(path.join(root, entry[0])).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Látigo: http://127.0.0.1:4173'));
