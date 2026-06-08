# Mangocek App — Project Specification

## 1. Project Overview

Mangocek App adalah aplikasi sistem pakar untuk diagnosa penyakit tanaman mangga yang juga dilengkapi fitur deteksi kualitas buah mangga menggunakan model CNN dan chatbot AI berbasis Google Gemini.

Tujuan utama proyek:

- Mendiagnosis penyakit tanaman mangga berdasarkan gejala.
- Menyimpan dan menampilkan hasil diagnosa dan prediksi.
- Mendeteksi kualitas buah mangga (Busuk, Masak, Muda) dari gambar.
- Menyediakan chatbot pertanian mangga untuk konsultasi.
- Mengelola data penyakit dan pengguna melalui dashboard admin.

## 2. Tech Stack

### Frontend

- React 19
- React Router DOM 7.6
- Material UI (MUI) 7
- SweetAlert2
- Package manager: npm
- Frontend directory: `frontend/`
- Static assets: `frontend/public/`
- Source code: `frontend/src/`

### Backend

- Node.js dengan Express 5
- Python 3 untuk inferensi CNN
- TensorFlow / Keras untuk model ML
- Multer untuk upload file gambar
- Package manager: npm untuk Node, pip untuk Python
- Backend directory: `backend/`

### Database

- MySQL 8.0
- Schema dan seed: `database/init.sql` dan `database/seed.sql`

### AI

- CNN model: `backend/cnn_model_mangga.h5`
- Chatbot AI: Google Gemini (`gemini-2.5-flash`)
- SDK: `@google/generative-ai`

### Containerization

- Docker
- Docker Compose
- Docker service definitions:
  - `docker-compose.yml` untuk development
  - `docker-compose.prod.yml` untuk production

### Cloud Target

- AWS EC2 untuk hosting Docker
- GCP Cloud Storage untuk upload foto prediksi (opsional)

## 3. Project Structure

```
mangocek-app/
├── backend/
│   ├── server.js               # Express API — endpoint utama (Node.js)
│   ├── app.py                  # Flask CNN inference server alternatif (tidak aktif di Docker)
│   ├── predict.py              # inferensi CNN via subprocess (dipakai production)
│   ├── check.py                # utilitas inspeksi model (model.summary)
│   ├── cnn_model_mangga.h5     # model CNN
│   ├── requirements.txt        # dependency Python
│   ├── package.json            # dependency Node backend
│   ├── .env.example            # template variabel lingkungan
│   └── uploads/                # file gambar sementara
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── config.js
│       ├── components/
│       │   ├── flipcard.js     # komponen flip card untuk info penyakit di landing
│       │   └── ...
│       └── pages/
├── database/
│   ├── init.sql                # schema tabel
│   └── seed.sql                # seed data 9 penyakit
├── docs/
│   ├── API.md
│   ├── AI.md
│   └── SDD.md
├── scripts/
│   └── setup-ec2.sh
├── docker-compose.yml
└── docker-compose.prod.yml
```

## 4. Main Features

### 4.1 User & Authentication

- Register akun baru (`POST /register`)
- Login pengguna (`POST /login`)
- Role pengguna:
  - `user`
  - `admin`
- Status login frontend disimpan di `localStorage`:
  - `isLoggedIn`
  - `user`

### 4.2 Sistem Pakar Diagnosa Gejala

- Halaman diagnosa gejala untuk tanaman mangga
- Menyimpan hasil diagnosa gejala (`POST /simpan-diagnosa`)
- Menampilkan riwayat hasil diagnosa (`GET /hasil-diagnosa`)
- Basis data penyakit mengandung gejala dan penanggulangan
- Admin dapat melakukan CRUD data penyakit

### 4.3 Deteksi Kualitas Buah Mangga (CNN)

- Upload gambar buah mangga di halaman deteksi
- Endpoint `POST /predict` mengembalikan:
  - `label` (`Busuk`, `Masak`, `Muda`)
  - `confidence` dalam persen
