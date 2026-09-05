/* Kotak Alat — runtime bersama.
   Dimuat di semua halaman. Tidak ada routing di sini: perpindahan halaman
   sepenuhnya memakai <a href> biasa dan pemuatan dokumen penuh oleh browser. */
(function (global) {
  'use strict';

  var KA = {};
  global.KotakAlat = KA;

  /* ================= mode gelap ================= */
  function pasangTema() {
    var tombol = document.getElementById('tombol-tema');
    if (!tombol) return;
    var ikon = document.getElementById('ikon-tema');
    var teks = document.getElementById('teks-tema');

    function gambar() {
      var gelap = document.documentElement.classList.contains('dark');
      tombol.setAttribute('aria-pressed', String(gelap));
      if (ikon) ikon.textContent = gelap ? '☀' : '☾';
      if (teks) teks.textContent = gelap ? 'Mode terang' : 'Mode gelap';
    }
    gambar();

    tombol.addEventListener('click', function () {
      var gelap = document.documentElement.classList.toggle('dark');
      try { localStorage.setItem('kotakalat-tema', gelap ? 'gelap' : 'terang'); } catch (e) {}
      gambar();
    });
  }

  /* ================= popup cookie ================= */
  function pasangCookie() {
    var kotak = document.getElementById('cookie');
    if (!kotak) return;
    var sudah = null;
    try { sudah = localStorage.getItem('kotakalat-cookie'); } catch (e) {}
    if (sudah) return;
    kotak.hidden = false;

    function jawab(nilai) {
      try { localStorage.setItem('kotakalat-cookie', nilai); } catch (e) {}
      kotak.hidden = true;
    }
    var a = document.getElementById('ck-perlu');
    var b = document.getElementById('ck-semua');
    if (a) a.addEventListener('click', function () { jawab('perlu'); });
    if (b) b.addEventListener('click', function () { jawab('semua'); });
  }

  /* ================= utilitas posisi kesalahan ================= */

  /* Ubah indeks karakter menjadi nomor baris dan kolom (mulai dari 1). */
  KA.posisi = function (teks, indeks) {
    if (indeks < 0) indeks = 0;
    if (indeks > teks.length) indeks = teks.length;
    var awal = teks.slice(0, indeks);
    var baris = awal.split('\n');
    return { baris: baris.length, kolom: baris[baris.length - 1].length + 1 };
  };

  /* Cuplikan baris bermasalah dengan penunjuk ^ tepat di kolomnya. */
  KA.cuplik = function (teks, baris, kolom) {
    var semua = teks.split('\n');
    var isi = semua[baris - 1];
    if (isi === undefined) return '';
    var potong = isi, geser = 0;
    if (kolom > 80) { geser = kolom - 40; potong = '…' + isi.slice(geser); geser -= 1; }
    if (potong.length > 120) potong = potong.slice(0, 120) + '…';
    var kolomTampil = kolom - geser;
    var nomor = String(baris);
    var tanda = new Array(kolomTampil).join(' ');
    return nomor + ' | ' + potong + '\n' +
           new Array(nomor.length + 1).join(' ') + ' | ' + tanda + '^';
  };

  /* Kesalahan yang menunjuk baris dan kolom. */
  KA.Kesalahan = function (pesan, teks, indeks) {
    var p = KA.posisi(teks, indeks);
    var e = new Error(pesan + ' (baris ' + p.baris + ', kolom ' + p.kolom + ')');
    e.baris = p.baris;
    e.kolom = p.kolom;
    e.cuplikan = KA.cuplik(teks, p.baris, p.kolom);
    return e;
  };

  /* Pemindai JSON sendiri.
     Pesan bawaan mesin JavaScript tidak selalu menyertakan posisi: sebagian
     bentuknya hanya "Unexpected token ... is not valid JSON" tanpa indeks.
     Pemindai ini dipakai untuk memastikan setiap kesalahan JSON selalu punya
     baris dan kolom, dengan kalimat berbahasa Indonesia yang sama di semua alat.
     Nilai yang dikembalikan tetap berasal dari JSON.parse. */
  function cariKesalahanJson(s) {
    var i = 0, n = s.length;

    function lewatiSpasi() { while (i < n && (s[i] === ' ' || s[i] === '\t' || s[i] === '\n' || s[i] === '\r')) i++; }
    function salah(pesan, di) { return { pesan: pesan, indeks: di === undefined ? i : di }; }

    function string() {
      var awal = i;
      i++;                                   /* kutip pembuka */
      while (i < n) {
        var c = s[i];
        if (c === '"') { i++; return null; }
        if (c === '\\') {
          var b = s[i + 1];
          if (b === undefined) return salah('Teks berakhir di tengah rangkaian escape', i);
          if ('"\\/bfnrt'.indexOf(b) !== -1) { i += 2; continue; }
          if (b === 'u') {
            if (!/^[0-9a-fA-F]{4}$/.test(s.substr(i + 2, 4))) {
              return salah('Escape \\u harus diikuti empat digit heksadesimal', i);
            }
            i += 6; continue;
          }
          return salah('Escape "\\' + b + '" tidak dikenal di dalam string JSON', i);
        }
        if (c < ' ') return salah('Karakter kendali mentah tidak boleh berada di dalam string — pakai escape seperti \\n', i);
        i++;
      }
      return salah('String dibuka dengan tanda kutip tetapi tidak pernah ditutup', awal);
    }

    function angka() {
      var re = /-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/g;
      re.lastIndex = i;
      var m = re.exec(s);
      if (!m || m.index !== i || m[0] === '') return salah('Angka tidak sah');
      i += m[0].length;
      if (i < n && s[i] >= '0' && s[i] <= '9') return salah('Angka JSON tidak boleh diawali angka nol', i - 1);
      return null;
    }

    function literal(kata) {
      if (s.substr(i, kata.length) !== kata) return salah('Nilai tidak dikenali; diharapkan objek, larik, string, angka, true, false, atau null');
      i += kata.length;
      return null;
    }

    function nilai(dalam) {
      if (dalam > 200) return salah('Struktur terlalu dalam untuk diperiksa');
      lewatiSpasi();
      if (i >= n) return salah('JSON berakhir sebelum ada nilai');
      var c = s[i];
      if (c === '{') return objek(dalam);
      if (c === '[') return larik(dalam);
      if (c === '"') return string();
      if (c === 't') return literal('true');
      if (c === 'f') return literal('false');
      if (c === 'n') return literal('null');
      if (c === '-' || (c >= '0' && c <= '9')) return angka();
      return salah('Karakter "' + c + '" tidak bisa memulai sebuah nilai JSON');
    }

    function objek(dalam) {
      i++;                                   /* { */
      lewatiSpasi();
      if (s[i] === '}') { i++; return null; }
      for (;;) {
        lewatiSpasi();
        if (i >= n) return salah('Objek dibuka dengan "{" tetapi tidak pernah ditutup "}"');
        if (s[i] === '}') return salah('Ada koma berlebih sebelum tanda "}"');
        if (s[i] !== '"') return salah('Nama properti harus diapit tanda kutip ganda');
        var e = string(); if (e) return e;
        lewatiSpasi();
        if (s[i] !== ':') return salah('Diharapkan tanda titik dua ":" setelah nama properti');
        i++;
        e = nilai(dalam + 1); if (e) return e;
        lewatiSpasi();
        if (s[i] === ',') { i++; continue; }
        if (s[i] === '}') { i++; return null; }
        if (i >= n) return salah('Objek dibuka dengan "{" tetapi tidak pernah ditutup "}"');
        return salah('Diharapkan tanda koma "," atau kurung kurawal tutup "}"');
      }
    }

    function larik(dalam) {
      i++;                                   /* [ */
      lewatiSpasi();
      if (s[i] === ']') { i++; return null; }
      for (;;) {
        lewatiSpasi();
        if (i >= n) return salah('Larik dibuka dengan "[" tetapi tidak pernah ditutup "]"');
        if (s[i] === ']') return salah('Ada koma berlebih sebelum tanda "]"');
        var e = nilai(dalam + 1); if (e) return e;
        lewatiSpasi();
        if (s[i] === ',') { i++; continue; }
        if (s[i] === ']') { i++; return null; }
        if (i >= n) return salah('Larik dibuka dengan "[" tetapi tidak pernah ditutup "]"');
        return salah('Diharapkan tanda koma "," atau kurung siku tutup "]"');
      }
    }

    var hasil = nilai(0);
    if (hasil) return hasil;
    lewatiSpasi();
    if (i < n) return salah('Masih ada teks setelah nilai JSON berakhir');
    return null;
  }

  /* JSON.parse dengan pesan yang menunjuk baris dan kolom. */
  KA.uraiJson = function (teks) {
    try {
      return JSON.parse(teks);
    } catch (e) {
      var temuan = cariKesalahanJson(teks);
      if (temuan) throw KA.Kesalahan(temuan.pesan, teks, temuan.indeks);
      /* pemindai tidak menemukan apa pun tetapi JSON.parse tetap menolak:
         tampilkan pesan mesin apa adanya, jangan mengarang posisi */
      throw new Error(String(e.message || 'JSON tidak dapat diurai'));
    }
  };

  KA.ukuran = function (t) { return new Blob([t]).size; };

  KA.hemat = function (sebelum, sesudah) {
    var a = KA.ukuran(sebelum), b = KA.ukuran(sesudah);
    if (!a) return '';
    var d = Math.round((1 - b / a) * 100);
    return a + ' B → ' + b + ' B' + (d > 0 ? ' (−' + d + '%)' : '');
  };

  /* ================= halaman alat ================= */

  /* Dipanggil oleh assets/alat/<slug>.js untuk mendaftarkan fungsinya. */
  KA.daftar = function (spek) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { pasangAlat(spek); });
    } else {
      pasangAlat(spek);
    }
  };

  function el(id) { return document.getElementById(id); }

  function pasangAlat(spek) {
    var masuk   = el('masuk');
    var gutter  = el('nomor-baris');
    var sorot   = el('keluar-sorot');
    var simpan  = el('keluar-mentah');
    var status  = el('status');
    var rinci   = el('rincian');
    if (!masuk || !sorot) return;

    var hasilTerakhir = '';

    function nomorBaris() {
      if (!gutter) return;
      var n = masuk.value.split('\n').length;
      var isi = '';
      for (var i = 1; i <= n; i++) isi += i + '\n';
      gutter.textContent = isi;
      gutter.scrollTop = masuk.scrollTop;
    }

    function lapor(pesan, jenis, cuplikan) {
      status.textContent = pesan || '';
      status.className = 'mt-3 text-[13px] font-medium min-h-[20px] ' +
        (jenis === 'ok' ? 'text-sahih dark:text-sahihG'
        : jenis === 'err' ? 'text-rusak dark:text-rusakG'
        : 'text-tinta2 dark:text-kapur2');
      if (rinci) {
        if (cuplikan) {
          rinci.textContent = cuplikan;
          rinci.hidden = false;
        } else {
          rinci.textContent = '';
          rinci.hidden = true;
        }
      }
    }

    function tampilkan(teks) {
      hasilTerakhir = teks;
      if (simpan) simpan.value = teks;
      if (global.KotakSorot) {
        sorot.innerHTML = global.KotakSorot(teks, spek.modeKeluar || 'teks');
      } else {
        sorot.textContent = teks;
      }
    }

    function proses(pakaiAlt) {
      var fn = pakaiAlt ? spek.alt : spek.utama;
      if (typeof fn !== 'function') return;
      var teks = masuk.value;
      if (!teks.trim()) { tampilkan(''); lapor('Masukan masih kosong.', 'err'); return; }
      try {
        var hasil = fn(teks);
        tampilkan(hasil);
        var catatan = spek.ringkasHasil ? spek.ringkasHasil(teks, hasil) : KA.hemat(teks, hasil);
        lapor('Selesai' + (catatan ? ' · ' + catatan : ''), 'ok');
      } catch (e) {
        tampilkan('');
        lapor(e.message || 'Terjadi kesalahan.', 'err', e.cuplikan);
      }
    }

    var bJalan = el('jalan'), bAlt = el('alt'), bContoh = el('contoh'),
        bSalin = el('salin'), bUnduh = el('unduh'), bBersih = el('bersih'),
        berkas = el('berkas');

    if (bJalan) bJalan.addEventListener('click', function () { proses(false); });
    if (bAlt)   bAlt.addEventListener('click', function () { proses(true); });

    if (bContoh) bContoh.addEventListener('click', function () {
      masuk.value = bContoh.getAttribute('data-contoh') || '';
      if (spek.muatContoh) spek.muatContoh();
      nomorBaris();
      tampilkan('');
      lapor('Contoh dimuat. Tekan tombol proses.', 'ok');
    });

    if (bBersih) bBersih.addEventListener('click', function () {
      masuk.value = '';
      nomorBaris();
      tampilkan('');
      lapor('');
      masuk.focus();
    });

    if (bSalin) bSalin.addEventListener('click', function () {
      if (!hasilTerakhir) { lapor('Belum ada hasil untuk disalin.', 'err'); return; }
      function cadangan() {
        if (!simpan) { lapor('Peramban menolak akses papan klip.', 'err'); return; }
        simpan.hidden = false;
        simpan.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        simpan.hidden = true;
        lapor(ok ? 'Hasil disalin.' : 'Peramban menolak akses papan klip.', ok ? 'ok' : 'err');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hasilTerakhir)
          .then(function () { lapor('Hasil disalin.', 'ok'); })
          .catch(cadangan);
      } else { cadangan(); }
    });

    if (bUnduh) bUnduh.addEventListener('click', function () {
      if (!hasilTerakhir) { lapor('Belum ada hasil untuk diunduh.', 'err'); return; }
      var nama = bUnduh.getAttribute('data-nama') || 'hasil.txt';
      var gumpal = new Blob([hasilTerakhir], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(gumpal);
      var a = document.createElement('a');
      a.href = url; a.download = nama;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      lapor('Berkas ' + nama + ' diunduh.', 'ok');
    });

    if (berkas) berkas.addEventListener('change', function () {
      var f = berkas.files && berkas.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) {
        lapor('Berkas lebih dari 5 MB. Tempel sebagian isinya saja.', 'err');
        berkas.value = '';
        return;
      }
      var pembaca = new FileReader();
      pembaca.onload = function () {
        masuk.value = String(pembaca.result);
        nomorBaris();
        tampilkan('');
        lapor('Berkas "' + f.name + '" dibaca di browser ini. Tidak diunggah ke mana pun.', 'ok');
      };
      pembaca.onerror = function () { lapor('Berkas gagal dibaca.', 'err'); };
      pembaca.readAsText(f);
      berkas.value = '';
    });

    masuk.addEventListener('input', nomorBaris);
    masuk.addEventListener('scroll', function () { if (gutter) gutter.scrollTop = masuk.scrollTop; });

    /* Ctrl/Cmd + Enter menjalankan alat */
    masuk.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); proses(false); }
    });

    nomorBaris();
  }

  /* ================= jalankan ================= */
  function mulai() { pasangTema(); pasangCookie(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mulai);
  } else { mulai(); }

})(window);
