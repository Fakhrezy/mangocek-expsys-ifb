import { useEffect, useState, useCallback, useRef } from 'react';

export default function ChatbotDiagnosa() {
  const [messages, setMessages] = useState([]);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [gejalaTerpilih, setGejalaTerpilih] = useState([]);
  const [pertanyaanIndex, setPertanyaanIndex] = useState(0);
  const [diagnosa, setDiagnosa] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Text-to-Speech dengan callback setelah selesai
  const speak = (text, onEndCallback) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const indoVoice =
      voices.find((v) => v.lang === 'id-ID' && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang === 'id-ID') ||
      voices.find((v) => v.lang.includes('id'));
    if (indoVoice) utterance.voice = indoVoice;
    utterance.rate = 1;

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    synth.speak(utterance);
  };

  // Ambil data pertanyaan dan knowledge base
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

  // Fungsi diagnosa
  const lakukanDiagnosa = useCallback(async () => {
    const hasil = knowledgeBase
      .map((penyakit) => {
        const cocok = penyakit.gejala.filter((g) => gejalaTerpilih.includes(g.id));
        const skor = cocok.length / penyakit.gejala.length;
        return skor > 0 ? { nama: penyakit.nama, skor, gejala: cocok.map((g) => g.id) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.skor - a.skor);

    setDiagnosa(hasil);

    if (hasil.length > 0) {
      const top = hasil[0];
      try {
        await fetch('http://localhost:5000/simpan-diagnosa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_penyakit: top.nama,
            skor: top.skor,
            gejala: top.gejala,
          }),
        });
        console.log('✅ Diagnosa tersimpan.');
      } catch (err) {
        console.error('❌ Gagal simpan:', err);
      }
    }
  }, [knowledgeBase, gejalaTerpilih]);

  // Fungsi menjawab
  const handleJawaban = useCallback(
    (jawaban) => {
      window.speechSynthesis.cancel();
      const current = pertanyaanList[pertanyaanIndex];

      setMessages((prev) => [
        ...prev,
        { text: current.pertanyaan, isUser: false },
        { text: jawaban ? '✅ Ya' : '❌ Tidak', isUser: true },
      ]);

      if (jawaban) {
        setGejalaTerpilih((prev) => [...prev, current.id]);
      }

      if (pertanyaanIndex + 1 < pertanyaanList.length) {
        setPertanyaanIndex((prev) => prev + 1);
      } else {
        lakukanDiagnosa();
      }
    },
    [pertanyaanIndex, pertanyaanList, lakukanDiagnosa]
  );

  // Konfigurasi speech recognition sekali saja
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Browser tidak mendukung SpeechRecognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event) => {
      console.error('❌ Error mic:', event.error);
    };

    recognition.onresult = (event) => {
      const hasil = event.results[0][0].transcript.toLowerCase().trim();
      console.log('🎤 Dengar:', hasil);
      if (hasil.includes('ya')) {
        handleJawaban(true);
      } else if (hasil.includes('tidak')) {
        handleJawaban(false);
      }
    };

    recognitionRef.current = recognition;
  }, [handleJawaban]);

  // Trigger speak + start listening setelah selesai bicara
  useEffect(() => {
    if (pertanyaanList.length > 0 && pertanyaanIndex < pertanyaanList.length && !diagnosa) {
      speak(pertanyaanList[pertanyaanIndex].pertanyaan, () => {
        recognitionRef.current?.start(); // mulai mendengarkan setelah bicara selesai
      });
    }
  }, [pertanyaanIndex, pertanyaanList, diagnosa]);

  const ulangiPertanyaan = () => {
    if (pertanyaanList.length > 0 && pertanyaanIndex < pertanyaanList.length) {
      speak(pertanyaanList[pertanyaanIndex].pertanyaan, () => {
        recognitionRef.current?.start();
      });
    }
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
          <p style={{ fontSize: '14px', color: '#777' }}>
            jawab dengan suara: ucapkan <strong>"ya"</strong> atau <strong>"tidak"</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#777' }}>
            atau klik tombol di bawah ini untuk menjawab
          </p>
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => handleJawaban(true)} style={buttonStyle('#43a047')}>Ya</button>
            <button onClick={() => handleJawaban(false)} style={buttonStyle('#e53935')}>Tidak</button>
            <button onClick={ulangiPertanyaan} style={buttonStyle('#039be5')}>🔁 Ulangi</button>
          </div>
          {isListening && <p style={{ marginTop: '10px', color: '#888' }}> Mendengarkan...</p>}
        </div>
      )}
    </div>
  );
}

const buttonStyle = (bg) => ({
  padding: '10px 20px',
  marginRight: '10px',
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
});
