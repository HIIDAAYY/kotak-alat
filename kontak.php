<?php
/**
 * Penangan formulir kontak Kotak Alat.
 *
 * Dipakai bila situs dipasang di hosting yang menjalankan PHP.
 * Di Vercel berkas ini tidak dieksekusi — halaman /kontak menyatakan hal itu
 * apa adanya dan tidak berpura-pura mengirim apa pun.
 *
 * Yang dijaga di sini:
 *  - hanya menerima POST
 *  - semua masukan divalidasi dan dibatasi panjangnya
 *  - CR/LF ditolak pada seluruh nilai yang menyentuh header surel
 *    (perlindungan terhadap header injection)
 *  - alamat From memakai domain sendiri; alamat pengirim hanya dipakai
 *    sebagai Reply-To setelah lolos FILTER_VALIDATE_EMAIL
 *  - perangkap bot berupa kolom tersembunyi
 *  - isi pesan masuk ke BODY, tidak pernah ke header
 */

declare(strict_types=1);

/* ============ SETELAN — sesuaikan sebelum dipasang ============ */
const TUJUAN      = 'halo@contoh-domain.id';   // alamat penerima
const DOMAIN_KIRIM = 'contoh-domain.id';       // domain milik sendiri untuk From
const MAKS_NAMA   = 80;
const MAKS_SUREL  = 120;
const MAKS_PESAN  = 4000;
/* ============================================================== */

/** Hitung panjang teks. mbstring tidak selalu terpasang di shared hosting. */
function panjang(string $teks): int
{
    return function_exists('mb_strlen') ? mb_strlen($teks, 'UTF-8') : strlen($teks);
}

/** Tolak nilai yang memuat CR atau LF: itu bahan baku header injection. */
function bersih_satu_baris(string $nilai): string
{
    if (preg_match('/[\r\n]/', $nilai) === 1) {
        return '';
    }
    return trim($nilai);
}

/** Tampilkan halaman balasan sederhana lalu berhenti. */
function balas(int $kode, string $judul, string $pesan): void
{
    http_response_code($kode);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    $judul = htmlspecialchars($judul, ENT_QUOTES, 'UTF-8');
    $pesan = htmlspecialchars($pesan, ENT_QUOTES, 'UTF-8');
    echo <<<HTML
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{$judul} — Kotak Alat</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/assets/kotakalat.css">
</head>
<body class="min-h-screen">
  <div class="wadah py-12">
    <h1>{$judul}</h1>
    <p class="max-w-[68ch] text-tinta2 dark:text-kapur2">{$pesan}</p>
    <p class="mt-6"><a href="/kontak">Kembali ke halaman kontak</a> · <a href="/">Beranda</a></p>
  </div>
</body>
</html>
HTML;
    exit;
}

/* --- hanya POST --- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    balas(405, 'Metode tidak didukung', 'Halaman ini hanya menerima pengiriman formulir.');
}

/* --- perangkap bot: kolom tersembunyi harus kosong --- */
if (trim((string)($_POST['situs'] ?? '')) !== '') {
    /* jawaban sengaja terlihat normal supaya bot tidak belajar */
    balas(200, 'Terima kasih', 'Pesan Anda sudah kami terima.');
}

/* --- ambil dan validasi masukan --- */
$nama  = bersih_satu_baris((string)($_POST['nama'] ?? ''));
$surel = bersih_satu_baris((string)($_POST['surel'] ?? ''));
$pesan = trim((string)($_POST['pesan'] ?? ''));

$salah = [];

if ($nama === '') {
    $salah[] = 'Nama wajib diisi dan tidak boleh memuat baris baru.';
} elseif (panjang($nama) > MAKS_NAMA) {
    $salah[] = 'Nama melebihi ' . MAKS_NAMA . ' karakter.';
}

if ($surel === '' || filter_var($surel, FILTER_VALIDATE_EMAIL) === false) {
    $salah[] = 'Alamat surel tidak sah.';
} elseif (panjang($surel) > MAKS_SUREL) {
    $salah[] = 'Alamat surel melebihi ' . MAKS_SUREL . ' karakter.';
}

if ($pesan === '') {
    $salah[] = 'Pesan wajib diisi.';
} elseif (panjang($pesan) > MAKS_PESAN) {
    $salah[] = 'Pesan melebihi ' . MAKS_PESAN . ' karakter.';
}

if ($salah !== []) {
    balas(400, 'Pengiriman ditolak', implode(' ', $salah));
}

/* --- susun surel ---
   Subjek dan header hanya memuat nilai yang sudah dipastikan satu baris.
   Nama pengirim tidak dimasukkan ke header sama sekali; ia masuk ke body. */
$subjek = 'Pesan kontak dari situs';

$dari = 'no-reply@' . DOMAIN_KIRIM;

$header = [
    'From: Kotak Alat <' . $dari . '>',
    'Reply-To: <' . $surel . '>',   /* sudah lolos FILTER_VALIDATE_EMAIL */
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . phpversion(),
];

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? '-');
$waktu = gmdate('Y-m-d H:i:s') . ' UTC';

$badan = "Nama  : {$nama}\n"
       . "Surel : {$surel}\n"
       . "Waktu : {$waktu}\n"
       . "IP    : {$ip}\n"
       . "\n----------------------------------------\n\n"
       . $pesan . "\n";

$terkirim = @mail(
    TUJUAN,
    $subjek,
    $badan,
    implode("\r\n", $header),
    '-f' . $dari
);

if ($terkirim === false) {
    balas(
        500,
        'Pesan gagal dikirim',
        'Server tidak berhasil mengirim surel. Silakan hubungi langsung ke ' . TUJUAN . '.'
    );
}

balas(
    200,
    'Terima kasih',
    'Pesan Anda sudah dikirim. Kami membalas ke alamat ' . $surel . '.'
);
