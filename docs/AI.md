# Dokumentasi AI — Mangocek App

Mangocek App menggunakan dua komponen AI yang berbeda: model **CNN** untuk deteksi kualitas buah mangga dari gambar, dan **Gemini AI** sebagai chatbot konsultasi pertanian.

---

## 1. Model CNN — Deteksi Kualitas Buah Mangga

### Gambaran Umum

| Atribut | Nilai |
|---------|-------|
| File model | `backend/cnn_model_mangga.h5` |
| Script inferensi | `backend/predict.py` |
| Framework | TensorFlow / Keras |
| Input | Gambar RGB, diubah ke ukuran 224×224 piksel |
| Output | 3 kelas: **Busuk**, **Masak**, **Muda** |
| Format output | `label,confidence` (stdout) |

### Kelas Output

| Label | Deskripsi |
|-------|-----------|
| `Busuk` | Buah mangga dalam kondisi busuk / tidak layak konsumsi |
| `Masak` | Buah mangga matang dan siap dikonsumsi |
| `Muda` | Buah mangga masih mentah / belum matang |

### Alur Kerja (Pipeline Inferensi)

```
Gambar dikirim user (JPG/PNG)
        │
        ▼
  multer menyimpan ke uploads/
        │
        ▼
  Node.js memanggil Python via execFile:
  python3 predict.py <path_gambar>
        │
        ▼
  predict.py:
  1. Buka gambar dengan PIL
  2. Konversi ke RGB
  3. Resize ke 224×224 piksel
  4. Normalisasi piksel: nilai / 255.0
  5. Tambah dimensi batch: shape (1, 224, 224, 3)
  6. model.predict() → array probabilitas 3 kelas
  7. argmax → indeks kelas dengan probabilitas tertinggi
  8. max → nilai kepercayaan (confidence)
  9. Print ke stdout: "Masak,0.9472"
        │
        ▼
  Node.js parsing stdout → JSON response ke client
  { "label": "Masak", "confidence": 94.72 }
```

### Kode Inferensi (`predict.py`)

```python
model = tf.keras.models.load_model('cnn_model_mangga.h5')

def prepare_image(image_path):
    image = Image.open(image_path).convert('RGB')
    image = image.resize((224, 224))
    image = np.array(image) / 255.0          # normalisasi [0,1]
    return np.expand_dims(image, axis=0)     # tambah dimensi batch

prediction = model.predict(image)[0]
labels = ['Busuk', 'Masak', 'Muda']
label_index = int(np.argmax(prediction))     # kelas terprediksi
confidence  = float(np.max(prediction))      # kepercayaan (0.0–1.0)
print(f"{labels[label_index]},{confidence:.4f}")
```

### Preprocessing Detail

| Langkah | Parameter | Alasan |
|---------|-----------|--------|
| Konversi ke RGB | `convert('RGB')` | Menghapus channel alpha (PNG) agar input konsisten 3 channel |
| Resize | 224×224 piksel | Ukuran input standar yang digunakan saat training model |
| Normalisasi | dibagi 255.0 | Mengubah nilai piksel dari range [0,255] ke [0,1] |
| Expand dims | axis=0 | Model mengharapkan batch: shape (batch, H, W, C) |

### Integrasi dengan Backend

Model dipanggil secara **synchronous** via `child_process.execFile`. Setiap request prediksi menjalankan proses Python baru — artinya model di-load ulang setiap kali ada prediksi. Ini cocok untuk beban rendah; untuk throughput tinggi, pertimbangkan menjalankan Python sebagai service terpisah yang persisten.

```
Node.js (server.js)
    │
    └── execFile('python3', ['predict.py', imagePath])
            │
            └── stdout: "Busuk,0.8813"
                        └── parsing → label + confidence
```

Setelah prediksi berhasil, hasilnya otomatis disimpan ke tabel `prediksi_log` dan (jika dikonfigurasi) foto di-upload ke **GCP Cloud Storage**.

### Dependensi Python

```
tensorflow     # framework deep learning
pillow         # membaca dan memanipulasi gambar
numpy          # operasi array / preprocessing
```

---

## 2. MangoBot — Chatbot AI (Gemini)

### Gambaran Umum

| Atribut | Nilai |
|---------|-------|
| Provider | Google Gemini AI |
| Model | `gemini-2.5-flash` |
| SDK | `@google/generative-ai` v0.24.1 |
| Bahasa respons | Bahasa Indonesia |
| Dukungan multi-turn | Ya (via `history`) |
| Endpoint | `POST /chatbot` |

### Peran dan Batasan Topik

MangoBot dikonfigurasi dengan **system prompt** yang membatasi topik percakapan hanya pada pertanian tanaman mangga:

