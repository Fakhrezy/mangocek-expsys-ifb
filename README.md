# Mangocek APP

Aplikasi sistem pakar untuk mendiagnosis penyakit tanaman mangga berdasarkan gejala-gejala yang terjadi beserta penanggulangannya.

## Struktur Proyek

```
mangocek-app/
├── frontend/       # React (UI)
├── backend/        # Node.js + Python (API & ML)
├── database/       # Schema MySQL
└── docker-compose.yml
```

---

## Cara Menjalankan

### Opsi 1: Menggunakan Docker (Direkomendasikan)

**Prasyarat:** Docker Desktop sudah terinstall dan berjalan.

```bash
# Build dan jalankan semua service sekaligus
docker compose up --build
```

| Service  | URL                   |
|----------|-----------------------|
| Aplikasi | http://localhost:3000 |
| API      | http://localhost:5000 |

> **Catatan:** Build pertama membutuhkan waktu 10-20 menit karena mengunduh TensorFlow (~600MB).

Perintah lainnya:

```bash
# Jalankan di background
docker compose up --build -d

# Lihat log
docker compose logs -f

# Hentikan semua service
docker compose down

# Hentikan dan hapus data database
docker compose down -v
```

Akun admin default:
- Email: `admin@mangocek.com`
- Password: `admin123`

---

### Opsi 2: Menjalankan Secara Lokal

**Prasyarat:**
- Node.js v18+
- Python 3.9+
- MySQL
- pip

#### 1. Siapkan Database

Buat database MySQL dan jalankan schema:

```sql
CREATE DATABASE mangocek_db;
```

Kemudian import schema dari `database/init.sql`:

```bash
mysql -u root -p mangocek_db < database/init.sql
```

#### 2. Jalankan Backend

```bash
cd backend
npm install
pip install -r requirements.txt
```

Sesuaikan konfigurasi database di `backend/server.js` jika password MySQL kamu berbeda, lalu jalankan:

```bash
# Dengan auto-reload (development)
npx nodemon server.js

# Atau tanpa auto-reload
node server.js
```

Backend berjalan di: `http://localhost:5000`

#### 3. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm start
```

Aplikasi berjalan di: `http://localhost:3000`

---

## Screenshot

#### 1. Landing Page
![Landing Page](images/landingPage01.jpg)
<!-- ![Landing Page](images/landingPage02.jpg)
![Landing Page](images/landingPage03.jpg)

#### 2. Login / Register
![Login Page](images/login.jpg)
![Register Page](images/register.jpg)

#### 3. Deteksi Page
![Deteksi Page](images/deteksiPage.jpg)
![Deteksi Page](images/deteksiPage002.jpg)

#### 4. Pakar Page
![Pakar Page](images/pakarPage001.jpg)
![Pakar Page](images/pakarPage002.jpg)

#### 5. Chatbot
![Chatbot Page](images/chatbot001.jpg)
![Chatbot Page](images/chatbot002.jpg)

#### 6. Dashboard
![Dashboard Page](images/dashboardPage001.jpg)
![Dashboard Page](images/tabelUser.jpg)
![Dashboard Page](images/tabelDiagnosa.jpg)
![Dashboard Page](images/tabelPenyakit.jpg) -->
