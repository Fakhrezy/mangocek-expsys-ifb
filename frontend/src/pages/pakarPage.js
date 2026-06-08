import { useState, useEffect } from 'react';
import API_BASE from '../config';

export default function PakarPage() {
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [loadingKB, setLoadingKB] = useState(true);
  const [selectedGejala, setSelectedGejala] = useState([]);
  const [hasil, setHasil] = useState([]);
  const [inputTeks, setInputTeks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/knowledge-base`)
      .then(res => res.json())
      .then(data => { setKnowledgeBase(Array.isArray(data) ? data : []); setLoadingKB(false); })
      .catch(() => setLoadingKB(false));
  }, []);

  const semuaGejala = knowledgeBase.flatMap(p => p.gejala);

  const stemmerIndonesia = (word) => {
    return word
      .replace(/^(me|di|ter|ke|se|ber|pe|per|peng|pen|pem|men|mem|meny)/, '')
      .replace(/(kan|an|i|nya|lah|kah)$/, '');
  };

  const tokenize = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .map(stemmerIndonesia);
  };

  const cosineSimilarity = (a, b) => {
    const allWords = [...new Set([...a, ...b])];
    const vecA = allWords.map(word => a.filter(w => w === word).length);
    const vecB = allWords.map(word => b.filter(w => w === word).length);
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  };

  // Terima gejalaIDs langsung agar tidak bergantung pada state yang belum terupdate
  const handleDiagnosa = (gejalaIDs = selectedGejala) => {
    const hasilDeteksi = knowledgeBase.map(p => {
      const cocok = p.gejala.filter(g => gejalaIDs.includes(g.id));
      return { ...p, jumlahCocok: cocok.length };
    }).filter(p => p.jumlahCocok > 0);

    hasilDeteksi.sort((a, b) => b.jumlahCocok - a.jumlahCocok);
    setHasil(hasilDeteksi);
    return hasilDeteksi;
  };

  const handleDiagnosaNLP = () => {
    if (!inputTeks.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const tokenInput = tokenize(inputTeks);

      const cocokGejala = semuaGejala.filter(g => {
        const tokenGejala = tokenize(g.deskripsi);
        return cosineSimilarity(tokenInput, tokenGejala) > 0.5;
      });

      const cocokIDs = cocokGejala.map(g => g.id);
      setSelectedGejala(cocokIDs);

      // Kirim IDs langsung untuk menghindari bug state async
      const hasilDeteksi = handleDiagnosa(cocokIDs);

      setLoading(false);
    }, 1000);
  };

  if (loadingKB) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: 80 }}>
        <div style={styles.spinner} />
        <p style={{ color: '#00796b', marginTop: 16 }}>Memuat basis data penyakit...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <img src="/images/ill3.jpg" alt="Diagnosa" style={styles.gambar} />
      <h1 style={styles.title}>Diagnosa Penyakit Tanaman Mangga</h1>

      <textarea
        rows="4"
        placeholder="Tuliskan gejala tanaman mangga di sini..."
        value={inputTeks}
        onChange={(e) => setInputTeks(e.target.value)}
        style={{ width: '100%', marginBottom: '20px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
      />

      <button
        onClick={handleDiagnosaNLP}
        style={{ ...styles.button, backgroundColor: '#00796b' }}
        disabled={loading || !inputTeks.trim()}
      >
        {loading ? 'Memproses...' : 'Diagnosa'}
      </button>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <span>Mohon tunggu, sedang memproses...</span>
        </div>
      )}

      {!loading && hasil.length === 0 && inputTeks && selectedGejala.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
          Tidak ada gejala yang cocok ditemukan. Coba deskripsikan gejala lebih detail.
        </p>
      )}

      {hasil.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={styles.resultTitle}>Hasil Diagnosa:</h2>
          {hasil.map(p => (
            <div key={p.id} style={styles.resultCard}>
              <h3>{p.nama}</h3>
              <p><strong>Jumlah gejala cocok:</strong> {p.jumlahCocok} dari {p.gejala.length}</p>
              <h4>Pengendalian:</h4>
              <ul>{p.pengendalian.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '26px',
    color: '#2e7d32',
  },
  gambar: {
    width: '100%',
    maxWidth: '200px',
    display: 'block',
    margin: '0 auto 20px',
  },
  button: {
    display: 'block',
    margin: '10px auto',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#43a047',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  loadingContainer: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center',
    color: '#00796b',
    fontWeight: 'bold',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '4px solid #43a047',
    borderTop: '4px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  resultTitle: {
    fontSize: '22px',
    color: '#2e7d32',
  },
  resultCard: {
    backgroundColor: '#e8f5e9',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
};
