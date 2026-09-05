/* JSON → XML — logika dipindahkan apa adanya dari versi satu-halaman. */
(function (KA) {
  'use strict';

  function amanTag(k) {
    var s = String(k).replace(/[^A-Za-z0-9_.-]/g, '_');
    if (!/^[A-Za-z_]/.test(s)) s = '_' + s;
    return s;
  }
  function lolosTeks(v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function keXml(nilai, tag, dalam) {
    var sp = '  '.repeat(dalam);
    if (nilai === null || nilai === undefined) return sp + '<' + tag + '/>\n';
    if (Array.isArray(nilai)) {
      return nilai.map(function (v) { return keXml(v, tag, dalam); }).join('');
    }
    if (typeof nilai === 'object') {
      var isi = Object.keys(nilai).map(function (k) {
        return keXml(nilai[k], amanTag(k), dalam + 1);
      }).join('');
      return sp + '<' + tag + '>\n' + isi + sp + '</' + tag + '>\n';
    }
    return sp + '<' + tag + '>' + lolosTeks(nilai) + '</' + tag + '>\n';
  }

  function jsonKeXml(t) {
    var d = KA.uraiJson(t);   /* pengurai dengan baris & kolom */
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + keXml(d, 'root', 0);
  }

  KA.daftar({
    utama: jsonKeXml,
    alt: null,
    modeKeluar: 'xml'
  });
})(window.KotakAlat);
