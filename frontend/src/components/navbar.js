import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoginForm from './loginForm';

export default function Navbar() {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const openLoginModal = () => setModalIsOpen(true);
  const closeLoginModal = () => setModalIsOpen(false);

  const onLoginSuccess = () => {
    closeLoginModal();
    navigate("/");
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
        localStorage.removeItem("isLoggedIn");
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Logout',
          showConfirmButton: false,
          timer: 1200,
        }).then(() => {
          navigate("/");
          window.location.reload();
        });
      }
    });
  };

  return (
    <>
      <nav style={styles.navbar}>
        <Link to="/login">
          <img src="/images/navlogo.png" alt="Mangocek Logo" style={styles.logoImg} />
        </Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Informasi</Link>
          <Link to="/deteksi" style={styles.link}>Deteksi</Link>
          <Link to="/pakar" style={styles.link}>Pakar</Link>
          {!isLoggedIn ? (
            <button onClick={openLoginModal} style={styles.login}>Login</button>
          ) : (
            <button onClick={handleLogout} style={styles.logout}>Logout</button>
          )}
        </div>
      </nav>

      {modalIsOpen && (
        <LoginForm onLoginSuccess={onLoginSuccess} onClose={closeLoginModal} />
      )}
    </>
  );
}

const styles = {
  navbar: {
    backgroundColor: 'white',
    padding: '5px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logoImg: {
    height: '90px',
    objectFit: 'contain',
    cursor: 'pointer',
  },
  links: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  link: {
    color: 'black',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  },
  login: {
    color: 'white',
    backgroundColor: '#43a047',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '5px',
    border: '1px solid white',
    cursor: 'pointer',
  },
  logout: {
    backgroundColor: 'white',
    color: 'green',
    fontWeight: '600',
    border: '1px solid white',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
  }
};