- Prediksi disimpan ke riwayat (`GET /prediksi-log`)
- Model dijalankan dengan Python via `predict.py`

### 4.4 Chatbot AI MangoBot

- Chatbot pertanian berbasis Google Gemini
- Endpoint `POST /chatbot`
- Mendukung multi-turn conversation dengan `history`
- Topik chatbot dibatasi pada pertanian mangga
- Respons disajikan dalam Bahasa Indonesia

### 4.5 Admin Dashboard

- Dashboard admin untuk mengelola:
  - data penyakit
  - daftar pengguna
- Hanya dapat diakses oleh pengguna dengan `role === 'admin'`
- Halaman admin menggunakan custom layout React, bukan Toolpad

### 4.6 Frontend Routing

- `/` → redirect ke `/landing`
- `/landing` → halaman landing publik
- `/deteksi` → halaman deteksi gambar (dengan guard login)
- `/pakar` → halaman diagnosa gejala (dengan guard login)
- `/dashboard` → admin dashboard (dengan guard admin)
- `*` → redirect ke `/landing`

## 5. API Endpoints

### Autentikasi & User

- `POST /register`
- `POST /login`
- `GET /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Knowledge Base & Diagnosa

- `GET /knowledge-base`
- `POST /simpan-diagnosa`
- `GET /hasil-diagnosa`
- `POST /penyakit`
- `PUT /penyakit/:id`
- `DELETE /penyakit/:id`

### CNN Prediction

- `POST /predict` (`multipart/form-data`)
- `GET /prediksi-log`

### Chatbot

- `POST /chatbot`

## 6. Backend Behavior

### CNN Inference Flow

- Gambar di-upload oleh frontend
- Multer menyimpan file sementara di `backend/uploads/`
- Node.js memanggil `python3 predict.py <path_gambar>` via `execFile`
- `predict.py` memuat model TensorFlow dan mengeksekusi prediksi
- Hasil stdout berformat `"label,confidence"` (contoh: `"Masak,0.9472"`) di-parse Node.js
- Confidence dikali 100 → ditampilkan sebagai persen
- **Alternatif (belum aktif):** `app.py` adalah Flask server persisten yang langsung expose endpoint `/predict`, namun belum diintegrasikan ke `docker-compose.yml`

### Chatbot Flow

- Frontend mengirim `message` dan `history` ke endpoint `/chatbot`
- Backend memanggil Google Gemini model
- Backend mengembalikan `reply` ke frontend

### Data Persistence

- Data disimpan di MySQL
- Schema mencakup tabel untuk:
  - users
  - penyakit
  - hasil diagnosa
  - prediksi log

## 7. Deployment & Run Modes

### Locally with Docker

- `docker compose up --build`
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Production

- `docker-compose -f docker-compose.prod.yml up -d --build`
- Frontend diakses pada port `80`
- Backend API pada port `5000`

### Environment Variables

- `backend/.env`:
  - `GEMINI_API_KEY`
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `GCS_BUCKET_NAME` (opsional untuk upload ke GCP)
  - `GCS_KEY_FILE` (opsional)
- Root `.env`:
  - `DB_ROOT_PASSWORD`
  - `DB_NAME`
  - `REACT_APP_API_URL`

## 8. Known Issues & Limitations

| Item | Prioritas | Status | Keterangan |
|------|-----------|--------|------------|
| Password plaintext | Tinggi | ✅ Selesai | bcrypt hashing di `/register`; auto-migrate plaintext lama saat login |
| Tidak ada auth middleware API | Tinggi | ✅ Selesai | JWT middleware `requireAdmin` pada semua endpoint admin CRUD |
| Login state di `localStorage` | Tinggi | ✅ Selesai | JWT token disimpan sebagai `authToken`; routes cek token, bukan string boolean |
| Model Python per-request | Medium | ✅ Selesai | Flask ML service terpisah (`ml-service`) memuat model sekali di Docker |
| `app.py` belum terintegrasi | Medium | ✅ Selesai | Diintegrasikan sebagai `ml-service` di docker-compose via `Dockerfile.ml` |
| AdminRoute redirect ke `/login` | Medium | ✅ Selesai | Redirect diperbaiki ke `/landing` |
| `cache.js` duplikat | Rendah | ✅ Selesai | Kedua file `pages/cache.js` dan `components/cache.js` sudah dihapus |
| `informasiPage.js` tidak terpakai | Rendah | ✅ Selesai | File dihapus dari repo |
| `check.py` hanya utilitas | Rendah | Open | Script `check.py` hanya mencetak `model.summary()`, bukan bagian dari flow produksi |
| npm audit warnings | Rendah | Open | ~55 vulnerabilities di frontend (berasal dari `react-scripts`, bukan kode aplikasi) |

## 9. Important Files

- `frontend/src/App.js`
- `frontend/src/config.js`
- `frontend/src/components/chatbot.js`
- `frontend/src/components/protectedRoute.js`
- `frontend/src/components/adminRoute.js`
- `frontend/src/pages/landingPage.js`
- `frontend/src/pages/pakarPage.js`
- `frontend/src/pages/deteksiPage.js`
- `frontend/src/pages/dashboardPage.js`
- `backend/server.js`
- `backend/predict.py`
- `backend/cnn_model_mangga.h5`
- `database/init.sql`
- `database/seed.sql`
- `docs/API.md`
- `docs/AI.md`
- `docker-compose.yml`
- `docker-compose.prod.yml`

## 10. Recommendation for Claude AI

Proyek ini adalah gabungan web app React + backend Node.js + Python ML + MySQL.
Fungsi utama dibagi antara sistem pakar gejala, deteksi gambar CNN, dan chatbot AI.

### Sudah Diimplementasikan

1. **Autentikasi dan keamanan API** — bcrypt untuk hashing password; JWT token dikembalikan saat login; middleware `authenticate` dan `requireAdmin` melindungi endpoint admin CRUD di `server.js`.
2. **Pemisahan ML service** — `app.py` (Flask) dijalankan sebagai `ml-service` Docker terpisah via `Dockerfile.ml`; model CNN dimuat sekali (persisten); `server.js` memanggil service via HTTP (`ML_SERVICE_URL`) dengan fallback ke subprocess jika variabel tidak di-set.
3. **UI/UX dashboard admin** — Stats bar kini menampilkan 4 kartu (pengguna, prediksi, penyakit, diagnosa) via endpoint `/stats`; username admin aktif ditampilkan di header; panel Diagnosa ditambahkan ke menu.
4. **Manajemen state login** — `authToken` (JWT) disimpan di `localStorage`; `ProtectedRoute` dan `AdminRoute` menggunakan token, bukan string `isLoggedIn`; `AdminRoute` redirect ke `/landing` (sudah diperbaiki dari `/login` yang tidak ada).

### Sudah Diimplementasikan (Lanjutan)

5. **Hapus file tidak terpakai** — `pages/cache.js`, `components/cache.js`, dan `informasiPage.js` dihapus dari repo.
6. **Sinkronisasi `pakarPage.js` dengan DB** — Tidak lagi menggunakan `knowledgeBase.json` statis; data dimuat dari `GET /knowledge-base` saat mount. Bug state async pada `handleDiagnosa` diperbaiki. Hasil diagnosa teratas disimpan otomatis via `POST /simpan-diagnosa`.
7. **Auth token ke `/predict`** — Endpoint `POST /predict` sekarang memerlukan JWT (`authenticate` middleware). `deteksiPage.js` dan `dashboardPage.js` mengirim header `Authorization`.
8. **Auto-logout saat token expired** — `App.js` mengecek expiry JWT (`payload.exp`) di setiap navigasi halaman; jika expired, localStorage dibersihkan dan user diarahkan ke `/landing`.

### Sisa Open Items

- `check.py` adalah utilitas developer (`model.summary()`), tidak perlu diubah
- npm audit warnings dari `react-scripts` — bukan kode aplikasi, tidak perlu ditangani
