import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import DeteksiPage from "./pages/deteksiPage";
import PakarPage from "./pages/pakarPage";
import LandingPage from './pages/landingPage';
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedRoute";
import DashboardPage from './pages/dashboardPage';
import AdminRoute from './components/adminRoute';
import FloatingChatbot from './components/chatbot';

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = ['/dashboard', '/landing'].includes(location.pathname);

  // Cek expiry JWT setiap navigasi; auto-logout jika kadaluarsa
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        navigate('/landing');
      }
    } catch {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
    }
  }, [location.pathname, navigate]);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <FloatingChatbot />
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route
          path="/deteksi"
          element={
            <ProtectedRoute>
              <DeteksiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pakar"
          element={
            <ProtectedRoute>
              <PakarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
