import { useState } from 'react';
import API_BASE from '../config';

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconWarning = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconLoading = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

export default function DeteksiPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ status: 'ok', label: data.label, confidence: data.confidence });
      } else {
        setResult({ status: 'warn', msg: data.error });
      }
    } catch (error) {
      setResult({ status: 'error', msg: 'Gagal menghubungi server.' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    if (result.status === 'ok') return (
      <div style={{ ...styles.resultBox, backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2e7d32', fontWeight: 'bold', fontSize: 18 }}>
          <IconCheck /> {result.label}
        </div>
        <div style={{ color: '#555', marginTop: 6, fontSize: 14 }}>
          Tingkat kepercayaan: <strong>{result.confidence.toFixed ? result.confidence.toFixed(1) : result.confidence}%</strong>
        </div>
      </div>
    );
    if (result.status === 'warn') return (
      <div style={{ ...styles.resultBox, backgroundColor: '#fff8e1', border: '1px solid #ffe082' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f57c00' }}>
          <IconWarning /> {result.msg}
        </div>
      </div>
    );
    return (
      <div style={{ ...styles.resultBox, backgroundColor: '#ffebee', border: '1px solid #ef9a9a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c62828' }}>
          <IconX /> {result.msg}
        </div>
      </div>
    );
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

        {loading && (
          <p style={{ ...styles.loading, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IconLoading /> Memproses gambar...
          </p>
        )}
        {renderResult()}
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
    marginBottom: '20px',
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
  resultBox: {
    marginTop: '20px',
    width: '100%',
    padding: '16px 20px',
    borderRadius: '10px',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
};
