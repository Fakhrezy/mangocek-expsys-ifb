import { useEffect, useState } from 'react';

export default function ChatbotDiagnosa() {
  const [messages, setMessages] = useState([]);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [gejalaTerpilih, setGejalaTerpilih] = useState([]);
  const [pertanyaanIndex, setPertanyaanIndex] = useState(0);
  const [diagnosa, setDiagnosa] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const pertanyaanRes = await fetch('/pertanyaan.json');
      const kbRes = await fetch('/knowledgeBase.json');
      const pertanyaanData = await pertanyaanRes.json();
      const kbData = await kbRes.json();
      setPertanyaanList(pertanyaanData);
      setKnowledgeBase(kbData.penyakit);
    }
    fetchData();
  }, []);

  const handleJawaban = (jawaban) => {
    const current = pertanyaanList[pertanyaanIndex];

    setMessages((prev) => [
      ...prev,
      { text: current.pertanyaan, isUser: false },
      { text: jawaban ? '✅ Ya' : '❌ Tidak', isUser: true }
    ]);

    if (jawaban) {
      setGejalaTerpilih((prev) => [...prev, current.id]);
    }

    if (pertanyaanIndex + 1 < pertanyaanList.length) {
      setPertanyaanIndex((prev) => prev + 1);
    } else {
      lakukanDiagnosa();
    }
  };

  const lakukanDiagnosa = () => {
    const hasil = knowledgeBase.map((penyakit) => {
      const cocok = penyakit.gejala.filter((g) => gejalaTerpilih.includes(g.id));
      const skor = cocok.length / penyakit.gejala.length;
      return skor > 0 ? { nama: penyakit.nama, skor } : null;
    }).filter(Boolean);

    hasil.sort((a, b) => b.skor - a.skor);
    setDiagnosa(hasil);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', backgroundColor: '#e8f5e9' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', border: '1px solid #c8e6c9', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxHeight: '70vh' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: '10px 0', textAlign: msg.isUser ? 'right' : 'left' }}>
            <p style={{
              margin: 0,
              padding: '10px 14px',
              backgroundColor: msg.isUser ? '#4caf50' : '#f1f8e9',
              borderRadius: msg.isUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
              color: msg.isUser ? '#fff' : '#33691e',
              display: 'inline-block',
              maxWidth: '80%'
            }}>
              {msg.text}
            </p>
          </div>
        ))}

        {diagnosa && (
          <div style={{ marginTop: '20px', backgroundColor: '#fce4ec', padding: '15px', borderRadius: '10px' }}>
            <h4 style={{ marginBottom: '10px', color: '#ad1457' }}>🩺 Hasil Diagnosa:</h4>
            {diagnosa.map((d, i) => (
              <p key={i} style={{ margin: '6px 0' }}>🔹 {d.nama} — <strong>{Math.round(d.skor * 100)}%</strong></p>
            ))}
          </div>
        )}
      </div>

      {!diagnosa && pertanyaanList.length > 0 && pertanyaanIndex < pertanyaanList.length && (
        <div style={{ marginTop: '20px', textAlign: 'center', paddingBottom: '200px' }}>
          <h4 style={{ color: '#2e7d32' }}>Pertanyaan:</h4>
          <p style={{ fontSize: '18px', fontWeight: '500' }}>{pertanyaanList[pertanyaanIndex].pertanyaan}</p>
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => handleJawaban(true)} style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#43a047', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Ya</button>
            <button onClick={() => handleJawaban(false)} style={{ padding: '10px 20px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Tidak</button>
          </div>
        </div>
      )}
    </div>
  );
}
