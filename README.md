# Student Management System

## Deskripsi
Aplikasi Manajemen Data Siswa berbasis web. Pengguna dapat melihat, menambahkan, mengubah, dan menghapus data siswa melalui REST API. Frontend mengambil dan mengirim data menggunakan JavaScript `fetch()`.

## Teknologi yang Digunakan
- Backend: Express.js, MySQL (mysql2)
- Frontend: HTML, CSS, JavaScript (fetch API)
- Version control: Git & GitHub

## Struktur Data Siswa
```json
{
  "id": 1,
  "nis": "242510064",
  "nama": "Melvin Olivia",
  "kelas": "XII RPL",
  "jurusan": "Rekayasa Perangkat Lunak",
  "alamat": "Bogor"
}
```

## Cara Menjalankan Backend
1. Pastikan MySQL sudah berjalan.
2. Buat database dan tabel dengan menjalankan `sql/schema.sql` di MySQL (phpMyAdmin atau Laragon).
3. Sesuaikan kredensial database di `config/database.js` (host, user, password) kalau berbeda dari default.
4. Install:
   ```
   npm init -y
   npm install express mysql2 cors
   ```
5. Jalankan server:
   ```
   node server.js/npm start
   ```
6. Server berjalan di `http://localhost:3000`.

## Cara Menjalankan Frontend
1. Buka file `frontend/index.html` langsung di browser, atau jalankan lewat Live Server.
2. Pastikan backend (`server.js`) sudah berjalan lebih dulu di `http://localhost:3000`, karena frontend mengambil data dari sana.

## Daftar Endpoint API

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | /api/siswa | Menampilkan semua siswa |
| GET | /api/siswa/:id | Menampilkan satu siswa |
| POST | /api/siswa | Menambahkan siswa |
| PUT | /api/siswa/:id | Mengubah data siswa |
| DELETE | /api/siswa/:id | Menghapus siswa |

Contoh body untuk POST/PUT:
```json
{
  "nis": "242510064",
  "nama": "Melvin Olivia",
  "kelas": "XII RPL",
  "jurusan": "Rekayasa Perangkat Lunak",
  "alamat": "Bogor"
}
```

## Screenshot Aplikasi
> Tempel screenshot halaman daftar siswa, form tambah/edit, dan hasil pengujian Postman/Thunder Client di sini.
![test api get all](<Screenshot (103).png>)
![test api get by id](<Screenshot (104).png>)
![test api post](<Screenshot (105).png>)
![test api put](<Screenshot (106).png>)
![test api delete](<Screenshot (107).png>)

![fronted](<Screenshot (109).png>) 
![fronted](<Screenshot (110).png>) 
![fronted](<Screenshot (111).png>) 
![fronted](<Screenshot (112).png>) 
![fronted](<Screenshot (113).png>) 
![fronted](<Screenshot (114).png>) 
![fronted](<Screenshot (115).png>)
![fronted](<Screenshot (116).png>) 

## Identitas Pembuat
- Nama: _(Melvin Olivia)_
- Kelas: _(XII RPL)_