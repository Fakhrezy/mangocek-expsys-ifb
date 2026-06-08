import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthorized = !!token && user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      Swal.fire({
        icon: 'error',
        title: 'Akses ditolak',
        text: 'Hanya admin yang dapat mengakses halaman ini',
        confirmButtonText: 'Kembali',
      }).then(() => {
        navigate('/landing');
      });
    }
  }, [isAuthorized, navigate]);

  if (!isAuthorized) return null;

  return children;
};

export default AdminRoute;
