/* JSON Formatter — logika dipindahkan dari versi satu-halaman,
   ditambah pesan kesalahan yang menunjuk baris dan kolom. */
(function (KA) {
  'use strict';

  function jsonRapi(t)  { return JSON.stringify(KA.uraiJson(t), null, 2); }
  function jsonPadat(t) { return JSON.stringify(KA.uraiJson(t)); }

  KA.daftar({
    utama: jsonRapi,
    alt: jsonPadat,
    modeKeluar: 'json'
  });
})(window.KotakAlat);
