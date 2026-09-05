/* Lima halaman pendukung. Teksnya dipindahkan apa adanya dari versi
   satu-halaman, hanya dipecah ke berkasnya masing-masing. */
module.exports = [
  {
    slug: 'index',
    url: '/',
    nav: 'Alat',
    h1: 'Perkakas format &amp; konversi',
    title: 'Kotak Alat — perkakas format & konversi di browser',
    deskripsi: 'Kumpulan alat pemformat, pemadat, pemeriksa, dan pengonversi yang berjalan sepenuhnya di browser: JSON, HTML, CSS, XML, Base64, URL, regex, dan timestamp.',
    isi: '{{DAFTAR_ALAT}}',
    prioritas: '1.0'
  },
  {
    slug: 'tentang',
    url: '/tentang',
    nav: 'Tentang',
    h1: 'Tentang',
    title: 'Tentang Kotak Alat | Kotak Alat',
    deskripsi: 'Kotak Alat adalah kumpulan perkakas kecil yang berjalan sepenuhnya di browser, tanpa mengirim teks Anda ke server mana pun dan tanpa API berbayar.',
    prioritas: '0.5',
    isi: `
      <p>Kotak Alat adalah kumpulan perkakas kecil untuk pekerjaan sehari-hari yang berulang:
         merapikan JSON, mengubah format, menyandikan teks.</p>
      <h2>Semuanya berjalan di browser</h2>
      <p>Tidak ada teks yang dikirim ke server. Seluruh pemrosesan terjadi di perangkat Anda,
         sehingga data yang ditempel — termasuk yang bersifat internal — tidak pernah meninggalkan komputer Anda.</p>
      <h2>Tanpa layanan berbayar pihak ketiga</h2>
      <p>Tidak ada API berbayar di balik alat-alat ini. Karena itu situsnya tetap cepat,
         biayanya dapat diprediksi, dan tidak ada yang rusak ketika kuota layanan luar habis.</p>
      <h2>Situs statis, satu berkas per alamat</h2>
      <p>Tiap alat punya berkas HTML dan alamatnya sendiri. Berpindah alat memuat ulang dokumen
         sepenuhnya, seperti situs biasa — bukan menukar isi halaman lewat JavaScript.</p>
    `
  },
  {
    slug: 'privasi',
    url: '/privasi',
    nav: 'Privasi',
    h1: 'Kebijakan Privasi',
    title: 'Kebijakan Privasi | Kotak Alat',
    deskripsi: 'Teks yang Anda tempel diproses sepenuhnya di browser dan tidak dikirim ke server mana pun. Penjelasan soal cookie preferensi, pengukuran, dan iklan.',
    prioritas: '0.3',
    isi: `
      <p><em>Contoh isi untuk prototipe. Teks final disesuaikan dengan kebutuhan pemilik situs.</em></p>
      <h2>Data yang Anda masukkan</h2>
      <p>Teks yang Anda tempel ke dalam alat diproses sepenuhnya di browser dan tidak dikirim,
         disimpan, atau dicatat di server mana pun.</p>
      <h2>Berkas yang Anda unggah</h2>
      <p>Tombol unggah berkas membaca isi berkas lewat <code>FileReader</code> di browser Anda.
         Berkas itu tidak diunggah ke mana pun.</p>
      <h2>Cookie</h2>
      <p>Situs ini dapat menggunakan cookie untuk mengingat preferensi tampilan. Cookie untuk
         pengukuran dan iklan hanya dipasang setelah Anda menyetujuinya.</p>
      <h2>Penyimpanan lokal</h2>
      <p>Pilihan mode gelap dan pilihan cookie Anda disimpan di <code>localStorage</code> peramban,
         yaitu di perangkat Anda sendiri. Keduanya tidak dikirim ke server.</p>
      <h2>Iklan</h2>
      <p>Ruang iklan pada halaman ini dapat diisi oleh jaringan iklan pihak ketiga. Jaringan
         tersebut memiliki kebijakan privasinya sendiri.</p>
    `
  },
  {
    slug: 'ketentuan',
    url: '/ketentuan',
    nav: 'Ketentuan',
    h1: 'Syarat &amp; Ketentuan',
    title: 'Syarat & Ketentuan Penggunaan | Kotak Alat',
    deskripsi: 'Ketentuan penggunaan Kotak Alat: alat disediakan sebagaimana adanya, tanpa jaminan ketepatan hasil konversi untuk keperluan tertentu.',
    prioritas: '0.3',
    isi: `
      <p><em>Contoh isi untuk prototipe.</em></p>
      <h2>Penggunaan</h2>
      <p>Alat-alat di situs ini disediakan sebagaimana adanya, untuk penggunaan wajar dan tidak melanggar hukum.</p>
      <h2>Tanpa jaminan</h2>
      <p>Hasil konversi disediakan tanpa jaminan ketepatan untuk keperluan tertentu. Periksa kembali
         hasilnya sebelum dipakai pada sistem produksi.</p>
      <h2>Perubahan</h2>
      <p>Ketentuan ini dapat berubah sewaktu-waktu. Versi yang berlaku adalah yang tertera di halaman ini.</p>
    `
  },
  {
    slug: 'kontak',
    url: '/kontak',
    nav: 'Kontak',
    h1: 'Kontak',
    title: 'Kontak | Kotak Alat',
    deskripsi: 'Hubungi pengelola Kotak Alat untuk pertanyaan, laporan kesalahan, atau kerja sama pemasangan iklan.',
    prioritas: '0.3',
    isi: `
      <p>Untuk pertanyaan, laporan kesalahan, atau kerja sama pemasangan iklan, silakan hubungi
         alamat surel di bawah atau isi formulirnya.</p>
      <p><strong>Surel:</strong> <a href="mailto:{{SUREL}}">{{SUREL}}</a></p>

      <div class="catatan" role="status">
        <strong>Formulir belum aktif pada demo ini.</strong>
        Demo ini disajikan sebagai berkas statis, dan berkas statis tidak bisa mengirim surel sendiri.
        Formulir di bawah mengirim ke <code>kontak.php</code>, yang sudah disertakan dalam paket ini
        dan akan bekerja begitu situs dipasang di hosting yang menjalankan PHP.
        Selama belum dipasang di sana, tombol kirim tidak akan mengirim apa pun — dan halaman ini
        tidak akan berpura-pura sudah mengirim.
      </div>

      <form class="kartu mt-5 grid gap-4" action="kontak.php" method="post">
        <div>
          <label class="label-kecil" for="k-nama">Nama</label>
          <input class="kotak-teks font-sans" type="text" id="k-nama" name="nama" maxlength="80" required>
        </div>
        <div>
          <label class="label-kecil" for="k-surel">Surel</label>
          <input class="kotak-teks font-sans" type="email" id="k-surel" name="surel" maxlength="120" required>
        </div>
        <div>
          <label class="label-kecil" for="k-pesan">Pesan</label>
          <textarea class="kotak-teks font-sans" id="k-pesan" name="pesan" rows="6" maxlength="4000" required></textarea>
        </div>
        <!-- perangkap bot sederhana: manusia tidak mengisi kolom tersembunyi ini -->
        <div class="hidden" aria-hidden="true">
          <label for="k-situs">Jangan diisi</label>
          <input type="text" id="k-situs" name="situs" tabindex="-1" autocomplete="off">
        </div>
        <div>
          <button class="tbl" type="submit">Kirim pesan</button>
          <span class="ml-2 text-[13px] text-tinta3 dark:text-kapur3">Aktif setelah dipasang di hosting PHP.</span>
        </div>
      </form>
    `
  }
];
