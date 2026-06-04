import { useState } from 'react';
import Swal from 'sweetalert2';
import LoginForm from '../components/loginForm';
import FlipCard from '../components/flipcard';
import knowledgeBase from '../data/knowledgeBase.json';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const onLoginSuccess = () => {
    setShowLogin(false);
    window.location.reload();
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('isLoggedIn');
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Logout',
          showConfirmButton: false,
          timer: 1200,
        }).then(() => {
          window.location.href = '/landing';
        });
      }
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.imageBox}>
            <img src="images/ill3.jpg" alt="Ilustrasi" style={styles.heroImage} />
          </div>
          <div style={styles.textContent}>
            <h1 style={styles.heading}>Selamat Datang di Aplikasi Mangocek</h1>
            <p style={styles.description}>
              Aplikasi sistem pakar untuk mendeteksi penyakit tumbuhan mangga
            </p>
            {isLoggedIn ? (
              <button style={styles.primaryBtn} onClick={handleLogout}>Logout</button>
            ) : (
              <button style={styles.primaryBtn} onClick={() => setShowLogin(true)}>Login</button>
            )}
          </div>
        </div>
      </div>

      {/* Tentang Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Tentang Aplikasi</h2>
        <p style={styles.sectionText}>
          Mangocek adalah sistem pakar yang dirancang untuk membantu petani dan pengguna
          dalam mendiagnosis penyakit pada tanaman mangga secara cepat dan akurat.
          Aplikasi ini menggunakan metode forward chaining untuk mencocokkan gejala dan
          memberikan diagnosis serta solusi penanganan.
        </p>
      </div>

      {/* Informasi Penyakit Section */}
      <div style={styles.infoSection}>
        <h2 style={styles.sectionTitle}>Informasi Penyakit Mangga</h2>
        <p style={styles.sectionSubText}>Klik kartu untuk melihat gejala dan cara pengendalian</p>
        <div style={styles.grid}>
          {knowledgeBase.penyakit.map((p) => (
            <FlipCard
              key={p.id}
              coverTitle={p.nama}
              infoContent={p.deskripsi}
              symptoms={p.gejala.map((g) => g.deskripsi)}
              control={p.pengendalian}
            />
          ))}
        </div>
      </div>

      {showLogin && (
        <LoginForm onClose={() => setShowLogin(false)} onLoginSuccess={onLoginSuccess} />
      )}
    </div>
  );
}

const styles = {
  hero: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  heroContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    maxWidth: '1000px',
    flexWrap: 'wrap',
  },
  imageBox: {
    flex: '1 1 380px',
    textAlign: 'center',
  },
  heroImage: {
    width: '100%',
    maxWidth: '460px',
    height: 'auto',
    borderRadius: 12,
  },
  textContent: {
    flex: '1 1 340px',
  },
  heading: {
    fontSize: '2.4rem',
    color: '#2e7d32',
    marginBottom: '16px',
    lineHeight: 1.3,
  },
  description: {
    fontSize: '1.1rem',
    marginBottom: '28px',
    color: '#555',
    lineHeight: 1.6,
  },
  primaryBtn: {
    padding: '12px 32px',
    fontSize: '16px',
    backgroundColor: '#43a047',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  section: {
    padding: '60px 20px',
    backgroundColor: '#f1f8e9',
    textAlign: 'center',
  },
  infoSection: {
    padding: '60px 20px',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '2rem',
    color: '#2e7d32',
    marginBottom: '16px',
  },
  sectionText: {
    fontSize: '1.1rem',
    maxWidth: '800px',
    margin: '0 auto',
    color: '#444',
    lineHeight: 1.7,
  },
  sectionSubText: {
    fontSize: '1rem',
    color: '#777',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};
