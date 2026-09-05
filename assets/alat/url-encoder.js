/* URL Encoder / Decoder — memakai encodeURIComponent seperti versi
   satu-halaman, ditambah pelaporan baris dan kolom saat membuka sandi. */
(function (KA) {
  'use strict';

  function sandikan(t) { return encodeURIComponent(t); }

  function buka(t) {
    /* 1. tanda % yang tidak diikuti dua digit heksadesimal */
    var re = /%(?![0-9A-Fa-f]{2})/g, m;
    while ((m = re.exec(t)) !== null) {
      throw KA.Kesalahan('Tanda "%" harus diikuti dua digit heksadesimal (contoh %20)', t, m.index);
    }
    /* 2. rangkaian %XX yang bukan UTF-8 yang sah — dicoba per rangkaian
          supaya posisinya bisa ditunjuk, bukan sekadar "URI malformed" */
    var reRun = /(?:%[0-9A-Fa-f]{2})+/g, r;
    while ((r = reRun.exec(t)) !== null) {
      try {
        decodeURIComponent(r[0]);
      } catch (e) {
        throw KA.Kesalahan('Rangkaian "' + r[0] + '" bukan penyandian UTF-8 yang sah', t, r.index);
      }
    }
    return decodeURIComponent(t);
  }

  KA.daftar({
    utama: sandikan,
    alt: buka,
    modeKeluar: 'teks'
  });
})(window.KotakAlat);
