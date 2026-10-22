# Bedah I'rab — Laboratorium Nahwu

Prototipe website interaktif untuk latihan membedah kata dalam bahasa Arab. Antarmuka berbahasa Indonesia dengan istilah Nahwu Arab, desain responsif, filter sumber latihan, pemilihan kata, form analisis, petunjuk, pemeriksaan jawaban, dan pembahasan singkat.

## Fitur pada versi 0.1

- Pilih latihan dari kategori kalimat umum, teks klasik bergaya pembelajaran, dan potongan Al-Qur'an.
- Klik kata pada kalimat Arab untuk memilih kata yang akan dianalisis.
- Isi jenis kata, kedudukan nahwu, status i'rab, dan tanda i'rab.
- Periksa jawaban terhadap kunci yang telah ditentukan.
- Tampilkan petunjuk dan penjelasan i'rab lengkap jika jawaban benar.
- Tata letak responsif untuk desktop dan ponsel.

## Teknologi

- Next.js App Router
- React + TypeScript
- CSS responsif tanpa library komponen tambahan
- Bank soal statis di `data/exercises.ts`

## Menjalankan di komputer

1. Pasang Node.js versi LTS.
2. Ekstrak folder proyek.
3. Buka terminal di folder `bedah-irab`.
4. Jalankan:

   ```bash
   npm install
   npm run dev
   ```

5. Buka `http://localhost:3000`.

Untuk memeriksa build produksi:

```bash
npm run build
```

## Mengubah dan menambah soal

Edit `data/exercises.ts`. Setiap latihan berisi:

- `id`: ID unik.
- `source`: `Umum`, `Teks klasik`, atau `Al-Qur'an`.
- `sentence`: kalimat Arab berharakat.
- `translation`: terjemahan.
- `context`: catatan pembelajaran.
- `words`: daftar kata dan kunci analisis.

Setiap objek kata memiliki `token`, `kind`, `position`, `state`, `sign`, `explanation`, dan `fullIrab`.

**Catatan akademik:** validasi bank jawaban dengan kitab nahwu/rujukan tepercaya sebelum menambahkan materi. Sebagian struktur bahasa Arab memiliki lebih dari satu analisis yang dapat diterima. Versi awal ini hanya menerima satu kombinasi jawaban per kata, jadi perlu diperluas untuk menerima alternatif jawaban yang sah.

## Deploy ke GitHub dan Vercel

### A. Unggah ke GitHub

Buat repository baru di GitHub, misalnya `bedah-irab`. Jangan tambahkan README dari GitHub jika sudah memakai README ini. Di terminal dalam folder proyek:

```bash
git init
git add .
git commit -m "Initial Bedah I'rab prototype"
git branch -M main
git remote add origin https://github.com/USERNAME/bedah-irab.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub kamu dan sesuaikan URL repository.

### B. Deploy ke Vercel

1. Masuk ke https://vercel.com/ lalu login dengan GitHub.
2. Pilih **Add New → Project**.
3. Import repository `bedah-irab`.
4. Pastikan framework terdeteksi sebagai **Next.js**.
5. Tidak perlu menambahkan environment variables untuk versi ini.
6. Klik **Deploy** dan tunggu proses build selesai.
7. Setiap push baru ke branch yang terhubung akan memicu deployment baru.

### C. Jika menggunakan GitHub Desktop

Alternatif untuk pengguna yang belum terbiasa dengan Git:

1. Ekstrak ZIP proyek.
2. Buka GitHub Desktop dan pilih **Add Existing Repository** atau **Create a New Repository**.
3. Commit file proyek lalu **Publish repository**.
4. Import repository tersebut di Vercel seperti langkah di atas.

## Batasan versi pertama

- Jawaban diperiksa dengan kunci statis, bukan AI.
- Progres hanya berada di state aplikasi; belum tersimpan lintas kunjungan/perangkat.
- Belum ada login, database, panel admin, atau editor bank soal.
- Contoh teks klasik `الْعِلْمُ نَافِعٌ` merupakan contoh buatan bergaya teks pembelajaran, bukan kutipan dari kitab tertentu.
- Contoh Al-Qur'an yang disertakan adalah `اللَّهُ الصَّمَدُ` dari QS. Al-Ikhlāṣ [112]: 2.

## Ide pengembangan berikutnya

1. Tambahkan alternatif jawaban benar dan penilaian per bidang.
2. Simpan progres ke `localStorage`, lalu migrasikan ke database jika perlu.
3. Tambahkan mode ujian dengan timer dan rekap hasil.
4. Tambahkan materi morfologi (ṣarf): akar kata, wazan, bentuk fi'il, dan perubahan ṣighah.
5. Tambahkan peta relasi antarkata.
6. Pertimbangkan Supabase untuk akun dan penyimpanan progres.
7. Jika kelak memakai AI, jadikan AI sebagai pemberi penjelasan tambahan; jangan jadikan jawabannya satu-satunya sumber kebenaran nahwu.
