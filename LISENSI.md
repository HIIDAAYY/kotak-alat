# Lisensi komponen pihak ketiga

Situs ini direncanakan memuat iklan, sehingga lisensi copyleft (GPL dan
sejenisnya) dihindari sepenuhnya. Berikut daftar lengkapnya, apa adanya.

## Yang dikirim ke browser pengunjung

**Tidak ada library pihak ketiga sama sekali.**

Seluruh JavaScript yang berjalan di halaman ditulis untuk proyek ini:

| Berkas | Isi |
|---|---|
| `assets/situs.js` | mode gelap, popup cookie, tombol alat, unggah berkas, salin, unduh |
| `assets/sorot.js` | penyorot sintaks JSON / XML / HTML / CSS |
| `assets/alat/*.js` | 12 berkas, satu per alat |

Font memakai font bawaan sistem (`system-ui`, `Segoe UI`, `Consolas`, dan
seterusnya). Tidak ada webfont yang diunduh, tidak ada permintaan ke Google Fonts.

Karena tidak ada library runtime, folder `vendor/` kosong. Folder itu tetap
disediakan agar jelas ke mana library harus ditaruh bila suatu saat diperlukan
— di sana, di-host sendiri, bukan dari CDN.

## Yang dipakai hanya saat membangun, tidak dikirim ke pengunjung

| Nama | Versi | Lisensi | Peran |
|---|---|---|---|
| Tailwind CSS | 3.4.17 | MIT | CLI yang menghasilkan `assets/kotakalat.css` |

Tailwind CLI dijalankan di komputer penulis. Yang sampai ke pengunjung hanya
satu berkas CSS statis hasil pemangkasan. Tidak ada compiler Tailwind di browser
— CDN Tailwind sengaja tidak dipakai karena persis melakukan hal itu.

Dependensi tak langsung Tailwind (PostCSS, Autoprefixer, chokidar, dan lainnya)
seluruhnya berlisensi MIT atau ISC. Tidak ada satu pun yang GPL, dan tidak ada
satu pun yang ikut terkirim ke pengunjung.

Skrip generator `bin/bangun.js` hanya memakai modul bawaan Node (`fs`, `path`).

## CodeMirror 5 — dipertimbangkan, tidak dipakai

CodeMirror 5 berlisensi MIT, jadi lisensinya tidak bermasalah. Yang menjadi
masalah adalah ukurannya. Diukur langsung dari paket npm `codemirror@5.65.16`:

| Berkas | Mentah | gzip |
|---|---|---|
| `lib/codemirror.js` | 402.012 B | 105.989 B |
| `lib/codemirror.css` | 8.720 B | 2.516 B |
| `mode/javascript/javascript.js` | 38.894 B | 8.612 B |

Inti CodeMirror saja sudah 402 KB mentah, dan paket npm-nya tidak menyertakan
versi terpangkas. Halaman alat terberat di situs ini seluruhnya — HTML, CSS,
dan seluruh JavaScript-nya — berada di bawah 60 KB. Menambahkan CodeMirror
membuatnya lewat jauh dari plafon 150 KB per halaman yang ditetapkan.

Karena itu dipakai `<textarea>` biasa, dan syntax highlighting tetap ada lewat
`assets/sorot.js` yang ditulis sendiri (sekitar 4 KB, tanpa dependensi).
Penyorot itu mewarnai panel hasil; kolom masukan memakai textarea dengan
penomoran baris agar pesan "baris 3, kolom 12" langsung bisa ditelusuri.

## Lisensi kode situs ini

Kode dalam repositori ini milik pemilik proyek. Tidak ada kewajiban lisensi yang
menular dari komponen mana pun di atas.
