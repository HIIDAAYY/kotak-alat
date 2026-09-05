#!/usr/bin/env node
/* Server statis untuk pengujian lokal.
 * Meniru perilaku URL bersih Vercel (cleanUrls) dan .htaccess:
 *   /            -> index.html
 *   /json-formatter -> json-formatter.html
 * Bukan bagian dari situs. Jalankan: node bin/server-uji.js [port]
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const AKAR = path.join(__dirname, '..');
const PORT = Number(process.argv[2] || 4173);

const TIPE = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

/* jangan sajikan berkas kerja penulis */
const TERLARANG = [/^node_modules\//, /^src\//, /^bin\//, /^_lama\//, /^\.vercel\//];

function sajikan(req, res) {
  let jalur = decodeURIComponent(req.url.split('?')[0]);
  if (jalur.length > 1 && jalur.endsWith('/')) jalur = jalur.slice(0, -1);

  let relatif = jalur === '/' ? 'index.html' : jalur.replace(/^\/+/, '');
  if (relatif.includes('..')) { res.writeHead(400); return res.end('permintaan tidak sah'); }

  if (TERLARANG.some((p) => p.test(relatif))) { res.writeHead(403); return res.end('terlarang'); }

  let berkas = path.join(AKAR, relatif);

  if (!fs.existsSync(berkas) || fs.statSync(berkas).isDirectory()) {
    /* URL bersih: /json-formatter -> json-formatter.html */
    const denganHtml = path.join(AKAR, relatif + '.html');
    if (fs.existsSync(denganHtml)) {
      berkas = denganHtml;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404</h1><p>Halaman tidak ditemukan: ' + relatif + '</p>');
    }
  }

  const isi = fs.readFileSync(berkas);
  res.writeHead(200, {
    'Content-Type': TIPE[path.extname(berkas)] || 'application/octet-stream',
    'Content-Length': isi.length
  });
  res.end(isi);
}

http.createServer(sajikan).listen(PORT, () => {
  console.log('Server uji berjalan di http://localhost:' + PORT);
});
