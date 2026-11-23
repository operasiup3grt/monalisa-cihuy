# Monalisa · Portal Operasi UP3 Garut

Satu jendela untuk **SAIDI SAIFI, FGTM, HAR Proteksi, Koreksi APKT, Setting REC/SSO, Kinerja UP3, dan Pustaka Opdist**.
Aplikasi lama ditampilkan apa adanya, jadi semua fiturnya tetap ada. Tidak ada backend, database, atau pengaturan Google.

## Coba langsung
Klik dua kali `index.html` untuk membukanya di Chrome.

## Cara pakai
- **Halaman awal:** klik **Buka semua aplikasi**. Aplikasi pertama langsung tampil, sisanya dimuat di belakang layar.
- **Daftar di kiri** selalu tampil. Klik untuk menampilkan aplikasi di layar kanan (layar penuh).
  Titik di pojok ikon menunjukkan status: abu-abu = belum dibuka, kuning = memuat, hijau = siap.
- **Seret di dalam daftar** untuk mengubah urutan. Urutan tersimpan otomatis.
- **Seret ke layar kanan** untuk membagi layar: lepas di sisi *kiri* atau *kanan*.
  Garis tengahnya bisa digeser. Panel yang bergaris emas adalah panel aktif, dan klik pada daftar akan mengganti panel itu.
  Di atas tiap panel ada tombol **Tukar**, **Layar penuh**, dan **Muat ulang**.
- Tombol di bawah daftar: Bagi layar, Muat ulang, Buka di tab browser, **Tutup semua**, Kecilkan panel (daftar jadi ikon saja).

## Menutup
- **Satu aplikasi:** arahkan kursor ke aplikasi di daftar kiri, lalu klik **×** (atau klik tengah). Saat bagi layar, bisa juga lewat tombol **Tutup** di atas panel.
  Aplikasi yang ditutup benar-benar dilepas dari memori, dan titiknya kembali abu-abu.
- **Semua aplikasi:** tombol **Tutup semua** di kiri bawah, kembali ke halaman awal.
- **Selesai bekerja:** tutup tab atau jendela Monalisa seperti biasa. Semua aplikasi di dalamnya ikut tertutup karena tidak ada yang berjalan di luar halaman ini.
- **Saat dibuka lagi**, Monalisa mulai dari halaman awal dan **tidak ada aplikasi yang langsung dimuat**. Yang diingat hanya urutan daftar, posisi garis bagi layar, dan ukuran panel kiri.
- Aplikasi yang sudah dibuka **tidak dimuat ulang** saat berpindah. Posisi dan isiannya tetap.
- **Pasang sebagai aplikasi** (tautan di halaman awal, setelah di-deploy ke https): Monalisa punya jendela dan ikon sendiri, terpisah dari tab Chrome.

## Deploy ke Vercel (±5 menit)
- **Lewat GitHub:** upload isi folder ini ke repo baru → Vercel *Add New → Project → Import* → Framework Preset **Other** → *Deploy*.
- **Lewat terminal:** di dalam folder ini jalankan `npx vercel --prod`.

Lalu di *Settings → Domains*, tambahkan alamat baru (misalnya `monalisa.portalgarut5.web.id`). Domain utama tidak berubah.

## Menambah atau mengubah aplikasi
Di `index.html`, cari `const APLIKASI = [ ... ]`, lalu tambah atau ubah barisnya (id, nama, keterangan, singkatan, warna, url).

## Latar halaman awal
Langit malam dan siluet pegunungan (CSS/SVG), ditambah adegan 3D jalur transmisi SUTT yang dibuat dari nol dengan three.js:
tower kisi, kawat berlendut, dan pulsa energi yang mengalir. Kamera bergerak pelan menyusuri jalur dan sedikit mengikuti gerakan mouse.
- Animasi **hanya berjalan saat halaman awal terlihat**. Begitu aplikasi dibuka, atau jendela diminimalkan, animasinya berhenti total.
- **Mobil terbang** (desain original): badan gelap metalik dengan garis tepi menyala, kanopi kaca, lampu garis depan dan belakang,
  pendorong bercahaya, dan jejak cahaya. Muncul bergantian setiap beberapa detik dengan tiga gaya terbang:
  menyalip dari belakang kamera, berpapasan dan lewat di atas kamera, atau melintas di kejauhan sambil menikung.
- Kalau three.js gagal dimuat (misalnya offline), latar tetap tampil tanpa 3D.
- Kalau pengaturan sistem "kurangi gerakan" aktif, adegannya diam.
- Optimasi: semua tower satu jalur digambar sekaligus, resolusi menyesuaikan kemampuan perangkat secara otomatis,
  dan kanvas hanya diukur ulang saat ukurannya benar-benar berubah. Isi adegannya tidak dikurangi.

## Di HP
- Tinggi halaman mengikuti area layar yang benar-benar terlihat (bilah alamat dan tombol navigasi HP tidak menutupi bagian bawah).
- Adegan 3D digambar 30 fps dengan resolusi 1× dan tanpa antialias. Isi adegannya sama.
- Saat layar di-zoom (pinch), animasi 3D dan bintang berhenti sampai tampilan kembali normal, supaya tidak hang.
- Aplikasi yang sedang tidak tampil tidak ikut digambar ulang.
- Tombol **Lebarkan panel** (paling bawah) membuka panel kiri sebagai laci di atas tampilan, lengkap dengan nama dan keterangan tiap aplikasi.
  Laci tertutup sendiri setelah aplikasi dipilih, atau bisa ditutup dengan mengetuk area gelap di sebelah kanan.

## Catatan
- Waktu muat tiap aplikasi mengikuti Apps Script, sekitar 7–8 detik.
- Seret-lepas berlaku di laptop atau PC. Di layar kecil, daftar otomatis jadi ikon dan bagi layar dinonaktifkan.
- Login portal lama tidak ikut. Kelima subdomain memang bisa dibuka tanpa login, sama seperti sekarang.
