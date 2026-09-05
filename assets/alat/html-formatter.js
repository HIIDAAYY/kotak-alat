/* HTML Formatter — logika perapian dipindahkan apa adanya dari versi
   satu-halaman. Yang ditambahkan hanya pelaporan posisi kesalahan. */
(function (KA) {
  'use strict';

  var VOID = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];

  function htmlRapi(t) {
    var potong = t.replace(/>\s+</g, '><').trim().split(/(<[^>]+>)/g).filter(function (x) { return x.trim(); });
    var dalam = 0, baris = [];
    potong.forEach(function (p) {
      var tutup   = /^<\//.test(p);
      var buka    = /^<[a-zA-Z]/.test(p);
      var mandiri = /\/>$/.test(p);
      var nama    = (p.match(/^<\/?([a-zA-Z0-9-]+)/) || [])[1];
      var kosong  = nama && VOID.indexOf(nama.toLowerCase()) !== -1;
      var khusus  = /^<(!|\?)/.test(p);
      if (tutup) dalam = Math.max(0, dalam - 1);
      baris.push('  '.repeat(dalam) + p.trim());
      if (buka && !tutup && !mandiri && !kosong && !khusus) dalam++;
    });
    return baris.join('\n');
  }

  function htmlPadat(t) {
    return t.replace(/<!--[\s\S]*?-->/g, '')
            .replace(/>\s+</g, '><')
            .replace(/\s{2,}/g, ' ')
            .trim();
  }

  /* Kesalahan sungguhan: tanda '<' yang tidak pernah ditutup '>'.
     Masukan seperti ini membuat perapian menghasilkan sampah, jadi ditolak. */
  function periksaTagTerbuka(t) {
    var tanpaKomentar = t.replace(/<!--[\s\S]*?-->/g, function (c) {
      return new Array(c.length + 1).join(' ');
    });
    var buka = -1;
    for (var i = 0; i < tanpaKomentar.length; i++) {
      var c = tanpaKomentar.charAt(i);
      if (c === '<') {
        if (buka !== -1) {
          var p = KA.posisi(t, i);
          throw KA.Kesalahan('Tag ini dibuka dengan "<" tetapi tidak pernah ditutup ">" — tanda "<" berikutnya sudah muncul di baris ' +
            p.baris + ' kolom ' + p.kolom, t, buka);
        }
        buka = i;
      } else if (c === '>') {
        buka = -1;
      }
    }
    if (buka !== -1) throw KA.Kesalahan('Tag dibuka dengan "<" tetapi tidak pernah ditutup ">"', t, buka);
  }

  /* Bukan kesalahan, hanya catatan: di HTML, tag seperti <p> dan <li>
     memang sah tanpa penutup. Jadi ini dilaporkan, bukan menggagalkan proses. */
  function catatanTag(t) {
    var re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g;
    var tumpuk = [], m;
    while ((m = re.exec(t)) !== null) {
      var nama = m[2].toLowerCase();
      if (VOID.indexOf(nama) !== -1 || m[3] === '/') continue;
      if (m[1] === '/') {
        var k = -1;
        for (var i = tumpuk.length - 1; i >= 0; i--) { if (tumpuk[i].nama === nama) { k = i; break; } }
        if (k === -1) {
          var p = KA.posisi(t, m.index);
          return 'catatan: </' + nama + '> di baris ' + p.baris + ' kolom ' + p.kolom + ' tidak punya pembuka';
        }
        tumpuk.length = k;
      } else {
        tumpuk.push({ nama: nama, indeks: m.index });
      }
    }
    if (tumpuk.length) {
      var s = tumpuk[tumpuk.length - 1];
      var q = KA.posisi(t, s.indeks);
      return 'catatan: <' + s.nama + '> di baris ' + q.baris + ' kolom ' + q.kolom +
             ' tidak ditutup — dibiarkan apa adanya';
    }
    return '';
  }

  var catatanTerakhir = '';

  KA.daftar({
    utama: function (t) { periksaTagTerbuka(t); catatanTerakhir = catatanTag(t); return htmlRapi(t); },
    alt:   function (t) { periksaTagTerbuka(t); catatanTerakhir = catatanTag(t); return htmlPadat(t); },
    modeKeluar: 'html',
    ringkasHasil: function (sebelum, sesudah) {
      return KA.hemat(sebelum, sesudah) + (catatanTerakhir ? ' · ' + catatanTerakhir : '');
    }
  });
})(window.KotakAlat);
