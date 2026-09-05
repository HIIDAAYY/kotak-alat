/* Regex Tester — memakai mesin regular expression bawaan peramban. */
(function (KA) {
  'use strict';

  var BATAS = 10000;

  /* Pemeriksaan ringan supaya kesalahan pola bisa ditunjuk kolomnya.
     Mesin JavaScript tidak memberi tahu posisi, jadi kurung dan kelas
     karakter dihitung sendiri di sini. */
  function periksaPola(pola) {
    var tumpuk = [], dalamKelas = false;
    for (var i = 0; i < pola.length; i++) {
      var c = pola.charAt(i);
      if (c === '\\') {
        if (i === pola.length - 1) throw KA.Kesalahan('Garis miring terbalik di ujung pola tidak menyandi apa pun', pola, i);
        i++; continue;
      }
      if (dalamKelas) {
        /* di dalam [...] semua tanda kurung adalah karakter biasa */
        if (c === ']') { dalamKelas = false; tumpuk.pop(); }
        continue;
      }
      if (c === '[') { dalamKelas = true; tumpuk.push({ c: '[', i: i }); continue; }
      if (c === '(') { tumpuk.push({ c: '(', i: i }); continue; }
      if (c === ')') {
        var atas = tumpuk.pop();
        if (!atas || atas.c !== '(') throw KA.Kesalahan('Kurung tutup ")" tidak punya pembuka', pola, i);
        continue;
      }
      /* "]" di luar kelas karakter adalah literal yang sah di JavaScript,
         jadi sengaja tidak dianggap kesalahan. */
    }
    if (dalamKelas) {
      for (var j = tumpuk.length - 1; j >= 0; j--) {
        if (tumpuk[j].c === '[') throw KA.Kesalahan('Kelas karakter "[" tidak pernah ditutup "]"', pola, tumpuk[j].i);
      }
    }
    if (tumpuk.length) {
      var s = tumpuk[tumpuk.length - 1];
      throw KA.Kesalahan('Tanda "' + s.c + '" tidak pernah ditutup', pola, s.i);
    }
  }

  function ambil(id) { return document.getElementById(id); }

  function uji(teks) {
    var medanPola = ambil('pola');
    var medanBendera = ambil('bendera');
    var pola = medanPola ? medanPola.value : '';
    var bendera = medanBendera ? medanBendera.value.trim() : '';

    if (!pola) throw new Error('Pola regex masih kosong. Isi kolom "Pola" di atas.');

    periksaPola(pola);

    if (bendera.indexOf('g') === -1) bendera += 'g';
    var re;
    try {
      re = new RegExp(pola, bendera);
    } catch (e) {
      throw new Error('Pola ditolak mesin peramban: ' + e.message);
    }

    var hasil = [], m, jumlah = 0;
    re.lastIndex = 0;
    while ((m = re.exec(teks)) !== null) {
      var p = KA.posisi(teks, m.index);
      var potong = m[0].length > 120 ? m[0].slice(0, 120) + '…' : m[0];
      var barisHasil = '#' + (jumlah + 1) + '  baris ' + p.baris + ', kolom ' + p.kolom +
                       ' (indeks ' + m.index + ')\n  cocok : ' + JSON.stringify(potong);
      for (var g = 1; g < m.length; g++) {
        barisHasil += '\n  grup ' + g + ': ' + (m[g] === undefined ? '(tidak cocok)' : JSON.stringify(m[g]));
      }
      if (m.groups) {
        Object.keys(m.groups).forEach(function (nama) {
          barisHasil += '\n  grup "' + nama + '": ' +
            (m.groups[nama] === undefined ? '(tidak cocok)' : JSON.stringify(m.groups[nama]));
        });
      }
      hasil.push(barisHasil);
      jumlah++;
      if (m[0] === '') re.lastIndex++;          /* cegah putaran tanpa henti */
      if (jumlah >= BATAS) { hasil.push('… berhenti pada batas ' + BATAS + ' kecocokan.'); break; }
    }

    if (!jumlah) return 'Tidak ada kecocokan.\n\nPola   : /' + pola + '/' + bendera +
                        '\nBaris  : ' + teks.split('\n').length;
    return jumlah + ' kecocokan untuk /' + pola + '/' + bendera + '\n\n' + hasil.join('\n\n');
  }

  KA.daftar({
    utama: uji,
    alt: null,
    modeKeluar: 'teks',
    muatContoh: function () {
      var mp = ambil('pola'), mb = ambil('bendera');
      var tp = ambil('contoh');
      if (mp && tp) mp.value = tp.getAttribute('data-pola') || '';
      if (mb && tp) mb.value = tp.getAttribute('data-bendera') || 'g';
    },
    ringkasHasil: function () { return ''; }
  });
})(window.KotakAlat);
