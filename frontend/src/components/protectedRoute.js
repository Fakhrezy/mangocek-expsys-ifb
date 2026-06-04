import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Anda harus login terlebih dahulu',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/login');
      });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    // Jangan render children kalau belum login
    return null;
  }

  return children;
};

export default ProtectedRoute;
