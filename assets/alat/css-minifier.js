/* CSS Minifier — sengaja konservatif.
   Yang dibuang hanya komentar dan spasi yang pasti aman. Tidak ada penulisan
   ulang properti, tidak ada penggabungan selector, tidak ada pemendekan nilai.
   Isi tanda kutip dan url() dilewati apa adanya. */
(function (KA) {
  'use strict';

  /* at-rule yang isinya blok aturan lain, bukan deklarasi.
     Penting: di dalam blok semacam ini, spasi sebelum ":" TIDAK boleh dibuang,
     karena ".a :hover" (turunan) berbeda arti dari ".a:hover". */
  var BERSARANG = /^@(media|supports|document|-moz-document|layer|container|scope|keyframes|-webkit-keyframes)\b/i;

  var TANDA_RAPAT = '{};,';

  function padatkan(css) {
    var keluar = '';
    var i = 0, n = css.length;
    var tumpuk = [];            /* 'deklarasi' | 'bersarang' */
    var kurung = [];            /* posisi '{' untuk pesan kesalahan */
    var awalan = '';            /* teks sejak pembatas terakhir, untuk menebak jenis blok */
    var adaSpasi = false;

    function terakhir() { return keluar.charAt(keluar.length - 1); }
    function dalamDeklarasi() {
      return tumpuk.length > 0 && tumpuk[tumpuk.length - 1] === 'deklarasi';
    }

    /* Tulis satu potongan teks, sambil memutuskan nasib spasi yang tertunda. */
    function tulis(potongan, cRapatKiri) {
      if (adaSpasi) {
        adaSpasi = false;
        var kiri = terakhir();
        var buangKiri = kiri === '' || TANDA_RAPAT.indexOf(kiri) !== -1 || kiri === '(' ||
                        (kiri === ':' && dalamDeklarasi());
        var buangKanan = cRapatKiri;
        if (!buangKiri && !buangKanan) keluar += ' ';
      }
      keluar += potongan;
      awalan += potongan;
    }

    while (i < n) {
      var c = css.charAt(i);

      /* --- komentar --- */
      if (c === '/' && css.charAt(i + 1) === '*') {
        var tutup = css.indexOf('*/', i + 2);
        if (tutup === -1) throw KA.Kesalahan('Komentar dibuka dengan "/*" tetapi tidak pernah ditutup "*/"', css, i);
        if (css.charAt(i + 2) === '!') {
          /* komentar lisensi /*! ... *\/ dipertahankan */
          tulis(css.slice(i, tutup + 2), false);
        } else {
          adaSpasi = true;   /* komentar diperlakukan seperti satu spasi */
        }
        i = tutup + 2;
        continue;
      }

      /* --- string --- */
      if (c === '"' || c === "'") {
        var j = i + 1, tertutup = false;
        while (j < n) {
          var d = css.charAt(j);
          if (d === '\\') { j += 2; continue; }
          if (d === '\n') break;              /* string tidak boleh menyeberang baris */
          if (d === c) { tertutup = true; break; }
          j++;
        }
        if (!tertutup) throw KA.Kesalahan('Tanda kutip dibuka tetapi tidak pernah ditutup', css, i);
        tulis(css.slice(i, j + 1), false);
        i = j + 1;
        continue;
      }

      /* --- url() tanpa kutip: disalin apa adanya --- */
      if ((c === 'u' || c === 'U') && /^url\(/i.test(css.slice(i, i + 4))) {
        var sisa = css.slice(i + 4);
        if (!/^\s*["']/.test(sisa)) {
          var tutupUrl = css.indexOf(')', i + 4);
          if (tutupUrl === -1) throw KA.Kesalahan('url( dibuka tetapi tidak pernah ditutup ")"', css, i);
          tulis(css.slice(i, tutupUrl + 1), false);
          i = tutupUrl + 1;
          continue;
        }
      }

      /* --- spasi --- */
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f') {
        adaSpasi = true;
        i++;
        continue;
      }

      /* --- pembatas --- */
      if (c === '{') {
        tulis('{', true);
        tumpuk.push(BERSARANG.test(awalan.trim().replace(/\{$/, '')) ? 'bersarang' : 'deklarasi');
        kurung.push(i);
        awalan = '';
        i++;
        continue;
      }
      if (c === '}') {
        if (!tumpuk.length) throw KA.Kesalahan('Kurung kurawal tutup "}" tidak punya pembuka', css, i);
        adaSpasi = false;
        if (terakhir() === ';') keluar = keluar.slice(0, -1);   /* titik koma terakhir tidak perlu */
        keluar += '}';
        tumpuk.pop();
        kurung.pop();
        awalan = '';
        i++;
        continue;
      }
      if (c === ';') {
        adaSpasi = false;
        keluar += ';';
        awalan = '';
        i++;
        continue;
      }
      if (c === ':') {
        tulis(':', dalamDeklarasi());
        i++;
        continue;
      }
      if (c === ',') {
        tulis(',', true);
        i++;
        continue;
      }
      /* spasi tepat setelah "(" dan tepat sebelum ")" aman dibuang.
         Spasi SEBELUM "(" dipertahankan — "screen and (…)" membutuhkannya. */
      if (c === ')') {
        tulis(')', true);
        i++;
        continue;
      }

      tulis(c, false);
      i++;
    }

    if (tumpuk.length) {
      throw KA.Kesalahan('Kurung kurawal "{" dibuka tetapi tidak pernah ditutup "}"', css, kurung[kurung.length - 1]);
    }
    return keluar.trim();
  }

  KA.daftar({
    utama: padatkan,
    alt: null,
    modeKeluar: 'css'
  });
})(window.KotakAlat);
