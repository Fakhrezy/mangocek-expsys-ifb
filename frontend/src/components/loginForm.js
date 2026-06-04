import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


export default function LoginForm({ onLoginSuccess, onClose }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? 'http://localhost:5000/register' : 'http://localhost:5000/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegister
            ? { username, email, password }
            : { email, password }
        ),
      });

      const result = await response.json();

      if (response.ok) {
        if (isRegister) {
          Swal.fire({
            icon: 'success',
            title: 'Registrasi berhasil',
            text: 'Silakan login dengan akun Anda.',
          });
          setIsRegister(false); // Kembali ke form login setelah register berhasil
        } else {
          localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('user', JSON.stringify(result.user));

Swal.fire({
  icon: 'success',
  title: 'Login berhasil',
  text: `Selamat datang, ${result.user.username}!`,
  showConfirmButton: false,
  timer: 1500,
}).then(() => {
  if (result.user.role === 'admin') {
    navigate('/dashboard');
  } else {
    navigate('/');
  }
});

        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: result.message || 'Terjadi kesalahan.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Server',
        text: 'Tidak dapat terhubung ke server.',
      });
    }
  };


  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <button onClick={onClose} style={styles.closeButton}>×</button>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>{isRegister ? 'Register' : 'Login'}</h2>

          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            {isRegister ? 'Register' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ ...styles.button, backgroundColor: 'orange', marginTop: '8px' }}
          >
            {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    position: 'relative',
    minWidth: '300px',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    backgroundColor: '#43a047',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
