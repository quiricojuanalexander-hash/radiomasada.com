// Simple streaming proxy for radio stream
// Usage: node server.js
// The server will fetch the upstream URL and pipe bytes to clients.

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = process.env.PORT || 3000;

// Upstream stream URL (you provided)
const UPSTREAM = process.env.UPSTREAM || 'https://uk26freenew.listen2myradio.com/live.mp3?typeportmount=s1_10571_stream_134072484';

app.get('/stream', async (req, res) => {
  try {
    const headers = {
      'Icy-MetaData': '1',
      'User-Agent': req.get('User-Agent') || 'Mozilla/5.0',
      'Accept': 'audio/mpeg, */*'
    };
    const upstreamRes = await fetch(UPSTREAM, { headers, redirect: 'follow' });

    // Propagar algunos encabezados
    const contentType = upstreamRes.headers.get('content-type') || 'audio/mpeg';
    // Si upstream responde HTML, aún así intentaremos transmitir datos binarios
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');

    // Status code from upstream may be 200
    res.status(upstreamRes.status);

    // Pipe body
    const reader = upstreamRes.body.getReader();
    const {Readable} = require('stream');
    const stream = new Readable({
      read() {}
    });

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { stream.push(null); break; }
        stream.push(Buffer.from(value));
      }
    })().catch(err => { stream.destroy(err); });

    stream.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Bad gateway');
  }
});

app.get('/', (req, res) => {
  res.send(`<html><body>
    <h3>Streaming proxy</h3>
    <p>Endpoint: <a href="/stream">/stream</a></p>
    <audio controls autoplay src="/stream"></audio>
  </body></html>`);
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT} (UPSTREAM=${UPSTREAM})`));
