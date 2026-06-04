// pages/DeteksiPage.js
import { useState } from 'react';

export default function DeteksiPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);
    setResult('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setResult(`✅ Hasil: ${data.label} (${data.confidence}%)`);
      } else {
        setResult(`⚠️ Terjadi kesalahan: ${data.error}`);
      }
    } catch (error) {
      setResult('❌ Gagal menghubungi server.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
        <img src="/images/ill2.jpg" alt="deteksi" style={styles.gambar} />
      <h1 style={styles.title}>Deteksi Kualitas Buah Mangga</h1>

      <div style={styles.card}>
  {image && (
    <img src={image} alt="preview" style={styles.image} />
  )}

  <label htmlFor="upload" style={styles.uploadLabel}>
    Pilih Gambar Mangga
  </label>
  <input
    id="upload"
    type="file"
    accept="image/*"
    onChange={handleUpload}
    style={styles.input}
  />

  {loading && <p style={styles.loading}>⏳ Memproses gambar...</p>}
  {result && <p style={styles.result}>{result}</p>}
</div>

    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    color: '#2e7d32',
    marginBottom: '30px',
  },
  card: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#f1f8e9',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
},
  uploadLabel: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#81c784',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  input: {
    display: 'none',
  },
  image: {
    marginTop: '20px',
    width: '100%',
    maxWidth: '300px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  gambar: {
  width: '100%',
  maxWidth: '200px',
  marginBottom: '20px',
},
  loading: {
    marginTop: '20px',
    color: '#f57c00',
  },
  result: {
    marginTop: '20px',
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#2e7d32',
  },
};
