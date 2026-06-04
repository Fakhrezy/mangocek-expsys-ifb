const fs = require('fs');
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',       // ← sesuaikan
  database: 'mangocek_db' // ← sesuaikan
};

async function importData() {
  const raw = fs.readFileSync('./knowledgeBase.json', 'utf-8'); // simpan file json ini di folder yg sama
  const data = JSON.parse(raw);

  const conn = await mysql.createConnection(dbConfig);
  console.log('✅ Terhubung ke database');

  for (let penyakit of data.penyakit) {
    // Masukkan penyakit
    const [res] = await conn.execute('INSERT INTO penyakit (nama) VALUES (?)', [penyakit.nama]);
    const idPenyakit = res.insertId;

    // Masukkan gejala
    for (let g of penyakit.gejala) {
      await conn.execute('INSERT INTO gejala (id_penyakit, deskripsi) VALUES (?, ?)', [idPenyakit, g.deskripsi]);
    }

    // Masukkan pengendalian
    for (let p of penyakit.pengendalian) {
      await conn.execute('INSERT INTO pengendalian (id_penyakit, tindakan) VALUES (?, ?)', [idPenyakit, p]);
    }

    console.log(`✅ Ditambahkan: ${penyakit.nama}`);
  }

  await conn.end();
  console.log('✅ Selesai import');
}

importData().catch(console.error);
