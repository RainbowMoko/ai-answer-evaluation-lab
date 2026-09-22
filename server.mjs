import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/data.mjs', ['data.mjs', 'text/javascript; charset=utf-8']],
  ['/evaluator.mjs', ['evaluator.mjs', 'text/javascript; charset=utf-8']]
]);
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('PORT must be an integer from 1 to 65535.');
const server = createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end('Method not allowed');
  }
  let pathname;
  try { pathname = new URL(request.url, 'http://localhost').pathname; }
  catch { response.writeHead(400); return response.end('Bad request'); }
  const file = files.get(pathname);
  if (!file) { response.writeHead(404); return response.end('Not found'); }
  try {
    const content = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': file[1], 'Content-Length': content.length });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500);
    response.end('Could not load the demo file');
  }
});
server.on('error', error => { console.error(`Could not start the local demo: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`AI Answer Evaluation Lab: http://127.0.0.1:${port}\nLocal only. Press Ctrl+C to stop.`));
