import { useState } from 'react';
import knowledgeBase from '../data/knowledgeBase.json';
import Chatbot from '../components/chatbot';

export default function PakarPage() {
  const [selectedGejala, setSelectedGejala] = useState([]);
  const [hasil, setHasil] = useState([]);
  const [inputTeks, setInputTeks] = useState('');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [loading, setLoading] = useState(false);  // state loading

  const semuaGejala = [...new Set(
    knowledgeBase.penyakit.flatMap(p => p.gejala)
  )];

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

  const handleDiagnosa = () => {
    const hasilDeteksi = knowledgeBase.penyakit.map(p => {
      const cocok = p.gejala.filter(g => selectedGejala.includes(g.id));
      return { ...p, jumlahCocok: cocok.length };
    }).filter(p => p.jumlahCocok > 0);

    hasilDeteksi.sort((a, b) => b.jumlahCocok - a.jumlahCocok);
    setHasil(hasilDeteksi);
  };

  // Fungsi diagnosa NLP dengan loading animasi
  const handleDiagnosaNLP = () => {
    setLoading(true);  // mulai loading

    setTimeout(() => {
      const tokenInput = tokenize(inputTeks);

      const cocokGejala = semuaGejala.filter(g => {
        const tokenGejala = tokenize(g.deskripsi);
        return cosineSimilarity(tokenInput, tokenGejala) > 0.5;
      });

      const cocokIDs = cocokGejala.map(g => g.id);
      setSelectedGejala(cocokIDs);

      handleDiagnosa();

      setLoading(false); // selesai loading
    }, 1000); // simulasi delay proses 1 detik
  };

  const toggleChatbot = () => setChatbotOpen(prev => !prev);

  return (
    <div style={styles.container}>
      <img src="/images/ill3.jpg" alt="Diagnosa" style={styles.gambar} />
      <h1 style={styles.title}>Diagnosa Penyakit Tanaman Mangga</h1>

      <textarea
        rows="4"
        placeholder="Tuliskan gejala tanaman mangga di sini..."
        value={inputTeks}
        onChange={(e) => setInputTeks(e.target.value)}
        style={{ width: '100%', marginBottom: '20px', padding: '10px', fontSize: '14px' }}
      />

      <button
        onClick={handleDiagnosaNLP}
        style={{ ...styles.button, backgroundColor: '#00796b' }}
        disabled={loading}  // disable saat loading
      >
        {loading ? 'Memproses...' : 'Diagnosa'}
      </button>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <span>Mohon tunggu, sedang memproses...</span>
        </div>
      )}

      {hasil.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={styles.resultTitle}>Hasil Diagnosa:</h2>
          {hasil.map(p => (
            <div key={p.id} style={styles.resultCard}>
              <h3>{p.nama}</h3>
              <p><strong>Jumlah gejala cocok:</strong> {p.jumlahCocok}</p>
              <h4>Pengendalian:</h4>
              <ul>{p.pengendalian.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
      )}

      <button onClick={toggleChatbot} style={styles.chatbotToggleBtn}>
        {chatbotOpen ? 'Tutup Chatbot' : 'Chatbot'}
      </button>

      {chatbotOpen && (
        <div style={styles.chatbotPopup}>
          <Chatbot />
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
  chatbotToggleBtn: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#43a047',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    zIndex: 1000,
  },
  chatbotPopup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Posisikan di tengah layar
    width: '500px', // Lebar yang lebih besar untuk chatbot
    height: '600px', // Tinggi yang lebih besar untuk chatbot
    border: '1px solid #ccc',
    borderRadius: '15px',
    backgroundColor: 'white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    zIndex: 1000,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
  },
};

