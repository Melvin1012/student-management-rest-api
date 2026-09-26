const API = 'http://localhost:3000/api/siswa';
let siswaList = [];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg, ok = true) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.toggle('err', !ok);
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2800);
}

const pill = (t, tone) => {
  const el = document.getElementById('pill');
  el.textContent = t;
  el.className = 'pill ' + tone;
};

async function errMsg(res, fallback) {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

// ---------- GET semua siswa ----------
async function fetchSiswa() {
  const t0 = performance.now();
  document.getElementById('refresh').classList.add('spin');
  pill('Menghubungi...', 'wait');

  try {
    const res = await fetch(API);

    if (!res.ok) {
      pill(res.status + ' Error', 'err');
      const msg = await errMsg(res, 'Gagal mengambil data siswa');
      document.getElementById('list').innerHTML = `<tr class="empty-row"><td colspan="6">${esc(msg)}</td></tr>`;
      document.getElementById('total').textContent = 0;
      document.getElementById('meta').textContent = '';
      return;
    }

    const result = await res.json();
    siswaList = result.data || [];
    pill('200 OK · ' + Math.round(performance.now() - t0) + 'ms', 'ok');
    render();

  } catch (error) {
    pill('Server mati', 'err');
    document.getElementById('list').innerHTML = '<tr class="empty-row"><td colspan="6">Server tidak bisa dihubungi. Pastikan node server.js sudah jalan.</td></tr>';
    document.getElementById('total').textContent = 0;
    document.getElementById('meta').textContent = '';
  } finally {
    document.getElementById('refresh').classList.remove('spin');
  }
}

// ---------- Render tabel ----------
function render() {
  const q = document.getElementById('q').value.toLowerCase();
  const shown = siswaList.filter(s =>
    (s.nis || '').toLowerCase().includes(q) ||
    (s.nama || '').toLowerCase().includes(q) ||
    (s.kelas || '').toLowerCase().includes(q)
  );

  document.getElementById('total').textContent = siswaList.length;
  document.getElementById('meta').textContent = `Menampilkan ${shown.length} dari ${siswaList.length} siswa`;

  const tbody = document.getElementById('list');

  if (shown.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">${siswaList.length ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada data siswa. Klik "Tambah Siswa" untuk membuat yang pertama.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = shown.map(s => `
    <tr>
      <td><span class="nis-pill">${esc(s.nis)}</span></td>
      <td class="nama-cell">${esc(s.nama)}</td>
      <td>${esc(s.kelas)}</td>
      <td>${esc(s.jurusan)}</td>
      <td>${s.alamat ? esc(s.alamat) : '<span class="muted">-</span>'}</td>
      <td>
        <div class="acts">
          <button class="ico edit" data-id="${s.id}" title="Edit"><span class="material-symbols-outlined">edit</span></button>
          <button class="ico del" data-id="${s.id}" title="Hapus"><span class="material-symbols-outlined">delete</span></button>
        </div>
      </td>
    </tr>`).join('');
}

// ---------- Modal ----------
function openModal(s) {
  document.getElementById('form').reset();
  document.getElementById('sid').value = s ? s.id : '';
  document.getElementById('nis').value = s ? s.nis : '';
  document.getElementById('nama').value = s ? s.nama : '';
  document.getElementById('kelas').value = s ? s.kelas : '';
  document.getElementById('jurusan').value = s ? s.jurusan : '';
  document.getElementById('alamat').value = s ? (s.alamat || '') : '';
  document.getElementById('modalTitle').textContent = s ? 'Edit Siswa' : 'Tambah Siswa';
  document.getElementById('modal').classList.add('open');
  document.getElementById('nis').focus();
}
const closeModal = () => document.getElementById('modal').classList.remove('open');

// ---------- Simpan (POST / PUT) ----------
document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('sid').value;
  const nis = document.getElementById('nis').value.trim();
  const nama = document.getElementById('nama').value.trim();
  const kelas = document.getElementById('kelas').value.trim();
  const jurusan = document.getElementById('jurusan').value.trim();
  const alamat = document.getElementById('alamat').value.trim();
  const baru = id === '';

  if (!nis) return toast('NIS wajib diisi', false);
  if (!nama) return toast('Nama wajib diisi', false);
  if (!kelas) return toast('Kelas wajib diisi', false);
  if (!jurusan) return toast('Jurusan wajib diisi', false);

  try {
    const res = await fetch(baru ? API : `${API}/${id}`, {
      method: baru ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nis, nama, kelas, jurusan, alamat })
    });

    const result = await res.json();

    if (!res.ok) {
      toast(result.message || (baru ? 'Gagal menambahkan siswa' : 'Gagal mengupdate siswa'), false);
      return;
    }

    toast(result.message || (baru ? 'Siswa berhasil ditambahkan' : 'Data siswa berhasil diupdate'));
    closeModal();
    fetchSiswa();

  } catch (error) {
    toast('Server tidak bisa dihubungi', false);
  }
});

// ---------- Edit & Hapus ----------
document.getElementById('list').addEventListener('click', async function (e) {
  const editBtn = e.target.closest('.edit');
  const delBtn = e.target.closest('.del');

  if (editBtn) {
    const s = siswaList.find(x => x.id == editBtn.dataset.id);
    if (s) openModal(s); else toast('Data siswa tidak ditemukan', false);
  }

  if (delBtn) {
    const id = delBtn.dataset.id;
    const s = siswaList.find(x => x.id == id);
    if (!confirm(`Hapus ${s ? s.nama : 'siswa ini'} dari data?`)) return;

    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (!res.ok) {
        toast(result.message || 'Gagal menghapus siswa', false);
        return;
      }

      toast(result.message || 'Siswa berhasil dihapus');
      fetchSiswa();

    } catch (error) {
      toast('Server tidak bisa dihubungi', false);
    }
  }
});

// ---------- Event lain ----------
document.getElementById('btnAdd').addEventListener('click', () => openModal(null));
document.getElementById('refresh').addEventListener('click', fetchSiswa);
document.getElementById('q').addEventListener('input', render);
document.getElementById('btnClose').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

fetchSiswa();