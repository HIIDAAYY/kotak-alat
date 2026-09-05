#!/usr/bin/env node
/* Generator halaman Kotak Alat.
 *
 * Alat bantu penulis, BUKAN bagian dari situs. Keluarannya berkas .html statis
 * biasa yang bisa dibuka tanpa Node, tanpa bundler, tanpa runtime apa pun.
 *
 * Jalankan:  npm run halaman
 */
'use strict';

const fs = require('fs');
const path = require('path');

const AKAR = path.join(__dirname, '..');
const situs = require(path.join(AKAR, 'src/data/situs.js'));
const alat = require(path.join(AKAR, 'src/data/alat.js'));
const halaman = require(path.join(AKAR, 'src/data/halaman.js'));

const template = fs.readFileSync(path.join(AKAR, 'src/template/dasar.html'), 'utf8');

/* ---------- utilitas ---------- */
const escAtr = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/\n/g, '&#10;').replace(/\r/g, '');

const escTeks = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* meta description tidak boleh memuat markup */
const bersihMeta = (s) => escAtr(String(s).replace(/<[^>]+>/g, ''));

const urlPenuh = (u) => situs.asal + (u === '/' ? '/' : u);

const idKategori = (k) => 'kategori-' + k.toLowerCase();

/* ---------- navigasi ---------- */
const HALAMAN_NAV = halaman.map((h) => ({ url: h.url, nav: h.nav }));

function navUtama(urlAktif, kategoriAktif) {
  return HALAMAN_NAV.map((h) => {
    /* halaman alat dianggap berada di bawah "Alat" */
    const aktif = h.url === urlAktif || (h.url === '/' && kategoriAktif);
    const kelas = aktif
      ? 'rounded-lg bg-kertas3 px-2.5 py-1.5 text-[14px] font-semibold text-tinta no-underline dark:bg-gelap3 dark:text-kapur'
      : 'rounded-lg px-2.5 py-1.5 text-[14px] text-tinta2 no-underline hover:bg-kertas3 hover:text-tinta dark:text-kapur2 dark:hover:bg-gelap3 dark:hover:text-kapur';
    return `<a href="${h.url}" class="${kelas}"${aktif ? ' aria-current="page"' : ''}>${h.nav}</a>`;
  }).join('\n      ');
}

function navKakiAlat(slugAktif) {
  return situs.kategori.map((k) => {
    const daftar = alat.filter((a) => a.kategori === k);
    if (!daftar.length) return '';
    const item = daftar.map((a) => {
      const aktif = a.slug === slugAktif;
      return `<li><a href="/${a.slug}" class="text-[13px] ${aktif
        ? 'font-semibold text-tinta dark:text-kapur'
        : 'text-tinta2 hover:text-aksen dark:text-kapur2 dark:hover:text-aksenG'} no-underline"${aktif ? ' aria-current="page"' : ''}>${a.nav}</a></li>`;
    }).join('\n          ');
    return `<div>
        <h2 class="mt-0 mb-2 text-[12px] font-semibold uppercase tracking-wider text-tinta3 dark:text-kapur3">${k}</h2>
        <ul class="grid gap-1.5 list-none p-0 m-0">
          ${item}
        </ul>
      </div>`;
  }).filter(Boolean).join('\n      ');
}

function navKakiHalaman(urlAktif) {
  return HALAMAN_NAV.map((h) =>
    `<a href="${h.url}" class="text-tinta2 no-underline hover:text-aksen dark:text-kapur2 dark:hover:text-aksenG"${h.url === urlAktif ? ' aria-current="page"' : ''}>${h.nav}</a>`
  ).join('\n      ');
}

/* ---------- remah roti ---------- */
function remah(bagian) {
  const isi = bagian.map((b, i) => {
    const pemisah = i > 0 ? '<li aria-hidden="true" class="text-tinta3 dark:text-kapur3">›</li>\n        ' : '';
    const item = b.url
      ? `<li><a href="${b.url}" class="no-underline hover:underline">${b.nama}</a></li>`
      : `<li aria-current="page" class="font-medium text-tinta dark:text-kapur">${b.nama}</li>`;
    return pemisah + item;
  }).join('\n        ');
  return `<nav aria-label="Remah roti" class="mb-3 text-[13px] text-tinta2 dark:text-kapur2">
      <ol class="flex flex-wrap items-center gap-2 list-none p-0 m-0">
        ${isi}
      </ol>
    </nav>`;
}

