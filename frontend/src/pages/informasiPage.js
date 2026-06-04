import React from 'react';
import FlipCard from '../components/flipcard'; // Impor komponen FlipCard
import knowledgeBase from '../data/knowledgeBase.json'; // Mengimpor data dari JSON

export default function InformasiPage() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="/images/illustration.jpg" alt="Mangga" style={styles.image} />
        <h1 style={styles.title}>Informasi Penyakit Mangga</h1>
      </div>

      <div style={styles.grid}>
        {knowledgeBase.penyakit.map((p) => (
          <FlipCard
            key={p.id}
            coverTitle={p.nama}
            infoContent={p.deskripsi} // Menampilkan deskripsi pada sisi belakang kartu
            symptoms={p.gejala.map((g) => g.deskripsi)} // Menyusun gejala
            control={p.pengendalian} // Menyusun pengendalian
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
    gap: '15px',
  },
  image: {
    width: '200px',
    height: '200px',
    objectFit: 'contain',
  },
  title: {
    fontSize: '28px',
    color: '#2e7d32',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
};
