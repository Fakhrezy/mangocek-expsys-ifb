import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Akses ditolak',
        text: 'Hanya admin yang dapat mengakses halaman ini',
        confirmButtonText: 'Kembali',
      }).then(() => {
        navigate('/login');
      });
    }
  }, [isLoggedIn, user, navigate]);

  if (!isLoggedIn || !user || user.role !== 'admin') {
    return null;
  }

  return children;
};

export default AdminRoute;