function jsonLdRemah(bagian) {
  const daftar = bagian.map((b, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: String(b.nama).replace(/<[^>]+>/g, ''),
    item: urlPenuh(b.url || bagian[bagian.length - 1].urlSendiri || '/')
  }));
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: daftar
  })}</script>`;
}

/* ---------- isi halaman alat ---------- */
function medanRegex(a) {
  if (a.polaContoh === undefined) return '';
  return `
      <div class="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
        <div>
          <label class="label-kecil" for="pola">Pola regex</label>
          <input class="kotak-teks" type="text" id="pola" spellcheck="false" placeholder="(\\w+)@([\\w.]+)">
        </div>
        <div>
          <label class="label-kecil" for="bendera">Bendera</label>
          <input class="kotak-teks" type="text" id="bendera" spellcheck="false" value="g" placeholder="gim">
        </div>
      </div>`;
}

function isiAlat(a) {
  const tombolAlt = a.alt
    ? `\n        <button type="button" class="tbl tbl-sekunder" id="alt">${escTeks(a.alt)}</button>`
    : '';

  const atrContoh = [
    `data-contoh="${escAtr(a.contoh)}"`,
    a.polaContoh !== undefined ? `data-pola="${escAtr(a.polaContoh)}"` : '',
    a.benderaContoh !== undefined ? `data-bendera="${escAtr(a.benderaContoh)}"` : ''
  ].filter(Boolean).join(' ');

  const batas = a.batas
    ? `\n      <div class="catatan"><strong class="text-tinta dark:text-kapur">Batasan alat ini.</strong> ${a.batas}</div>`
    : '';

  return `${medanRegex(a)}
      <div class="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <label class="label-kecil" for="masuk">Masukan</label>
          <div class="flex overflow-hidden rounded-lg border border-garis bg-kertas2 focus-within:ring-2 focus-within:ring-aksen dark:border-garisG dark:bg-gelap2 dark:focus-within:ring-aksenG">
            <pre id="nomor-baris" aria-hidden="true" class="m-0 h-[300px] shrink-0 select-none overflow-hidden bg-kertas3 py-3 pl-3 pr-2 text-right font-mono text-[13px] leading-[1.55] text-tinta3 dark:bg-gelap3 dark:text-kapur3">1</pre>
            <textarea id="masuk" wrap="off" spellcheck="false" autocomplete="off"
              class="h-[300px] w-full resize-none border-0 bg-transparent p-3 font-mono text-[13px] leading-[1.55] text-tinta outline-none dark:text-kapur"
              placeholder="Tempel teks di sini…"></textarea>
          </div>
        </div>
        <div>
          <span class="label-kecil" id="label-hasil">Hasil</span>
          <pre id="keluar-sorot" tabindex="0" role="region" aria-labelledby="label-hasil" class="panel-hasil h-[300px] min-h-0 max-h-none"></pre>
          <textarea id="keluar-mentah" hidden readonly aria-hidden="true" tabindex="-1" class="absolute -left-[9999px] h-px w-px"></textarea>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="tbl" id="jalan">${escTeks(a.utama)}</button>${tombolAlt}
        <button type="button" class="tbl tbl-sekunder" id="contoh" ${atrContoh}>Muat contoh</button>
        <button type="button" class="tbl tbl-sekunder" id="salin">Salin hasil</button>
        <button type="button" class="tbl tbl-sekunder" id="unduh" data-nama="${escAtr(a.unduh)}">Unduh hasil</button>
        <button type="button" class="tbl tbl-sekunder" id="bersih">Bersihkan</button>
        <label class="tbl tbl-sekunder cursor-pointer" for="berkas">
          Unggah berkas
          <input type="file" id="berkas" accept="${escAtr(a.terima)}" class="sr-only">
        </label>
      </div>

      <p id="status" class="mt-3 min-h-[20px] text-[13px] font-medium text-tinta2 dark:text-kapur2" role="status" aria-live="polite"></p>
      <pre id="rincian" hidden class="mt-1 overflow-x-auto rounded-lg border border-garis bg-kertas2 p-3 font-mono text-[12.5px] leading-[1.5] text-rusak dark:border-garisG dark:bg-gelap2 dark:text-rusakG"></pre>

      <div class="catatan">${a.catatan}</div>${batas}

      <p class="mt-4 text-[13px] text-tinta3 dark:text-kapur3">
        Berkas yang Anda unggah dibaca lewat <code>FileReader</code> di peramban ini dan tidak dikirim ke mana pun.
      </p>`;
}

/* ---------- aside ---------- */
function asideAlat(a) {
  const sekategori = alat.filter((x) => x.kategori === a.kategori && x.slug !== a.slug);
  const daftar = sekategori.length
    ? `<ul class="grid gap-2 list-none p-0 m-0">${sekategori.map((x) =>
        `<li><a href="/${x.slug}" class="text-[13.5px] no-underline hover:underline">${x.nav}</a></li>`).join('')}</ul>`
    : `<p class="m-0 text-[13px] text-tinta2 dark:text-kapur2">Belum ada alat lain di kategori ini.</p>`;
  return `<div class="kartu mb-5">
      <h2 class="mt-0 mb-2 text-[13px] font-semibold uppercase tracking-wider text-tinta3 dark:text-kapur3">Kategori ${a.kategori}</h2>
      ${daftar}
      <p class="mt-3 mb-0 text-[13px]"><a href="/" class="no-underline hover:underline">Lihat semua alat →</a></p>
    </div>`;
}

/* ---------- beranda ---------- */
function daftarAlatBeranda() {
  const bagian = situs.kategori.map((k) => {
    const daftar = alat.filter((a) => a.kategori === k);
    if (!daftar.length) return '';
    const kartu = daftar.map((a) => `<li>
            <a href="/${a.slug}" class="block h-full rounded-xl border border-garis bg-kertas2 p-4 no-underline transition-colors hover:border-aksen dark:border-garisG dark:bg-gelap2 dark:hover:border-aksenG">
              <span class="block text-[15px] font-semibold text-tinta dark:text-kapur">${a.nav}</span>
              <span class="mt-1 block text-[13px] leading-relaxed text-tinta2 dark:text-kapur2">${a.ringkas}</span>
            </a>
          </li>`).join('\n          ');
    return `<section id="${idKategori(k)}" class="mt-8 scroll-mt-4">
        <h2 class="mt-0">${k}</h2>
        <ul class="mt-3 grid gap-3 list-none p-0 sm:grid-cols-2">
          ${kartu}
        </ul>
      </section>`;
  }).filter(Boolean).join('\n      ');

  return bagian + `
      <div class="catatan mt-8">
        Tiap alat punya berkas HTML dan alamatnya sendiri. Berpindah alat memuat ulang dokumen
        sepenuhnya seperti situs biasa, bukan menukar isi halaman lewat JavaScript.
      </div>`;
}

/* ---------- perakit ---------- */
function rakit(o) {
  return template
    .replace(/\{\{TITLE\}\}/g, escAtr(o.title))
    .replace(/\{\{DESKRIPSI\}\}/g, bersihMeta(o.deskripsi))
    .replace(/\{\{KANONIK\}\}/g, escAtr(urlPenuh(o.url)))
    .replace(/\{\{JSONLD\}\}/g, o.jsonld || '')
    .replace(/\{\{NAV_UTAMA\}\}/g, navUtama(o.url, o.kategori))
    .replace(/\{\{REMAH\}\}/g, o.remah || '')
    .replace(/\{\{H1\}\}/g, o.h1)
    .replace(/\{\{RINGKAS\}\}/g, o.ringkas
      ? `<p class="mb-1 max-w-[68ch] text-tinta2 dark:text-kapur2">${o.ringkas}</p>`
      : '')
    .replace(/\{\{ISI\}\}/g, o.isi)
    .replace(/\{\{ASIDE\}\}/g, o.aside || '')
    .replace(/\{\{NAV_KAKI_ALAT\}\}/g, navKakiAlat(o.slugAktif))
    .replace(/\{\{NAV_KAKI_HALAMAN\}\}/g, navKakiHalaman(o.url))
    .replace(/\{\{SKRIP\}\}/g, o.skrip || '');
}

/* ---------- jalankan ---------- */
const ditulis = [];

function tulis(namaBerkas, isi) {
  const tujuan = path.join(AKAR, namaBerkas);
  fs.writeFileSync(tujuan, isi, 'utf8');
  ditulis.push({ berkas: namaBerkas, bita: Buffer.byteLength(isi, 'utf8') });
}

/* halaman alat */
alat.forEach((a) => {
  const bagianRemah = [
    { nama: 'Beranda', url: '/' },
    { nama: a.kategori, url: '/#' + idKategori(a.kategori) },
    { nama: a.h1, urlSendiri: '/' + a.slug }
  ];
  tulis(a.slug + '.html', rakit({
    url: '/' + a.slug,
    title: a.title,
    deskripsi: a.deskripsi,
    h1: a.h1,
    ringkas: a.ringkas,
    kategori: a.kategori,
    slugAktif: a.slug,
    remah: remah(bagianRemah),
    jsonld: jsonLdRemah(bagianRemah),
    isi: isiAlat(a),
    aside: asideAlat(a),
    skrip: `<script src="/assets/sorot.js"></script>\n<script src="/assets/alat/${a.slug}.js"></script>`
  }));
});

/* halaman pendukung */
halaman.forEach((h) => {
  const isBeranda = h.slug === 'index';
  const isi = (h.isi === '{{DAFTAR_ALAT}}' ? daftarAlatBeranda() : h.isi)
    .replace(/\{\{SUREL\}\}/g, situs.surel);

  const bagianRemah = isBeranda ? null : [
    { nama: 'Beranda', url: '/' },
    { nama: h.nav, urlSendiri: h.url }
  ];

  tulis(h.slug + '.html', rakit({
    url: h.url,
    title: h.title,
    deskripsi: h.deskripsi,
    h1: h.h1,
    ringkas: isBeranda
      ? 'Semua berjalan di browser Anda. Tidak ada data yang dikirim ke server mana pun.'
      : '',
    remah: bagianRemah ? remah(bagianRemah) : '',
    jsonld: bagianRemah ? jsonLdRemah(bagianRemah) : '',
    isi: isBeranda ? isi : `<div class="prosa">${isi}</div>`,
    aside: ''
  }));
});

/* sitemap.xml */
const tanggal = new Date().toISOString().slice(0, 10);
const urlSitemap = []
  .concat(halaman.map((h) => ({ url: h.url, prioritas: h.prioritas })))
  .concat(alat.map((a) => ({ url: '/' + a.slug, prioritas: '0.8' })));

tulis('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urlSitemap.map((u) =>
    '  <url>\n' +
    '    <loc>' + urlPenuh(u.url) + '</loc>\n' +
    '    <lastmod>' + tanggal + '</lastmod>\n' +
    '    <changefreq>monthly</changefreq>\n' +
    '    <priority>' + u.prioritas + '</priority>\n' +
    '  </url>'
  ).join('\n') +
  '\n</urlset>\n');

/* robots.txt */
tulis('robots.txt',
  'User-agent: *\n' +
  'Allow: /\n' +
  '\n' +
  'Sitemap: ' + situs.asal + '/sitemap.xml\n');

/* ---------- ringkasan ---------- */
console.log('Halaman yang dihasilkan (' + ditulis.length + ' berkas):');
ditulis.forEach((d) => {
  console.log('  ' + d.berkas.padEnd(28) + String(d.bita).padStart(7) + ' B');
});
console.log('URL dalam sitemap: ' + urlSitemap.length);
