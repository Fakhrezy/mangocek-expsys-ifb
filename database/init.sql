CREATE DATABASE IF NOT EXISTS mangocek_db;
USE mangocek_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS penyakit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS gejala (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_penyakit INT NOT NULL,
  deskripsi TEXT NOT NULL,
  FOREIGN KEY (id_penyakit) REFERENCES penyakit(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pengendalian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_penyakit INT NOT NULL,
  tindakan TEXT NOT NULL,
  FOREIGN KEY (id_penyakit) REFERENCES penyakit(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prediksi_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  confidence FLOAT NOT NULL,
  nama_file VARCHAR(255),
  waktu DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default admin account (password: admin123)
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@mangocek.com', 'admin123', 'admin');

-- Knowledge base: 9 penyakit mangga
INSERT INTO penyakit (nama) VALUES ('Antraknose');
SET @p1 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p1, 'Daun gugur'), (@p1, 'Daun kering'),
  (@p1, 'Permukaan kulit buah terdapat titik-titik hitam'), (@p1, 'Daun berlubang'),
  (@p1, 'Daun berupa bercak tidak teratur'), (@p1, 'Daun berwarna coklat keabuan'),
  (@p1, 'Batang muda berupa bercak coklat keabuan'),
  (@p1, 'Batang terdapat bercak membentuk gelang melingkari batang'),
  (@p1, 'Batang mati'), (@p1, 'Bunga terlihat bintik-bintik kecil'),
  (@p1, 'Daging buah busuk'), (@p1, 'Bunga gugur/rontok');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p1, 'Pemangkasan penanaman jangan terlalu rapat'),
  (@p1, 'Bagian yang terserang dipotong dan dibakar'),
  (@p1, 'Air hangat + fungisida benomil (500ppm) atau diebendazol (90ppm) selama 5 menit');

INSERT INTO penyakit (nama) VALUES ('Gleosporium');
SET @p2 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p2, 'Buah busuk'), (@p2, 'Bunga layu'),
  (@p2, 'Daun bintik-bintik hitam'), (@p2, 'Daun menggulung');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p2, 'Fungisida bubuk Bordeaux');

INSERT INTO penyakit (nama) VALUES ('Penyakit Kulit');
SET @p3 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p3, 'Batang/cabang mengeluarkan blendok'), (@p3, 'Kulit batang berwarna gelap'),
  (@p3, 'Kulit batang mengering'), (@p3, 'Kulit luar batang tampak seperti pecah-pecah'),
  (@p3, 'Kulit batang mengelupas sebagai kepingan');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p3, 'Hindari pemangkasan tanaman terlalu berat'), (@p3, 'Pengapuran pangkal batang'),
  (@p3, 'Tutup luka waktu pemangkasan dengan klorox'),
  (@p3, 'Kelupas kulit yang terserang dan aplikasikan fungisida');

INSERT INTO penyakit (nama) VALUES ('Cendawan Jelaga');
SET @p4 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p4, 'Terdapat jamur pada daun'), (@p4, 'Daun berwarna kehitaman seperti beledu');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p4, 'Basmi serangga penghasil cairan manis dengan insektisida/tepung belerang');

INSERT INTO penyakit (nama) VALUES ('Bercak Karat Merah');
SET @p5 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p5, 'Ranting berbintik kecoklatan'), (@p5, 'Daun berbintik kecoklatan');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p5, 'Pemangkasan dahan, cabang, ranting'),
  (@p5, 'Penyemprotan fungisida Bordeaux atau sulfat tembaga');

INSERT INTO penyakit (nama) VALUES ('Bercak Daun Stigmina');
SET @p6 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p6, 'Daun terdapat bercak kecil bulat atau bersudut'), (@p6, 'Daun hitam kecoklatan'),
  (@p6, 'Daun dikelilingi lingkaran klorotis yang jelas jika dilihat dari cahaya yang menembus');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p6, 'Jaga kelembapan sekitar tanaman'),
  (@p6, 'Pangkas dan musnahkan bagian yang terserang'),
  (@p6, 'Pengelolaan air atau fungisida benlate, topsin M70 wp, derosal 500/60 wp');

INSERT INTO penyakit (nama) VALUES ('Bercak Daun Kelabu');
SET @p7 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p7, 'Daun gugur'), (@p7, 'Daun berlubang'),
  (@p7, 'Daun muda berupa bercak putih keabuan'), (@p7, 'Daun dapat membentuk bercak yang besar'),
  (@p7, 'Tepi daun dibatasi dengan warna gelap');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p7, 'Tidak perlu pengendalian khusus karena tidak terlalu merugikan');

INSERT INTO penyakit (nama) VALUES ('Kudis Buah');
SET @p8 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p8, 'Buah terdapat bercak kuning yang akan berubah menjadi abu-abu'),
  (@p8, 'Pembuahan tidak terjadi'), (@p8, 'Bunga gugur/rontok');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p8, 'Fungisida dithane m-45, manzate, atau pignoe tiga kali seminggu'),
  (@p8, 'Pangkas tangkai bunga yang terserang');

INSERT INTO penyakit (nama) VALUES ('Penyakit Blendok');
SET @p9 = LAST_INSERT_ID();
INSERT INTO gejala (id_penyakit, deskripsi) VALUES
  (@p9, 'Batang berlubang'), (@p9, 'Blendok akan berubah warna menjadi coklat atau hitam'),
  (@p9, 'Batang/cabang mengeluarkan blendok');
INSERT INTO pengendalian (id_penyakit, tindakan) VALUES
  (@p9, 'Potong bagian yang sakit'),
  (@p9, 'Tutup lubang dengan kapas yang dicelupkan ke dalam insektisida'),
  (@p9, 'Semprot pohon dengan bubuk Bordeaux');
