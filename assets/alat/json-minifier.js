/* JSON Minifier — mengurai lebih dulu, lalu menulis ulang tanpa spasi. */
(function (KA) {
  'use strict';

  function padat(t) { return JSON.stringify(KA.uraiJson(t)); }
  function rapi(t)  { return JSON.stringify(KA.uraiJson(t), null, 2); }

  KA.daftar({
    utama: padat,
    alt: rapi,
    modeKeluar: 'json'
  });
})(window.KotakAlat);
