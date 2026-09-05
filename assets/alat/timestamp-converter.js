/* Timestamp Converter — Unix timestamp ⇄ tanggal, tiap baris sendiri-sendiri. */
(function (KA) {
  'use strict';

  function isoUtc(d) {
    return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
  }
  function lokal(d) {
    try {
      return d.toLocaleString('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      return d.toString();
    }
  }

  /* indeks awal baris ke-n (0-based) di dalam teks utuh */
  function awalBaris(teks, n) {
    var lompat = 0, garis = teks.split('\n');
    for (var i = 0; i < n; i++) lompat += garis[i].length + 1;
    return lompat;
  }

  function keTanggal(teks) {
    var garis = teks.split('\n');
    var keluar = [];
    for (var i = 0; i < garis.length; i++) {
      var baris = garis[i].trim();
      if (!baris) continue;
      if (!/^-?\d+$/.test(baris)) {
        throw KA.Kesalahan('"' + baris + '" bukan angka Unix timestamp', teks,
          awalBaris(teks, i) + garis[i].indexOf(baris.charAt(0)));
      }
      var digit = baris.replace('-', '').length;
      var milidetik = digit >= 12 ? Number(baris) : Number(baris) * 1000;
      var d = new Date(milidetik);
      if (isNaN(d.getTime())) {
        throw KA.Kesalahan('Angka ' + baris + ' di luar jangkauan tanggal yang bisa ditampilkan',
          teks, awalBaris(teks, i));
      }
      keluar.push(
        baris + '  (' + (digit >= 12 ? 'milidetik' : 'detik') + ')\n' +
        '  UTC   : ' + isoUtc(d) + '\n' +
        '  Lokal : ' + lokal(d)
      );
    }
    if (!keluar.length) throw new Error('Tidak ada baris yang bisa diproses.');
    return keluar.join('\n\n');
  }

  function keTimestamp(teks) {
    var garis = teks.split('\n');
    var keluar = [];
    for (var i = 0; i < garis.length; i++) {
      var baris = garis[i].trim();
      if (!baris) continue;
      var ms = Date.parse(baris);
      if (isNaN(ms)) {
        throw KA.Kesalahan('"' + baris + '" tidak dikenali sebagai tanggal oleh peramban ini',
          teks, awalBaris(teks, i) + garis[i].indexOf(baris.charAt(0)));
      }
      var d = new Date(ms);
      keluar.push(
        baris + '\n' +
        '  Detik      : ' + Math.floor(ms / 1000) + '\n' +
        '  Milidetik  : ' + ms + '\n' +
        '  UTC        : ' + isoUtc(d)
      );
    }
    if (!keluar.length) throw new Error('Tidak ada baris yang bisa diproses.');
    return keluar.join('\n\n');
  }

  KA.daftar({
    utama: keTanggal,
    alt: keTimestamp,
    modeKeluar: 'teks',
    ringkasHasil: function (sebelum) {
      var n = sebelum.split('\n').filter(function (b) { return b.trim(); }).length;
      return n + ' baris diproses';
    }
  });
})(window.KotakAlat);
