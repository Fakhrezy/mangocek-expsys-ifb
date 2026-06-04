import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
  const hideNavbar = ['/dashboard', '/landing'].includes(location.pathname);

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
