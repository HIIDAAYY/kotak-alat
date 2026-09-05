/* Kotak Alat — penyorot sintaks ringan.
   Ditulis sendiri, tanpa library. CodeMirror 5 sengaja tidak dipakai karena
   berkas intinya saja 402 KB (106 KB gzip) — jauh di atas plafon 150 KB per
   halaman yang ditetapkan untuk situs ini. Lihat LISENSI.md. */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function bungkus(s, kelas) {
    return kelas ? '<span class="' + kelas + '">' + esc(s) + '</span>' : esc(s);
  }

  /* ---------- JSON ---------- */
  function json(s) {
    var re = /("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}\[\],:])/g;
    var out = '', last = 0, m;
    while ((m = re.exec(s)) !== null) {
      out += esc(s.slice(last, m.index));
      if (m[1]) {
        out += bungkus(m[1], /^\s*:/.test(s.slice(re.lastIndex)) ? 't-kunci' : 't-teks');
      } else if (m[2]) { out += bungkus(m[2], 't-angka'); }
      else if (m[3]) { out += bungkus(m[3], 't-atom'); }
      else { out += bungkus(m[4], 't-tanda'); }
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }

  /* ---------- XML / HTML ---------- */
  function isiTag(t) {
    var re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_][\w:.\-]*)|([<>\/=!?])/g;
    var out = '', last = 0, m, adaNama = false;
    while ((m = re.exec(t)) !== null) {
      out += esc(t.slice(last, m.index));
      if (m[1]) { out += bungkus(m[1], 't-teks'); }
      else if (m[2]) {
        if (!adaNama) { adaNama = true; out += bungkus(m[2], 't-tag'); }
        else { out += bungkus(m[2], 't-atr'); }
      } else { out += bungkus(m[3], 't-tanda'); }
      last = re.lastIndex;
    }
    return out + esc(t.slice(last));
  }

  function markup(s) {
    var re = /(<!--[\s\S]*?-->)|(<[^>]*>)/g;
    var out = '', last = 0, m;
    while ((m = re.exec(s)) !== null) {
      out += esc(s.slice(last, m.index));
      if (m[1]) { out += bungkus(m[1], 't-komen'); }
      else { out += isiTag(m[2]); }
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }

  /* ---------- CSS ---------- */
  function css(s) {
    var out = '', i = 0, n = s.length;
    var dalamBlok = false, setelahTitikDua = false, penyangga = '';

    function buang(kelas) {
      if (penyangga) { out += bungkus(penyangga, kelas); penyangga = ''; }
    }

    while (i < n) {
      var dua = s.substr(i, 2);
      if (dua === '/*') {
        buang(dalamBlok ? (setelahTitikDua ? null : 't-prop') : 't-selek');
        var tutup = s.indexOf('*/', i + 2);
        if (tutup === -1) tutup = n - 2;
        out += bungkus(s.slice(i, tutup + 2), 't-komen');
        i = tutup + 2;
        continue;
      }
      var c = s.charAt(i);
      if (c === '"' || c === "'") {
        buang(dalamBlok ? (setelahTitikDua ? null : 't-prop') : 't-selek');
        var j = i + 1;
        while (j < n && s.charAt(j) !== c) { if (s.charAt(j) === '\\') j++; j++; }
        out += bungkus(s.slice(i, Math.min(j + 1, n)), 't-teks');
        i = j + 1;
        continue;
      }
      if (c === '{') {
        buang('t-selek'); dalamBlok = true; setelahTitikDua = false;
        out += bungkus('{', 't-tanda'); i++; continue;
      }
      if (c === '}') {
        buang(setelahTitikDua ? null : 't-prop');
        dalamBlok = false; setelahTitikDua = false;
        out += bungkus('}', 't-tanda'); i++; continue;
      }
      if (c === ':' && dalamBlok && !setelahTitikDua) {
        buang('t-prop'); setelahTitikDua = true;
        out += bungkus(':', 't-tanda'); i++; continue;
      }
      if (c === ';') {
        buang(null); setelahTitikDua = false;
        out += bungkus(';', 't-tanda'); i++; continue;
      }
      penyangga += c;
      i++;
    }
    buang(dalamBlok ? null : 't-selek');
    return out;
  }

  /* ---------- pintu masuk ---------- */
  global.KotakSorot = function (teks, mode) {
    if (teks === '' || teks == null) return '';
    try {
      if (mode === 'json') return json(teks);
      if (mode === 'xml' || mode === 'html') return markup(teks);
      if (mode === 'css') return css(teks);
    } catch (e) { /* kalau penyorot gagal, tampilkan teks apa adanya */ }
    return esc(teks);
  };

})(window);
