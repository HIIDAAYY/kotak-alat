# Kotak Alat

Situs statis multi-halaman. HTML + JavaScript murni, tanpa framework,
tanpa bundler, tanpa client-side routing. Tiap alat punya berkas HTML dan
alamatnya sendiri, dan berpindah halaman memicu pemuatan dokumen penuh
oleh peramban — itulah syarat agar impression iklan dan page view analitik
tercatat.

## Perintah

    npm install          # sekali saja, memasang Tailwind CLI
    npm run halaman      # menghasilkan 17 berkas .html + sitemap.xml + robots.txt
    npm run css          # Tailwind CLI -> assets/kotakalat.css (terpangkas)
    npm run bangun       # keduanya sekaligus

    node bin/server-uji.js 4173     # server lokal dengan URL bersih
    node bin/verifikasi.js 4173     # pemeriksaan otomatis, cetak tabel hasil

## Susunan

    src/data/situs.js       alamat situs, surel, urutan kategori
    src/data/alat.js        definisi 12 alat: judul, meta, tombol, contoh, batasan
    src/data/halaman.js     5 halaman pendukung
    src/template/dasar.html satu template untuk 17 halaman
    src/tailwind.css        sumber Tailwind (dibangun jadi assets/kotakalat.css)
    bin/bangun.js           generator halaman (alat penulis, bukan bagian situs)

    assets/situs.js         runtime bersama: tema, cookie, tombol alat, unggah/unduh
    assets/sorot.js         penyorot sintaks buatan sendiri
    assets/alat/<slug>.js   logika tiap alat

    *.html                  keluaran statis, inilah yang di-deploy
    kontak.php              penangan formulir untuk hosting PHP
    .htaccess               URL bersih untuk Apache shared hosting
    vercel.json             URL bersih untuk Vercel

Header, navigasi, footer, slot iklan, dan popup cookie hanya ditulis satu
kali di `src/template/dasar.html`. Jangan menyunting berkas `.html` di akar
secara langsung — hasilnya akan tertimpa saat `npm run halaman` dijalankan.

## Deploy

    vercel --prod

Lihat `LISENSI.md` untuk daftar komponen pihak ketiga.
