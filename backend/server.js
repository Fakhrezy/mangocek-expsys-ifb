require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2/promise');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// GCS — only initialized when GCS_BUCKET_NAME env var is set
let gcsStorage = null;
if (process.env.GCS_BUCKET_NAME) {
  const { Storage } = require('@google-cloud/storage');
  const opts = process.env.GCS_KEY_FILE ? { keyFilename: process.env.GCS_KEY_FILE } : {};
  gcsStorage = new Storage(opts);
  console.log(`☁️  GCS enabled — bucket: ${process.env.GCS_BUCKET_NAME}`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'mangocek_secret_key_dev_only';

const SYSTEM_PROMPT = `Kamu adalah MangoBot, asisten ahli pertanian khusus tanaman buah mangga.

Kamu HANYA boleh menjawab pertanyaan yang berkaitan dengan topik berikut:
- Penyakit tanaman mangga (antraknose, gleosporium, cendawan jelaga, bercak daun, dll)
- Gejala dan diagnosis penyakit mangga
- Hama yang menyerang tanaman mangga
- Perawatan pohon mangga (penyiraman, pemupukan, pemangkasan)
- Cara menanam dan budidaya mangga
- Panen dan pasca panen buah mangga
- Varietas dan jenis mangga
- Kualitas buah mangga (masak, muda, busuk)
- Pengendalian hama dan penyakit secara organik maupun kimia

Jika pertanyaan di luar topik pertanian tanaman buah mangga, jawab HANYA dengan kalimat ini (jangan tambahkan apapun):
"Maaf, saya hanya dapat membantu pertanyaan seputar pertanian tanaman buah mangga. Silakan tanyakan hal yang berkaitan dengan tanaman mangga 🥭"

Gunakan Bahasa Indonesia yang ramah, jelas, dan mudah dipahami petani. Berikan jawaban yang praktis.`;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mangocek_db'
};

const upload = multer({ dest: 'uploads/' });

// --- Auth middleware ---

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan.' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

const requireAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak: hanya admin.' });
    }
    next();
  });
};

// --- Auth endpoints ---

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi (username, email, password).' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    const hashed = await bcrypt.hash(password, 10);
    await conn.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed]
    );
    await conn.end();
    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email sudah terdaftar' });
    } else {
      res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email dan password diperlukan.' });

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      await conn.end();
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];
    let isValid;

    if (user.password.startsWith('$2')) {
      // bcrypt hash
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plaintext: compare then auto-migrate to bcrypt
      isValid = password === user.password;
      if (isValid) {
        const hashed = await bcrypt.hash(password, 10);
        await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
      }
    }

    await conn.end();

    if (!isValid) return res.status(401).json({ message: 'Email atau password salah' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
});

// --- CNN Prediction ---

app.post('/predict', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Gambar tidak ditemukan.' });

  const imagePath = path.resolve(req.file.path);
  const namaFile = req.file.originalname || req.file.filename;

  let label, confidenceVal;

  try {
    if (process.env.ML_SERVICE_URL) {
      // Call Flask ML service (model loaded persistently — faster)
      const imageBytes = fs.readFileSync(imagePath);
      const base64Image = imageBytes.toString('base64');
      const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, { image: base64Image });
      label = mlRes.data.label;
      confidenceVal = mlRes.data.confidence;
    } else {
      // Fallback: Python subprocess (for local dev without Docker)
      const result = await new Promise((resolve, reject) => {
        execFile('python3', ['predict.py', imagePath], (error, stdout) => {
          if (error) return reject(error);
          const lines = stdout.trim().split('\n');
          const [l, c] = lines[lines.length - 1].trim().split(',');
          if (!l || isNaN(c)) return reject(new Error('Output dari model tidak valid.'));
          resolve({ label: l.trim(), confidence: parseFloat(c) * 100 });
        });
      });
      label = result.label;
      confidenceVal = result.confidence;
    }
  } catch (err) {
    console.error('Prediksi error:', err.message);
    return res.status(500).json({ error: 'Error saat prediksi gambar' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO prediksi_log (label, confidence, nama_file) VALUES (?, ?, ?)',
      [label, confidenceVal, namaFile]
    );
    await conn.end();
  } catch (dbErr) {
    console.error('Gagal menyimpan log prediksi:', dbErr.message);
  }

  if (gcsStorage) {
    try {
      const bucket = gcsStorage.bucket(process.env.GCS_BUCKET_NAME);
      const destName = `predictions/${Date.now()}_${namaFile}`;
      await bucket.upload(imagePath, { destination: destName, metadata: { cacheControl: 'no-cache' } });
    } catch (gcsErr) {
      console.error('GCS upload gagal:', gcsErr.message);
    }
  }

  res.json({ label, confidence: confidenceVal });
});

