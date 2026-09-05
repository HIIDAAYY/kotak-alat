/* Base64 Encoder / Decoder — logika UTF-8 dipindahkan apa adanya dari
   versi satu-halaman, ditambah pelaporan baris dan kolom saat membuka sandi. */
(function (KA) {
  'use strict';

  function b64Sandi(t) {
    var byte = new TextEncoder().encode(t);
    var potongan = '';
    /* dipecah supaya string panjang tidak melebihi batas argumen fungsi */
    for (var i = 0; i < byte.length; i += 8192) {
      potongan += String.fromCharCode.apply(null, byte.subarray(i, i + 8192));
    }
    return btoa(potongan);
  }

  var SAH = /^[A-Za-z0-9+/=]$/;

  function b64Buka(t) {
    /* cari karakter yang tidak termasuk alfabet Base64, lalu tunjuk posisinya */
    for (var i = 0; i < t.length; i++) {
      var c = t.charAt(i);
      if (/\s/.test(c)) continue;
      if (!SAH.test(c)) {
        throw KA.Kesalahan('Karakter "' + c + '" bukan bagian dari alfabet Base64', t, i);
      }
    }
    var bersih = t.replace(/\s/g, '');
    if (bersih.length % 4 !== 0) {
      throw KA.Kesalahan(
        'Panjang Base64 harus kelipatan 4, yang ini ' + bersih.length +
        ' karakter (kurang ' + (4 - bersih.length % 4) + ')', t, t.length);
    }
    var biner;
    try {
      biner = atob(bersih);
    } catch (e) {
      throw KA.Kesalahan('Rangkaian Base64 tidak dapat dibuka', t, t.length);
    }
    var arr = new Uint8Array(biner.length);
    for (var j = 0; j < biner.length; j++) arr[j] = biner.charCodeAt(j);
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(arr);
    } catch (e2) {
      throw new Error('Hasil dekode bukan teks UTF-8 yang sah — kemungkinan ini data biner, bukan teks.');
    }
  }

  KA.daftar({
    utama: b64Sandi,
    alt: b64Buka,
    modeKeluar: 'teks'
  });
})(window.KotakAlat);
