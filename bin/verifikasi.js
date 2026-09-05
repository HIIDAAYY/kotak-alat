#!/usr/bin/env node
/* Verifikasi keluaran situs. Menembak server uji lokal, bukan membaca asumsi.
 * Jalankan server dulu: node bin/server-uji.js 4173
 * Lalu:                node bin/verifikasi.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const AKAR = path.join(__dirname, '..');
const situs = require(path.join(AKAR, 'src/data/situs.js'));
const alat = require(path.join(AKAR, 'src/data/alat.js'));
const halaman = require(path.join(AKAR, 'src/data/halaman.js'));

const PORT = Number(process.argv[2] || 4173);
const DASAR = 'http://localhost:' + PORT;

const URL_SITUS = halaman.map((h) => h.url).concat(alat.map((a) => '/' + a.slug));

function ambil(jalur) {
  return new Promise((selesai, gagal) => {
    http.get(DASAR + jalur, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { data += c; });
      res.on('end', () => selesai({ kode: res.statusCode, isi: data, tipe: res.headers['content-type'] }));
    }).on('error', gagal);
  });
}

const antara = (isi, mulai, akhir) => {
  const i = isi.indexOf(mulai);
  if (i === -1) return null;
  const j = isi.indexOf(akhir, i + mulai.length);
  return j === -1 ? null : isi.slice(i + mulai.length, j);
};

const cocokSemua = (isi, re) => { const h = []; let m; while ((m = re.exec(isi)) !== null) h.push(m); return h; };

const garis = (judul) => console.log('\n' + '='.repeat(72) + '\n' + judul + '\n' + '='.repeat(72));

let gagalTotal = 0;
const nilai = (ok) => { if (!ok) gagalTotal++; return ok ? 'LULUS' : 'GAGAL'; };

(async function () {
  const dokumen = {};

  /* ---------- 1. status 200 ---------- */
  garis('1. Ke-17 URL dibuka satu per satu');
  console.log('URL'.padEnd(24) + 'STATUS  HASIL');
  for (const u of URL_SITUS) {
    const r = await ambil(u);
    dokumen[u] = r.isi;
    const ok = r.kode === 200;
    console.log(u.padEnd(24) + String(r.kode).padEnd(8) + nilai(ok));
  }
  console.log('Jumlah URL diuji: ' + URL_SITUS.length);

  /* ---------- 2. title unik ---------- */
  garis('2. <title> tiap halaman');
  const judul = {};
  for (const u of URL_SITUS) {
    judul[u] = antara(dokumen[u], '<title>', '</title>');
    console.log(u.padEnd(24) + judul[u]);
  }
  const judulUnik = new Set(Object.values(judul));
  console.log('\nJumlah judul: ' + Object.keys(judul).length + ' · unik: ' + judulUnik.size +
              ' · ' + nilai(judulUnik.size === URL_SITUS.length && !Object.values(judul).includes(null)));

  /* ---------- 3. meta description unik ---------- */
  garis('3. <meta name="description"> tiap halaman');
  const desk = {};
  for (const u of URL_SITUS) {
    const m = dokumen[u].match(/<meta name="description" content="([^"]*)"/);
    desk[u] = m ? m[1] : null;
    console.log(u.padEnd(24) + (desk[u] ? desk[u].slice(0, 78) : 'TIDAK ADA'));
  }
  const deskUnik = new Set(Object.values(desk));
  console.log('\nJumlah deskripsi: ' + Object.keys(desk).length + ' · unik: ' + deskUnik.size +
              ' · ' + nilai(deskUnik.size === URL_SITUS.length && !Object.values(desk).includes(null)));

  /* ---------- 3b. canonical + h1 ---------- */
  garis('3b. canonical dan satu <h1> per halaman');
  let kanonikOk = true, h1Ok = true;
  for (const u of URL_SITUS) {
    const kan = (dokumen[u].match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || null;
    const h1 = cocokSemua(dokumen[u], /<h1[^>]*>([\s\S]*?)<\/h1>/g);
    const harusnya = situs.asal + (u === '/' ? '/' : u);
    const okKan = kan === harusnya;
    const okH1 = h1.length === 1;
    if (!okKan) kanonikOk = false;
    if (!okH1) h1Ok = false;
    console.log(u.padEnd(24) + (okKan ? 'canonical OK' : 'canonical SALAH: ' + kan).padEnd(26) +
                'h1=' + h1.length + ' “' + (h1[0] ? h1[0][1].replace(/<[^>]+>/g, '').trim() : '-') + '”');
  }
  console.log('\ncanonical: ' + nilai(kanonikOk) + ' · satu h1 per halaman: ' + nilai(h1Ok));

  /* ---------- 4. tidak ada navigasi lewat button / pushState ---------- */
  garis('4. Navigasi tidak memakai <button> atau pushState');
  let pushState = 0, tombolNav = [];
  const idTombolSah = ['tombol-tema', 'ck-perlu', 'ck-semua', 'jalan', 'alt', 'contoh', 'salin', 'unduh', 'bersih'];
  for (const u of URL_SITUS) {
    if (/pushState|replaceState/.test(dokumen[u])) pushState++;
    /* semua <button> di dalam <nav>, <header>, atau <footer> = navigasi lewat tombol */
    const daerah = cocokSemua(dokumen[u], /<(nav|footer)\b[\s\S]*?<\/\1>/g).map((m) => m[0]).join('');
    cocokSemua(daerah, /<button\b[^>]*>/g).forEach((m) => tombolNav.push(u + ' :: ' + m[0]));
    /* tombol di luar daftar yang sah */
    cocokSemua(dokumen[u], /<button\b[^>]*id="([^"]+)"/g).forEach((m) => {
      if (idTombolSah.indexOf(m[1]) === -1) tombolNav.push(u + ' :: id=' + m[1]);
    });
  }
  console.log('Berkas JS situs mengandung pushState/replaceState: ' +
    (/pushState|replaceState/.test(fs.readFileSync(path.join(AKAR, 'assets/situs.js'), 'utf8')) ? 'YA' : 'TIDAK'));
  console.log('Halaman HTML mengandung pushState/replaceState: ' + pushState);
  console.log('<button> di dalam <nav>/<footer>: ' + tombolNav.length);
  if (tombolNav.length) tombolNav.slice(0, 10).forEach((t) => console.log('   ' + t));
  console.log('Daftar id <button> yang ada (semuanya aksi alat/tema/cookie, bukan pindah halaman): ' +
              idTombolSah.join(', '));
  console.log('\nHasil: ' + nilai(pushState === 0 && tombolNav.length === 0));

  /* ---------- 5. jumlah <a href> di beranda ---------- */
  garis('5. Jumlah <a href> di beranda');
  const tautanBeranda = cocokSemua(dokumen['/'], /<a\s[^>]*href="/g).length;
  const tautanAlatBeranda = new Set(
    cocokSemua(dokumen['/'], /<a\s[^>]*href="\/([a-z0-9-]+)"/g).map((m) => m[1])
  );
  console.log('Total <a href> : ' + tautanBeranda);
  console.log('Tautan alat unik: ' + tautanAlatBeranda.size + ' (' + [...tautanAlatBeranda].join(', ') + ')');
  console.log('\nSyarat >= 12 · ' + nilai(tautanBeranda >= 12));

  /* ---------- 6. tidak ada jejak framework ---------- */
  garis('6. Tidak ada string framework di keluaran akhir');
  const berkasKeluaran = fs.readdirSync(AKAR)
    .filter((f) => /\.(html|css|js|xml|txt)$/.test(f))
    .concat(fs.readdirSync(path.join(AKAR, 'assets')).filter((f) => /\.(css|js)$/.test(f)).map((f) => 'assets/' + f))
    .concat(fs.readdirSync(path.join(AKAR, 'assets/alat')).map((f) => 'assets/alat/' + f));

  const kataTerlarang = ['react', 'vue', 'next', 'astro', 'svelte'];
  let temuan = [];
  berkasKeluaran.forEach((f) => {
    const isi = fs.readFileSync(path.join(AKAR, f), 'utf8').toLowerCase();
    kataTerlarang.forEach((k) => {
      let i = isi.indexOf(k);
      while (i !== -1) {
        temuan.push({ berkas: f, kata: k, cuplikan: isi.slice(Math.max(0, i - 30), i + 30).replace(/\s+/g, ' ') });
        i = isi.indexOf(k, i + 1);
      }
    });
  });
  console.log('Berkas keluaran diperiksa: ' + berkasKeluaran.length);
  console.log('Temuan: ' + temuan.length);
  temuan.slice(0, 20).forEach((t) => console.log('   ' + t.berkas + ' [' + t.kata + '] …' + t.cuplikan + '…'));
  console.log('\nHasil: ' + nilai(temuan.length === 0));

  /* ---------- 8. sitemap & robots ---------- */
  garis('8. sitemap.xml dan robots.txt');
  const sm = await ambil('/sitemap.xml');
  const rb = await ambil('/robots.txt');
  const loc = cocokSemua(sm.isi, /<loc>([^<]+)<\/loc>/g).map((m) => m[1]);
  const harusnya = URL_SITUS.map((u) => situs.asal + (u === '/' ? '/' : u));
  const kurang = harusnya.filter((u) => loc.indexOf(u) === -1);
  const lebih = loc.filter((u) => harusnya.indexOf(u) === -1);
  console.log('sitemap.xml status ' + sm.kode + ' · tipe ' + sm.tipe);
  console.log('  <loc> ditemukan : ' + loc.length);
  console.log('  URL kurang      : ' + (kurang.length ? kurang.join(', ') : 'tidak ada'));
  console.log('  URL berlebih    : ' + (lebih.length ? lebih.join(', ') : 'tidak ada'));
  loc.forEach((l) => console.log('    ' + l));
  console.log('robots.txt status ' + rb.kode);
  console.log(rb.isi.split('\n').map((b) => '    ' + b).join('\n'));
  const robotsOk = /Allow: \//.test(rb.isi) && rb.isi.indexOf('Sitemap: ' + situs.asal + '/sitemap.xml') !== -1 &&
                   !/Disallow: \/\s*$/m.test(rb.isi);
  console.log('sitemap: ' + nilai(sm.kode === 200 && loc.length === 17 && !kurang.length && !lebih.length) +
              ' · robots: ' + nilai(rb.kode === 200 && robotsOk));

  /* ---------- 9. berat halaman ---------- */
  garis('9. Berat halaman (HTML + CSS + seluruh JS yang dimuat)');
  const bita = (f) => fs.statSync(path.join(AKAR, f)).size;
  const css = bita('assets/kotakalat.css');
  const jsSitus = bita('assets/situs.js');
  const jsSorot = bita('assets/sorot.js');
  const daftarBerat = URL_SITUS.map((u) => {
    const nama = (u === '/' ? 'index' : u.slice(1)) + '.html';
    const isAlat = alat.some((a) => '/' + a.slug === u);
    const jsAlat = isAlat ? bita('assets/alat/' + u.slice(1) + '.js') : 0;
    const total = bita(nama) + css + jsSitus + (isAlat ? jsSorot + jsAlat : 0);
    return { u, html: bita(nama), total };
  }).sort((a, b) => b.total - a.total);

  console.log('URL'.padEnd(24) + 'HTML'.padStart(9) + 'TOTAL'.padStart(11) + '   (CSS ' + css + ' B + situs.js ' + jsSitus + ' B)');
  daftarBerat.forEach((d) => console.log(
    d.u.padEnd(24) + String(d.html).padStart(9) + String(d.total).padStart(11) +
    '   ' + (d.total / 1024).toFixed(1) + ' KB'));
  const terberat = daftarBerat[0];
  console.log('\nHalaman terberat: ' + terberat.u + ' = ' + (terberat.total / 1024).toFixed(1) + ' KB');
  console.log('Plafon 150 KB · ' + nilai(terberat.total <= 150 * 1024));

  /* ---------- ringkasan ---------- */
  garis('RINGKASAN');
  console.log(gagalTotal === 0 ? 'Semua pemeriksaan otomatis LULUS.' : gagalTotal + ' pemeriksaan GAGAL.');
  process.exit(gagalTotal === 0 ? 0 : 1);
})().catch((e) => { console.error('GAGAL menjalankan verifikasi:', e.message); process.exit(2); });
