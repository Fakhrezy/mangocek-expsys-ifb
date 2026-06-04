import { useState, useRef, useEffect } from 'react';
import API_BASE from '../config';

const API_URL = `${API_BASE}/chatbot`;

const ChatSVG = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CloseSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SendSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Halo! Saya MangoBot 🥭, asisten ahli pertanian tanaman mangga. Silakan tanyakan apa saja seputar tanaman mangga, penyakit, perawatan, atau cara budidaya!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const buildHistory = () =>
    messages.slice(1).map((m) => ({ role: m.role, parts: [{ text: m.text }] }));

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: buildHistory() }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'model', text: data.reply || data.error || 'Terjadi kesalahan.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: 'Gagal terhubung ke server. Coba lagi nanti.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div style={styles.wrapper}>
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🥭</span>
              <div>
                <div style={styles.headerTitle}>MangoBot</div>
                <div style={styles.headerSub}>Asisten Ahli Tanaman Mangga</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <CloseSVG />
            </button>
          </div>

          <div style={styles.chatArea}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                {msg.role === 'model' && <div style={styles.avatar}>🥭</div>}
                <div style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}>
                  {msg.text.split('\n').map((line, j, arr) => (
                    <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                <div style={styles.avatar}>🥭</div>
                <div style={{ ...styles.bubbleBot, ...styles.typing }}>
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputArea}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan seputar tanaman mangga... (Enter kirim)"
              style={styles.textarea}
              rows={2}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={styles.sendBtn}>
              <SendSVG />
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen((prev) => !prev)} style={styles.fab} title="MangoBot">
        <ChatSVG />
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
  },
  chatWindow: {
    width: 360,
    height: 520,
    backgroundColor: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: '#2e7d32',
    color: '#fff',
    flexShrink: 0,
  },
  headerTitle: { fontSize: 15, fontWeight: 'bold' },
  headerSub: { fontSize: 11, opacity: 0.85 },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    opacity: 0.85,
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 12px',
    backgroundColor: '#f1f8e9',
    minHeight: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#c8e6c9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    marginRight: 8,
    flexShrink: 0,
  },
  bubbleUser: {
    maxWidth: '72%',
    backgroundColor: '#2e7d32',
    color: '#fff',
    padding: '9px 13px',
    borderRadius: '18px 18px 0 18px',
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  bubbleBot: {
    maxWidth: '72%',
    backgroundColor: '#fff',
    color: '#1b5e20',
    padding: '9px 13px',
    borderRadius: '18px 18px 18px 0',
    fontSize: 13,
    lineHeight: 1.5,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    wordBreak: 'break-word',
  },
  typing: {
    letterSpacing: 4,
    fontSize: 20,
    color: '#81c784',
  },
  inputArea: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e8f5e9',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1.5px solid #c8e6c9',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#2e7d32',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: '#2e7d32',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(46,125,50,0.4)',
    transition: 'transform 0.15s ease',
  },
};