**Topik yang diizinkan:**
- Penyakit tanaman mangga (antraknose, gleosporium, cendawan jelaga, bercak daun, dll.)
- Gejala dan diagnosis penyakit mangga
- Hama yang menyerang tanaman mangga
- Perawatan pohon mangga (penyiraman, pemupukan, pemangkasan)
- Cara menanam dan budidaya mangga
- Panen dan pasca panen buah mangga
- Varietas dan jenis mangga
- Kualitas buah mangga (masak, muda, busuk)
- Pengendalian hama dan penyakit secara organik maupun kimia

**Pertanyaan di luar topik** dijawab dengan kalimat standar:
> *"Maaf, saya hanya dapat membantu pertanyaan seputar pertanian tanaman buah mangga. Silakan tanyakan hal yang berkaitan dengan tanaman mangga 🥭"*

### Alur Percakapan Multi-Turn

MangoBot mendukung konteks percakapan yang berkelanjutan. Frontend menyimpan riwayat chat lokal dan mengirimkannya ke setiap request.

```
Percakapan Turn 1:
  Client → POST /chatbot
    { "message": "Apa itu antraknose?", "history": [] }
  Server → { "reply": "Antraknose adalah penyakit jamur..." }

Percakapan Turn 2:
  Client → POST /chatbot
    {
      "message": "Bagaimana cara mengobatinya?",
      "history": [
        { "role": "user",  "parts": [{ "text": "Apa itu antraknose?" }] },
        { "role": "model", "parts": [{ "text": "Antraknose adalah penyakit jamur..." }] }
      ]
    }
  Server → { "reply": "Untuk mengobati antraknose, semprotkan fungisida..." }
```

Model memahami bahwa "mengobatinya" merujuk ke antraknose dari konteks turn sebelumnya.

### Format History

Format `history` mengikuti spesifikasi Gemini API:

```json
[
  {
    "role": "user",
    "parts": [{ "text": "pesan dari user" }]
  },
  {
    "role": "model",
    "parts": [{ "text": "balasan dari model" }]
  }
]
```

Urutan harus selalu bergantian: `user` → `model` → `user` → `model` ...

### Implementasi di Backend

```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_PROMPT,   // membatasi topik ke pertanian mangga
});

const chat = model.startChat({ history });  // inject riwayat percakapan
const result = await chat.sendMessage(message);
res.json({ reply: result.response.text() });
```

### Implementasi di Frontend (`chatbot.js`)

```
FloatingChatbot (komponen React)
├── FAB button (pojok kanan bawah, fixed position)
├── Chat window (360×520 px, muncul saat FAB diklik)
│   ├── Daftar pesan (user & bot)
│   └── Input + tombol kirim
└── State: messages[], history[], isOpen, input, loading
```

Riwayat percakapan (`history`) disimpan di state React dan dikirim ke setiap request `/chatbot`. History direset saat chat window ditutup dan dibuka kembali.

### Konfigurasi

API key Gemini disimpan sebagai environment variable dan tidak pernah dikirim ke frontend:

```bash
# backend/.env
GEMINI_API_KEY=your_api_key_here
```

Cara mendapatkan API key: [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Perbandingan Kedua Komponen AI

| | CNN Model | MangoBot (Gemini) |
|--|-----------|-------------------|
| **Jenis input** | Gambar (JPG/PNG) | Teks |
| **Output** | Label + confidence | Teks percakapan |
| **Tujuan** | Klasifikasi kualitas buah | Konsultasi & edukasi pertanian |
| **Model** | Custom CNN (.h5) | Gemini 2.5 Flash (Google) |
| **Inferensi** | Lokal (Python subprocess) | Cloud API (Google AI) |
| **Bahasa** | — | Bahasa Indonesia |
| **Konteks** | Stateless (per gambar) | Stateful (multi-turn) |
| **Biaya** | Gratis (model lokal) | Berdasarkan token (Gemini API) |

---

## Catatan Produksi

### CNN Model
- Model di-load ulang setiap request. Jika trafik tinggi, pertimbangkan menjalankan Flask server (`app.py` sudah tersedia) sebagai service Python terpisah yang persisten.
- Gambar yang diupload disimpan sementara di `uploads/`. Jika GCS dikonfigurasi, gambar juga di-backup ke bucket GCP secara otomatis.

### Gemini AI
- Biaya API dihitung per token (input + output). Pantau penggunaan di [Google AI Studio](https://aistudio.google.com).
- Model `gemini-2.5-flash` dipilih karena lebih hemat biaya dibanding Gemini Pro dengan latensi lebih rendah, cocok untuk chatbot.
- Jika API key tidak di-set atau tidak valid, endpoint `/chatbot` mengembalikan status 500.
