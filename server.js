const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./config/database');

app.use(cors());
app.use(express.json());

// VALIDASI
function validasiSiswa(body, wajibSemua = true) {
    const { nis, nama, kelas, jurusan } = body;

    if (wajibSemua && (!nis || String(nis).trim() === '')) {
        return 'NIS wajib diisi';
    }

    if (wajibSemua && (!nama || String(nama).trim() === '')) {
        return 'Nama wajib diisi';
    }

    if (wajibSemua && (!kelas || String(kelas).trim() === '')) {
        return 'Kelas wajib diisi';
    }

    if (wajibSemua && (!jurusan || String(jurusan).trim() === '')) {
        return 'Jurusan wajib diisi';
    }

    return null;
}

// GET /api/siswa - Semua siswa
app.get('/api/siswa', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT id, nis, nama, kelas, jurusan, alamat FROM siswa ORDER BY id ASC'
        );

        res.status(200).json({
            status: true,
            message: 'Data siswa berhasil diambil',
            data: rows
        });
    } catch (error) {
        console.error('ERROR GET ALL:', error);
        res.status(500).json({
            status: false,
            message: 'Gagal mengambil data siswa'
        });
    }
});

// GET /api/siswa/:id - Satu siswa
app.get('/api/siswa/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const [rows] = await db.promise().query(
            'SELECT id, nis, nama, kelas, jurusan, alamat FROM siswa WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        res.status(200).json({
            status: true,
            message: 'Data siswa berhasil diambil',
            data: rows[0]
        });
    } catch (error) {
        console.error('ERROR GET BY ID:', error);
        res.status(500).json({
            status: false,
            message: 'Gagal mengambil data siswa'
        });
    }
});

// POST /api/siswa - Tambah siswa
app.post('/api/siswa', async (req, res) => {
    const { nis, nama, kelas, jurusan, alamat } = req.body;

    const errorValidasi = validasiSiswa(req.body, true);

    if (errorValidasi) {
        return res.status(400).json({
            status: false,
            message: errorValidasi
        });
    }

    try {
        const [cekNis] = await db.promise().query(
            'SELECT id FROM siswa WHERE nis = ?',
            [nis]
        );

        if (cekNis.length > 0) {
            return res.status(400).json({
                status: false,
                message: 'NIS sudah digunakan'
            });
        }

        const [result] = await db.promise().query(
            'INSERT INTO siswa (nis, nama, kelas, jurusan, alamat) VALUES (?, ?, ?, ?, ?)',
            [nis, nama, kelas, jurusan, alamat || null]
        );

        res.status(201).json({
            status: true,
            message: 'Siswa berhasil ditambahkan',
            data: { id: result.insertId, nis, nama, kelas, jurusan, alamat: alamat || null }
        });
    } catch (error) {
        console.error('ERROR POST:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: false, message: 'NIS sudah digunakan' });
        }

        res.status(500).json({
            status: false,
            message: 'Gagal menambahkan siswa'
        });
    }
});

// PUT /api/siswa/:id - Ubah siswa
app.put('/api/siswa/:id', async (req, res) => {
    const id = req.params.id;
    const { nis, nama, kelas, jurusan, alamat } = req.body;

    const errorValidasi = validasiSiswa(req.body, true);

    if (errorValidasi) {
        return res.status(400).json({
            status: false,
            message: errorValidasi
        });
    }

    try {
        const [siswa] = await db.promise().query(
            'SELECT id FROM siswa WHERE id = ?',
            [id]
        );

        if (siswa.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        const [cekNis] = await db.promise().query(
            'SELECT id FROM siswa WHERE nis = ? AND id != ?',
            [nis, id]
        );

        if (cekNis.length > 0) {
            return res.status(400).json({
                status: false,
                message: 'NIS sudah digunakan siswa lain'
            });
        }

        await db.promise().query(
            'UPDATE siswa SET nis = ?, nama = ?, kelas = ?, jurusan = ?, alamat = ? WHERE id = ?',
            [nis, nama, kelas, jurusan, alamat || null, id]
        );

        res.status(200).json({
            status: true,
            message: 'Data siswa berhasil diupdate'
        });
    } catch (error) {
        console.error('ERROR PUT:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: false, message: 'NIS sudah digunakan siswa lain' });
        }

        res.status(500).json({
            status: false,
            message: 'Gagal mengupdate siswa'
        });
    }
});

// DELETE /api/siswa/:id - Hapus siswa
app.delete('/api/siswa/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await db.promise().query(
            'DELETE FROM siswa WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        res.status(200).json({
            status: true,
            message: 'Siswa berhasil dihapus'
        });
    } catch (error) {
        console.error('ERROR DELETE:', error);
        res.status(500).json({
            status: false,
            message: 'Gagal menghapus siswa'
        });
    }
});

// SERVER
const server = app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error('Port 3000 sudah dipakai. Matikan proses node lain lalu jalankan ulang.');
    } else {
        console.error('Server gagal jalan:', error);
    }
    process.exit(1);
});