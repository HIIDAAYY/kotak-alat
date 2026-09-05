/* XML Escape / Unescape — hanya lima entitas baku XML. */
(function (KA) {
  'use strict';

  var catatanTerakhir = '';

  var KE = [
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&apos;']
  ];

  function escape(t) {
    catatanTerakhir = '';
    var hasil = t;
    for (var i = 0; i < KE.length; i++) hasil = hasil.split(KE[i][0]).join(KE[i][1]);
    return hasil;
  }

  var BAKU = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

  function unescape(t) {
    catatanTerakhir = '';
    var takDikenal = null;
    var hasil = t.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g,
      function (utuh, isi, indeks) {
        if (isi.charAt(0) === '#') {
          var kode = (isi.charAt(1) === 'x' || isi.charAt(1) === 'X')
            ? parseInt(isi.slice(2), 16)
            : parseInt(isi.slice(1), 10);
          if (!isFinite(kode) || kode < 0 || kode > 0x10FFFF) return utuh;
          try { return String.fromCodePoint(kode); } catch (e) { return utuh; }
        }
        if (Object.prototype.hasOwnProperty.call(BAKU, isi)) return BAKU[isi];
        if (takDikenal === null) takDikenal = { nama: utuh, indeks: indeks };
        return utuh;
      });

    if (takDikenal) {
      var p = KA.posisi(t, takDikenal.indeks);
      catatanTerakhir = 'catatan: ' + takDikenal.nama + ' di baris ' + p.baris + ' kolom ' + p.kolom +
                        ' bukan entitas baku XML — dibiarkan apa adanya';
    }
    return hasil;
  }

  KA.daftar({
    utama: escape,
    alt: unescape,
    modeKeluar: 'teks',
    ringkasHasil: function (sebelum, sesudah) {
      return KA.hemat(sebelum, sesudah) + (catatanTerakhir ? ' · ' + catatanTerakhir : '');
    }
  });
})(window.KotakAlat);
