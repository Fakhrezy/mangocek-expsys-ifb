# Dokumentasi API — Mangocek App

Base URL (lokal): `http://localhost:5000`  
Base URL (production): `http://<IP_EC2>:5000`

Semua request dan response menggunakan format **JSON**, kecuali endpoint `/predict` yang menerima `multipart/form-data`.

---

## Daftar Endpoint

| Metode | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/register` | Daftar akun baru |
| POST | `/login` | Login pengguna |
| POST | `/predict` | Prediksi kualitas buah mangga (CNN) |
| GET | `/prediksi-log` | Riwayat hasil prediksi |
| POST | `/simpan-diagnosa` | Simpan hasil diagnosa gejala |
| GET | `/hasil-diagnosa` | Riwayat hasil diagnosa gejala |
| GET | `/knowledge-base` | Ambil semua data penyakit + gejala + pengendalian |
| POST | `/penyakit` | Tambah data penyakit baru |
| PUT | `/penyakit/:id` | Edit data penyakit |
| DELETE | `/penyakit/:id` | Hapus data penyakit |
| GET | `/users` | Daftar semua pengguna |
| PUT | `/users/:id` | Edit data pengguna |
| DELETE | `/users/:id` | Hapus pengguna |
| POST | `/chatbot` | Kirim pesan ke MangoBot (AI) |

---

## Autentikasi

### `POST /register`

Mendaftarkan akun pengguna baru.

**Request Body**

```json
{
  "username": "budi",
  "email": "budi@email.com",
  "password": "rahasia123"
}
```

**Response — 201 Created**

```json
{
  "message": "Registrasi berhasil"
}
```

**Response — 400 Bad Request** (email sudah terdaftar)

```json
{
  "message": "Email sudah terdaftar"
}
```

**Response — 400 Bad Request** (field tidak lengkap)

```json
{
  "message": "Semua field wajib diisi (username, email, password)."
}
```

---

### `POST /login`

Login menggunakan email dan password.

**Request Body**

```json
{
  "email": "budi@email.com",
  "password": "rahasia123"
}
```

**Response — 200 OK**

```json
{
  "message": "Login berhasil",
  "user": {
    "id": 2,
    "username": "budi",
    "email": "budi@email.com",
    "role": "user"
  }
}
```

> Nilai `role` bisa `"user"` atau `"admin"`. Admin mendapat akses ke halaman dashboard.

**Response — 401 Unauthorized**

```json
{
  "message": "Email atau password salah"
}
```

---

## Prediksi CNN

### `POST /predict`

Mengirimkan gambar buah mangga untuk diprediksi kualitasnya menggunakan model CNN.

**Content-Type:** `multipart/form-data`

**Form Field**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `image` | File (gambar) | Foto buah mangga (JPG/PNG) |

**Contoh dengan cURL**

```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@/path/to/mangga.jpg"
```

**Response — 200 OK**

```json
{
  "label": "Masak",
  "confidence": 94.72
}
```

> Nilai `confidence` dalam persen (0–100).  
> Nilai `label` adalah salah satu dari: `"Busuk"`, `"Masak"`, `"Muda"`.

**Response — 400 Bad Request**

```json
{
  "error": "Gambar tidak ditemukan."
}
```

**Response — 500 Internal Server Error**

```json
{
  "error": "Error saat prediksi gambar"
}
```

---

### `GET /prediksi-log`

Mengambil seluruh riwayat prediksi, diurutkan dari yang terbaru.

**Response — 200 OK**

```json
[
  {
    "id": 5,
    "label": "Masak",
    "confidence": 94.72,
    "nama_file": "mangga.jpg",
    "waktu": "2026-06-04T10:30:00.000Z"
  },
  {
    "id": 4,
    "label": "Busuk",
    "confidence": 88.13,
    "nama_file": "foto2.png",
    "waktu": "2026-06-04T09:15:00.000Z"
  }
]
```

---

## Diagnosa Gejala

### `POST /simpan-diagnosa`

Menyimpan hasil diagnosa berbasis gejala dari halaman Pakar.

**Request Body**

```json
{
  "nama_penyakit": "Antraknose",
  "skor": 0.85,
  "gejala": ["Daun gugur", "Bunga terlihat bintik-bintik kecil"]
}
```

**Response — 200 OK**

```json
{
  "message": "Diagnosa berhasil disimpan."
}
```

---

### `GET /hasil-diagnosa`

Mengambil riwayat hasil diagnosa gejala, diurutkan dari yang terbaru.

**Response — 200 OK**

```json
[
  {
    "id": 1,
    "nama_penyakit": "Antraknose",
    "skor": 0.85,
    "gejala_terpilih": ["Daun gugur", "Bunga terlihat bintik-bintik kecil"],
    "waktu": "2026-06-04T08:00:00.000Z"
  }
]
```

---

## Knowledge Base (Penyakit)

### `GET /knowledge-base`

Mengambil seluruh data penyakit beserta gejala dan cara pengendaliannya.

**Response — 200 OK**

```json
[
  {
    "id": 1,
    "nama": "Antraknose",
    "gejala": [
      { "id": 1, "id_penyakit": 1, "deskripsi": "Daun gugur" },
      { "id": 2, "id_penyakit": 1, "deskripsi": "Daun kering" }
    ],
    "pengendalian": [
      "Semprotkan fungisida berbahan aktif mankozeb",
      "Pangkas dan bakar bagian tanaman yang terinfeksi"
    ]
  }
]
```

---

### `POST /penyakit`

Menambahkan data penyakit baru ke knowledge base.

**Request Body**

```json
{
  "nama": "Embun Tepung",
  "gejala": [
    "Daun tertutup lapisan putih seperti tepung",
    "Daun menggulung dan mengering"
  ],
  "pengendalian": [
    "Semprotkan fungisida sistemik",
    "Buang daun yang terinfeksi"
  ]
}
```

**Response — 201 Created**

```json
{
  "message": "Penyakit berhasil ditambahkan"
}
```

---

### `PUT /penyakit/:id`

Memperbarui data penyakit beserta gejala dan pengendaliannya. Gejala dan pengendalian lama akan diganti seluruhnya.

**URL Parameter:** `id` — ID penyakit

**Request Body**

```json
{
  "nama": "Antraknose (diperbarui)",
  "gejala": [
    "Daun gugur",
    "Buah terdapat bercak hitam"
  ],
  "pengendalian": [
    "Semprotkan fungisida mankozeb setiap 7 hari"
  ]
}
```

**Response — 200 OK**

```json
{
  "message": "Penyakit diperbarui"
}
```

---

### `DELETE /penyakit/:id`

Menghapus data penyakit beserta seluruh gejala dan pengendaliannya (cascade delete).

**URL Parameter:** `id` — ID penyakit

**Response — 200 OK**

```json
{
  "message": "Penyakit dihapus"
}
```

---

## Manajemen Pengguna

### `GET /users`

Mengambil daftar semua pengguna (tanpa password).

**Response — 200 OK**

```json
{
  "users": [
    { "id": 1, "username": "admin", "email": "admin@mangocek.com" },
    { "id": 2, "username": "budi", "email": "budi@email.com" }
  ]
}
```

---

### `PUT /users/:id`

Memperbarui username dan email pengguna.

**URL Parameter:** `id` — ID pengguna

**Request Body**

```json
{
  "username": "budi_baru",
  "email": "budi_baru@email.com"
}
```

**Response — 200 OK**

```json
{
  "message": "User diperbarui"
}
```

---

### `DELETE /users/:id`

Menghapus akun pengguna.

**URL Parameter:** `id` — ID pengguna

**Response — 200 OK**

```json
{
  "message": "User dihapus"
}
```

---

## Chatbot AI

### `POST /chatbot`

Mengirimkan pesan ke MangoBot dan mendapatkan balasan dari Gemini AI. Mendukung riwayat percakapan multi-giliran.

**Request Body**

```json
{
  "message": "Apa gejala penyakit antraknose pada mangga?",
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "Halo" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Halo! Ada yang bisa saya bantu seputar tanaman mangga?" }]
    }
  ]
}
```

> Field `history` bersifat opsional. Kirim array kosong `[]` atau hilangkan field ini untuk percakapan baru.

**Response — 200 OK**

```json
{
  "reply": "Antraknose pada mangga ditandai dengan munculnya bercak coklat kehitaman pada buah, daun, dan bunga..."
}
```

**Response — 400 Bad Request**

```json
{
  "error": "Pesan tidak boleh kosong."
}
```

**Response — 500 Internal Server Error**

```json
{
  "error": "Gagal mendapatkan respons dari AI."
}
```

---

## Skema Database

```
users          → id, username, email, password, role
penyakit       → id, nama
gejala         → id, id_penyakit (FK), deskripsi
pengendalian   → id, id_penyakit (FK), tindakan
hasil_diagnosa → id, nama_penyakit, skor, gejala_terpilih (JSON), waktu
prediksi_log   → id, label, confidence, nama_file, waktu
```

Tabel `gejala` dan `pengendalian` menggunakan `ON DELETE CASCADE` — saat penyakit dihapus, semua gejala dan pengendalian terkait ikut terhapus otomatis.

---

## Kode Status HTTP

| Kode | Arti |
|------|------|
| 200 | Berhasil |
| 201 | Data berhasil dibuat |
| 400 | Request tidak valid / field kosong |
| 401 | Kredensial salah |
| 500 | Kesalahan internal server |
