/* JSON Validator — sah / tidak sah, dengan baris, kolom, dan ringkasan struktur. */
(function (KA) {
  'use strict';

  function dalamnya(nilai, tingkat) {
    if (nilai === null || typeof nilai !== 'object') return tingkat;
    var maks = tingkat;
    var kunci = Object.keys(nilai);
    for (var i = 0; i < kunci.length; i++) {
      var d = dalamnya(nilai[kunci[i]], tingkat + 1);
      if (d > maks) maks = d;
    }
    return maks;
  }

  function hitungKunci(nilai) {
    if (nilai === null || typeof nilai !== 'object') return 0;
    var jumlah = Array.isArray(nilai) ? 0 : Object.keys(nilai).length;
    var kunci = Object.keys(nilai);
    for (var i = 0; i < kunci.length; i++) jumlah += hitungKunci(nilai[kunci[i]]);
    return jumlah;
  }

  function tipe(nilai) {
    if (nilai === null) return 'null';
    if (Array.isArray(nilai)) return 'larik (' + nilai.length + ' unsur)';
    return typeof nilai === 'object' ? 'objek' : typeof nilai;
  }

  function periksa(teks) {
    var nilai = KA.uraiJson(teks);   /* melempar dengan baris & kolom bila rusak */
    var baris = teks.split('\n').length;
    return [
      'JSON SAH',
      '',
      'Tipe nilai di akar   : ' + tipe(nilai),
      'Jumlah kunci (total) : ' + hitungKunci(nilai),
      'Kedalaman maksimum   : ' + dalamnya(nilai, 0),
      'Baris masukan        : ' + baris,
      'Ukuran masukan       : ' + KA.ukuran(teks) + ' B',
      'Ukuran setelah padat : ' + KA.ukuran(JSON.stringify(nilai)) + ' B'
    ].join('\n');
  }

  KA.daftar({
    utama: periksa,
    alt: null,
    modeKeluar: 'teks',
    ringkasHasil: function () { return 'masukan sah'; }
  });
})(window.KotakAlat);
