/** Konfigurasi Tailwind untuk Kotak Alat.
 *  Warna diambil apa adanya dari CSS tulisan tangan versi lama,
 *  supaya tampilannya tidak berubah — hanya cara menulisnya yang pindah. */
module.exports = {
  content: [
    './*.html',
    './src/template/*.html',
    './src/data/*.js',
    './assets/**/*.js'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kertas:  '#ffffff', kertas2: '#f6f7f9', kertas3: '#eef0f3',
        tinta:   '#16181d', tinta2:  '#5b616e', tinta3:  '#8a919e',
        garis:   '#dfe2e8', aksen:   '#1f6feb', aksenTx: '#ffffff',
        sahih:   '#0a7d3f', rusak:   '#c0392b', slot:    '#f0f1f4',

        gelap:   '#0f1115', gelap2:  '#161920', gelap3:  '#1d212a',
        kapur:   '#e6e8ec', kapur2:  '#a2a9b6', kapur3:  '#727a88',
        garisG:  '#272c36', aksenG:  '#4c8dff', aksenGTx:'#08101f',
        sahihG:  '#3ddc84', rusakG:  '#ff6b5e'
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },
      maxWidth: { isi: '1080px' }
    }
  },
  plugins: []
};
