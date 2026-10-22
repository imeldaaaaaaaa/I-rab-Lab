# Bedah I‘rob — Starter v2 (Windows)

Fondasi LMS pembelajaran nahwu dan analisis i‘rob dengan Next.js, TypeScript, Tailwind CSS, dan Supabase. Versi ini menambahkan mode pengunjung, katalog materi dan latihan publik, serta impor paket konten JSON.

## Fitur pada versi ini

- Landing page dengan tombol belajar tanpa login.
- **Mode pengunjung:** membaca materi dan mengerjakan latihan tanpa akun. Isian hanya berada di state halaman dan tidak disimpan; refresh/menutup halaman menghapus isian.
- Katalog materi dan latihan publik.
- Ruang latihan yang meminta analisis tiap kata: kedudukan, status i‘rab/bina’, tanda/bentuk akhir, dan alasan gramatikal.
- Setelah jawaban dikirim, pembahasan terbuka. Skor otomatis hanya membandingkan teks kedudukan/status/tanda secara sederhana; alasan uraian tidak dinilai otomatis.
- Jika Supabase dikonfigurasi dan siswa login, percobaan pada soal yang sudah tersimpan di database dapat masuk ke tabel `attempts`. Pengunjung anonim tidak menulis hasil ke database.
- Admin dapat mengimpor paket materi dan soal JSON ke Supabase. Paket awal diimpor sebagai draft agar ditinjau terlebih dahulu.
- Paket konten awal berdasarkan rangkuman sumber: `content/bedah-irob-bab-awal.json`.
- SQL schema untuk profil, materi, bank soal, kelas, tugas, percobaan, progres, dan Row Level Security. Materi/soal berstatus `published` dapat dibaca secara anonim; perubahan konten tetap khusus admin.

**Status:** starter/MVP untuk pengembangan dan pengujian, belum diaudit untuk produksi. Validasi akademik tetap diperlukan sebelum kunci jawaban dipakai sebagai penilaian resmi. Fitur laporan guru, penugasan kelas lengkap, dan penilaian uraian fleksibel masih perlu disempurnakan.

## 1. Kebutuhan

- Windows 10/11
- Node.js 20.9 atau lebih baru: https://nodejs.org/
- VS Code: https://code.visualstudio.com/
- Supabase: https://supabase.com/
- GitHub dan Vercel untuk deployment nanti

## 2. Jalankan demo lokal terlebih dahulu

1. Ekstrak ZIP ke folder baru, misalnya `C:\Projects\bedah-irob-v2`.
2. Buka VS Code → **File → Open Folder** → pilih folder `bedah-irob` di dalam ZIP.
3. Buka **Terminal → New Terminal**.
4. Jalankan:

```bash
npm install
npm run dev
```

5. Buka http://localhost:3000.

Tanpa konfigurasi Supabase, halaman materi dan latihan menggunakan paket demo yang ada di folder `content`. Dalam mode ini, jawaban pengunjung tidak disimpan. Halaman impor hanya dapat memeriksa/pratinjau JSON; konten belum bisa disimpan untuk semua pengguna.

## 3. Hubungkan Supabase

1. Buat project di https://supabase.com/.
2. Buka pengaturan API project dan salin Project URL serta publishable/anon key.
3. Di folder project, salin `.env.example` menjadi `.env.local`.
4. Isi variabel berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

5. Buka **SQL Editor** di Supabase, salin seluruh isi `supabase/schema.sql`, lalu jalankan.
6. Restart server dengan `Ctrl + C`, lalu `npm run dev`.

**Keamanan:** jangan pernah menaruh service-role/secret key di variabel `NEXT_PUBLIC_*`, source code, atau GitHub. File `.env.local` sudah dikecualikan oleh `.gitignore`.

### Menetapkan akun admin

