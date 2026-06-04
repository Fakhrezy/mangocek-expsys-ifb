import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import KnowledgeBaseTable from '../components/knowledgeBaseTable';

// --- SVG Icons ---
const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconLog = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconLeaf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconUpload = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const IconStat = (color) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

// --- Menu ---
const MENU = [
  { key: 'prediksi',     label: 'Prediksi',     Icon: IconCamera },
  { key: 'log-prediksi', label: 'Log Prediksi',  Icon: IconLog },
  { key: 'penyakit',     label: 'Penyakit',      Icon: IconLeaf },
  { key: 'users',        label: 'Users',         Icon: IconUsers },
];

// --- Shared styles ---
const th = { padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#555', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' };
const td = { padding: '11px 16px', fontSize: 14, color: '#333', verticalAlign: 'middle' };
const inputSt = { border: '1px solid #ddd', borderRadius: 6, padding: '6px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' };
const btnBlue  = { marginRight: 6, padding: '5px 12px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const btnRed   = { padding: '5px 12px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const btnGreen = { marginRight: 6, padding: '5px 12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const btnGray  = { padding: '5px 12px', backgroundColor: '#757575', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };

// --- Stats bar (always at top) ---
function StatsBar({ totalUsers, totalPrediksi }) {
  const cards = [
    { label: 'Total Pengguna',  value: totalUsers,    color: '#2e7d32', bg: '#e8f5e9',  icon: <IconUsers /> },
    { label: 'Total Prediksi',  value: totalPrediksi, color: '#1565c0', bg: '#e3f2fd',  icon: IconStat('#1565c0') },
  ];
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      {cards.map(({ label, value, color, bg, icon }) => (
        <div key={label} style={{ flex: '1 1 180px', backgroundColor: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ backgroundColor: bg, borderRadius: 10, padding: 10, color, flexShrink: 0 }}>{icon}</div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Panel: Prediksi ---
function PrediksiPanel({ onNewLog }) {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:5000/predict', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, label: data.label, confidence: data.confidence });
        if (onNewLog) onNewLog();
      } else {
        setResult({ ok: false, msg: data.error });
      }
    } catch {
      setResult({ ok: false, msg: 'Gagal menghubungi server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <p style={{ color: '#555', marginTop: 0, marginBottom: 20 }}>
          Upload foto buah mangga untuk mendeteksi kualitasnya menggunakan model CNN.
        </p>

        <label htmlFor="upload-predict" style={{ display: 'block', border: '2px dashed #a5d6a7', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9fdf9', marginBottom: 20 }}>
          {preview
            ? <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, objectFit: 'contain' }} />
            : <div style={{ color: '#66bb6a' }}>
                <IconUpload />
                <p style={{ margin: '12px 0 4px', fontWeight: 600, color: '#2e7d32' }}>Klik untuk pilih gambar</p>
                <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>PNG, JPG, JPEG</p>
              </div>}
        </label>
        <input id="upload-predict" type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />

        {preview && (
          <label htmlFor="upload-predict" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            <IconCamera /> Ganti Gambar
          </label>
        )}

        {loading && <p style={{ color: '#f57c00', textAlign: 'center', marginTop: 12 }}>⏳ Memproses gambar...</p>}

        {result && (
          <div style={{ padding: '16px 20px', borderRadius: 10, backgroundColor: result.ok ? '#e8f5e9' : '#ffebee', border: `1px solid ${result.ok ? '#a5d6a7' : '#ef9a9a'}`, marginTop: 8 }}>
            {result.ok ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#2e7d32' }}>✅ {result.label}</div>
                <div style={{ color: '#555', marginTop: 4, fontSize: 14 }}>Tingkat kepercayaan: <strong>{result.confidence.toFixed(1)}%</strong></div>
              </>
            ) : (
              <div style={{ color: '#c62828' }}>⚠️ {result.msg}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Panel: Log Prediksi ---
function LogPrediksiTable({ refresh }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:5000/prediksi-log')
      .then(res => { setRows(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [refresh]);

  if (loading) return <p>Memuat data...</p>;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: '#333' }}>Riwayat Prediksi</span>
        <button onClick={fetchData} style={{ padding: '5px 14px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>↻ Refresh</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={th}>No</th>
            <th style={th}>Nama File</th>
            <th style={th}>Hasil Prediksi</th>
            <th style={th}>Kepercayaan</th>
            <th style={th}>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#aaa', padding: 40 }}>Belum ada data prediksi</td></tr>
            : rows.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ ...td, color: '#999' }}>{i + 1}</td>
                <td style={td}>{r.nama_file || '-'}</td>
                <td style={td}>
                  <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                    {r.label}
                  </span>
                </td>
                <td style={td}>{parseFloat(r.confidence).toFixed(1)}%</td>
                <td style={td}>{new Date(r.waktu).toLocaleString('id-ID')}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Panel: Users ---
function UsersTable({ users, loading, error }) {
  const [rows, setRows] = useState(users);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ username: '', email: '' });

  useEffect(() => { setRows(users); }, [users]);

  const handleEdit = (u) => { setEditId(u.id); setEditData({ username: u.username, email: u.email }); };

  const handleSave = async () => {
    await axios.put(`http://localhost:5000/users/${editId}`, editData);
    setRows(prev => prev.map(u => u.id === editId ? { ...u, ...editData } : u));
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    await axios.delete(`http://localhost:5000/users/${id}`);
    setRows(prev => prev.filter(u => u.id !== id));
  };

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ backgroundColor: '#f8f9fa' }}>
          <th style={th}>ID</th><th style={th}>Username</th><th style={th}>Email</th><th style={th}>Aksi</th>
        </tr></thead>
        <tbody>
          {rows.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={td}>{u.id}</td>
              <td style={td}>{editId === u.id ? <input value={editData.username} onChange={e => setEditData({ ...editData, username: e.target.value })} style={inputSt} /> : u.username}</td>
              <td style={td}>{editId === u.id ? <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={inputSt} /> : u.email}</td>
              <td style={td}>
                {editId === u.id
                  ? <><button onClick={handleSave} style={btnGreen}>Simpan</button><button onClick={() => setEditId(null)} style={btnGray}>Batal</button></>
                  : <><button onClick={() => handleEdit(u)} style={btnBlue}>Edit</button><button onClick={() => handleDelete(u.id)} style={btnRed}>Hapus</button></>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main ---
export default function DashboardPage() {
  const [activePage, setActivePage] = useState('prediksi');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [totalPrediksi, setTotalPrediksi] = useState(0);
  const [logRefresh, setLogRefresh] = useState(0);

  const fetchStats = () => {
    axios.get('http://localhost:5000/users')
      .then(res => { setUsers(res.data.users || []); setLoadingUsers(false); })
      .catch(() => { setErrorUsers('Gagal memuat data pengguna'); setLoadingUsers(false); });

    axios.get('http://localhost:5000/prediksi-log')
      .then(res => setTotalPrediksi((res.data || []).length))
      .catch(() => {});
  };

  useEffect(() => { fetchStats(); }, []);

  const handleNewLog = () => {
    setTotalPrediksi(p => p + 1);
    setLogRefresh(r => r + 1);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = '/landing';
      }
    });
  };

  const renderContent = () => {
    switch (activePage) {
      case 'prediksi':     return <PrediksiPanel onNewLog={handleNewLog} />;
      case 'log-prediksi': return <LogPrediksiTable refresh={logRefresh} />;
      case 'penyakit':     return <KnowledgeBaseTable />;
      case 'users':        return <UsersTable users={users} loading={loadingUsers} error={errorUsers} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* ── Sidebar (putih) ── */}
      <aside style={{ width: 240, backgroundColor: '#fff', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        {/* Brand */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/images/logo.png" alt="Logo" style={{ height: 40 }} onError={e => e.target.style.display = 'none'} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#1b5e20' }}>MangoCek</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {MENU.map(({ key, label, Icon }) => {
            const active = activePage === key;
            return (
              <button
                key={key}
                onClick={() => setActivePage(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '13px 20px',
                  background: active ? '#f0f7f0' : 'none',
                  border: 'none',
                  borderLeft: active ? '4px solid #2e7d32' : '4px solid transparent',
                  color: active ? '#1b5e20' : '#555',
                  cursor: 'pointer', textAlign: 'left',
                  fontWeight: active ? 700 : 400, fontSize: 14,
                  transition: 'background 0.15s',
                }}
              >
                <Icon />{label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: '#fff5f5', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
          >
            <IconLogout /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f7fa' }}>
        {/* Top bar */}
        <header style={{ backgroundColor: 'white', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 19, color: '#1b5e20', fontWeight: 700 }}>
            {MENU.find(m => m.key === activePage)?.label}
          </h1>
          <span style={{ fontSize: 13, color: '#aaa' }}>Admin</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          <StatsBar totalUsers={users.length} totalPrediksi={totalPrediksi} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
