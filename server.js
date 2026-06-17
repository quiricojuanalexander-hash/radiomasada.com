// Simple streaming proxy for radio stream using only native Node modules.
// Usage: node server.js
// The server will fetch the upstream URL and pipe bytes to clients without extra deps.

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const UPSTREAM = process.env.UPSTREAM || 'https://uk26freenew.listen2myradio.com/live.mp3?typeportmount=s1_10571_stream_134072484';

function proxyStream(req, res) {
  try {
    const upstreamUrl = new URL(UPSTREAM);
    const lib = upstreamUrl.protocol === 'https:' ? https : http;
    const options = {
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': 'audio/mpeg, */*'
      }
    };
    const upsReq = lib.get(UPSTREAM, options, (upsRes) => {
      // Propagar algunos encabezados y status
      const headers = Object.assign({}, upsRes.headers);
      res.writeHead(upsRes.statusCode || 200, headers);
      upsRes.pipe(res);
    });
    upsReq.on('error', (err) => {
      console.error('Upstream request error:', err);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad gateway');
    });
  } catch (err) {
    console.error('Proxy internal error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
}

const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/stream') {
    proxyStream(req, res);
    return;
  }
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<html><body>
      <h3>Streaming proxy</h3>
      <p>Endpoint: <a href="/stream">/stream</a></p>
      <audio controls autoplay src="/stream"></audio>
    </body></html>`);
    return;
  }
  // Servir radio.html desde el directorio de trabajo si se solicita
  if (req.url === '/radio.html') {
    const filePath = path.join(process.cwd(), 'radio.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT} (UPSTREAM=${UPSTREAM})`));