app.get('/prediksi-log', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM prediksi_log ORDER BY waktu DESC');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil log prediksi', error: err.message });
  }
});

// --- Knowledge base (public) ---

app.get('/knowledge-base', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [penyakit] = await conn.execute('SELECT * FROM penyakit');
    for (let p of penyakit) {
      const [gejala] = await conn.execute('SELECT * FROM gejala WHERE id_penyakit = ?', [p.id]);
      const [pengendalian] = await conn.execute('SELECT * FROM pengendalian WHERE id_penyakit = ?', [p.id]);
      p.gejala = gejala;
      p.pengendalian = pengendalian.map(p => p.tindakan);
    }
    await conn.end();
    res.json(penyakit);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data knowledge base', error: err.message });
  }
});

// --- Penyakit CRUD (admin only) ---

app.post('/penyakit', requireAdmin, async (req, res) => {
  const { nama, gejala, pengendalian } = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute('INSERT INTO penyakit (nama) VALUES (?)', [nama]);
    const idPenyakit = result.insertId;

    for (let g of gejala) {
      await conn.execute('INSERT INTO gejala (id_penyakit, deskripsi) VALUES (?, ?)', [idPenyakit, g]);
    }
    for (let p of pengendalian) {
      await conn.execute('INSERT INTO pengendalian (id_penyakit, tindakan) VALUES (?, ?)', [idPenyakit, p]);
    }

    await conn.end();
    res.status(201).json({ message: 'Penyakit berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan penyakit', error: err.message });
  }
});

app.put('/penyakit/:id', requireAdmin, async (req, res) => {
  const { nama, gejala, pengendalian } = req.body;
  const id = req.params.id;

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('UPDATE penyakit SET nama = ? WHERE id = ?', [nama, id]);
    await conn.execute('DELETE FROM gejala WHERE id_penyakit = ?', [id]);
    await conn.execute('DELETE FROM pengendalian WHERE id_penyakit = ?', [id]);

    for (let g of gejala) {
      await conn.execute('INSERT INTO gejala (id_penyakit, deskripsi) VALUES (?, ?)', [id, g]);
    }
    for (let p of pengendalian) {
      await conn.execute('INSERT INTO pengendalian (id_penyakit, tindakan) VALUES (?, ?)', [id, p]);
    }

    await conn.end();
    res.json({ message: 'Penyakit diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui', error: err.message });
  }
});

app.delete('/penyakit/:id', requireAdmin, async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM penyakit WHERE id = ?', [req.params.id]);
    await conn.end();
    res.json({ message: 'Penyakit dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus', error: err.message });
  }
});

// --- Users (admin only) ---

app.get('/users', requireAdmin, async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, username, email, role FROM users');
    await conn.end();
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna', error: err.message });
  }
});

app.put('/users/:id', requireAdmin, async (req, res) => {
  const { username, email } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.params.id]);
    await conn.end();
    res.json({ message: 'User diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui user', error: err.message });
  }
});

app.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await conn.end();
    res.json({ message: 'User dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus user', error: err.message });
  }
});

// --- Stats (admin only) ---

app.get('/stats', requireAdmin, async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [[{ totalUsers }]]    = await conn.execute('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalPrediksi }]] = await conn.execute('SELECT COUNT(*) as totalPrediksi FROM prediksi_log');
    const [[{ totalPenyakit }]] = await conn.execute('SELECT COUNT(*) as totalPenyakit FROM penyakit');
    await conn.end();
    res.json({ totalUsers, totalPrediksi, totalPenyakit });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil statistik', error: err.message });
  }
});

// --- Chatbot ---

app.post('/chatbot', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'Gagal mendapatkan respons dari AI.' });
  }
});

app.listen(5000, () => {
  console.log('✅ Server berjalan di http://localhost:5000');
});