1. Daftar akun melalui `/login`.
2. Di Supabase SQL Editor, jalankan query berikut dengan mengganti email:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'email-admin-kamu@example.com'
);
```

Akun baru otomatis menjadi siswa. Peran guru juga dapat ditetapkan pengelola dengan mengganti `admin` menjadi `teacher` pada query di atas. Keluar lalu login kembali setelah peran berubah.

## 4. Impor materi dan soal dari paket awal

1. Buka `/login` dan masuk sebagai admin.
2. Buka `/admin/import`.
3. Pilih `content/bedah-irob-bab-awal.json` dari folder project. Salinan yang bisa diunduh juga tersedia di `/bedah-irob-bab-awal.json`.
4. Periksa daftar materi dan soal yang ditampilkan.
5. Klik **Impor ke database**.
6. Konten paket awal berstatus `draft`. Buka `/admin/materials` dan `/admin/questions`, periksa materi, rujukan halaman, analisis, dan kunci jawaban; ubah status menjadi `published` hanya setelah kamu menyetujui isinya.

Impor dapat dijalankan kembali: materi diperbarui berdasarkan `slug`; soal paket diperbarui berdasarkan `slug`. Jangan menghapus kolom `slug` pada tabel `questions`.

## 5. Tentang paket sumber awal

Paket pertama menggunakan sumber:

- **Judul:** *Intisari Kitab Al-Kawakib Al-Durriyyah Syarah Mutammimah Al-Jurumiyyah*
- **Penulis:** Iswandi El-Nisamy
- **Editor:** Tgk. Dr. Safriadi, MA.
- **Penerbit/tahun:** CV. Manhaji Medan, 2020
- **Bagian yang dirangkum:** pengertian kalam (hlm. 1–3), i‘rab dan bina’ (hlm. 7–11), pengenalan tanda i‘rab (hlm. 12–16).

Materi pada paket ditulis sebagai rangkuman dengan bahasa sendiri, sedangkan kalimat latihan dikembangkan baru dari kaidah yang relevan dan mencantumkan rujukan halaman. Paket ini tidak menyertakan ulang PDF atau menyalin isi buku secara penuh. Sebelum publikasi, tinjau kembali terminologi, ketepatan i‘rab, tanda, dan alasan gramatikal.

## 6. Mode pengunjung dan penyimpanan hasil

- Pengunjung yang tidak login dapat membuka `/materi` dan `/latihan`.
- Jawaban pengunjung tidak dikirim ke database dan tidak disimpan di localStorage/sessionStorage.
- Setelah halaman dimuat ulang, jawaban pengunjung hilang.
- Siswa yang login dapat menyimpan percobaan untuk soal yang telah diimpor dan dipublikasikan di Supabase.
- Skor otomatis saat ini hanya membandingkan teks kedudukan, status i‘rab/bina’, dan tanda. Alasan uraian tidak dinilai otomatis, dan skor bukan pengganti pemeriksaan guru.

## 7. GitHub dan Vercel (setelah uji lokal)

1. Pastikan project berjalan lokal dan SQL Supabase sudah disiapkan.
2. Buat repository GitHub. Upload **isi folder project** yang memiliki `package.json`, `app`, `lib`, `content`, dan `supabase`.
3. Pastikan `.env.local` tidak di-commit.
4. Di Vercel, impor repository tersebut.
5. Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di Environment Variables Vercel.
6. Deploy, lalu tes mode pengunjung, login siswa, impor admin, dan penyimpanan hasil.

## Checklist uji awal

- [ ] Homepage memiliki tombol belajar tanpa login.
- [ ] Pengunjung dapat membaca materi dan mengerjakan latihan.
- [ ] Jawaban pengunjung tidak tersimpan setelah halaman dimuat ulang.
- [ ] Materi dan soal publik hanya menampilkan status `published` setelah Supabase dikonfigurasi.
- [ ] Admin dapat mengimpor paket JSON setelah login dan role admin disetel.
- [ ] Materi dan soal hasil impor berstatus draft sampai ditinjau.
- [ ] Siswa login dapat menyimpan percobaan pada soal dari database.
- [ ] `.env.local` tidak terunggah ke GitHub.


## Paket kurikulum lengkap (versi konten 2)

Project ini sekarang menyertakan `content/bedah-irob-kurikulum-lengkap.json` dan file unduh publik `public/bedah-irob-kurikulum-lengkap.json`. Paket mencakup **46 materi/rangkuman** (termasuk penutup/panduan belajar) dan **45 latihan analisis kalimat** berdasarkan topik dan rentang halaman tercetak dari *Intisari Kitab Al-Kawakib Al-Durriyyah Syarah Mutammimah Al-Jurumiyyah*.

- Rangkuman memakai bahasa sendiri; isi kitab tidak disalin verbatim.
- Contoh kalimat latihan disusun untuk LMS dan tidak dimaksudkan sebagai kutipan contoh buku.
- Setiap materi/latihan disimpan sebagai `draft` pada paket impor supaya admin/pengajar meninjau konten dan kunci sebelum dipublikasikan.
- Saat belum ada Supabase, website memakai paket JSON lokal untuk demo. Setelah Supabase diaktifkan, konten harus diimpor melalui menu admin dan dipublikasikan setelah ditinjau.
- Beberapa bab nahwu memiliki perincian, syarat, dan khilaf yang tidak bisa diringkas seluruhnya dalam satu lesson; gunakan rujukan halaman pada tiap materi untuk verifikasi. Contoh bab kompleks ditandai untuk ditinjau sebelum penilaian resmi.

### Mengimpor paket lengkap

1. Login dengan akun admin setelah Supabase dikonfigurasi.
2. Buka **Impor konten**.
3. Pilih `public/bedah-irob-kurikulum-lengkap.json` (atau unduh dari tombol paket kurikulum lengkap).
4. Periksa jumlah materi/latihan dan daftar referensi.
5. Impor ke database. Paket tetap draft sehingga admin dapat meninjau dan menerbitkan materi/soal setelah validasi.
