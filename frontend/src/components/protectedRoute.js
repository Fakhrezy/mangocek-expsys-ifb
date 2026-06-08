import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Anda harus login terlebih dahulu',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/landing');
      });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return children;
};

export default ProtectedRoute;
