import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import InformasiPage from "./pages/informasiPage";
import DeteksiPage from "./pages/deteksiPage";
import PakarPage from "./pages/pakarPage";
import LoginPage from './pages/landingPage';
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedRoute";
import DashboardPage from './pages/dashboardPage';
import AdminRoute from './components/adminRoute';


function AppWrapper() {
  const location = useLocation();

  // Jika pathnya '/dashboard', jangan tampilkan Navbar
  const showNavbar = location.pathname !== "/dashboard";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <InformasiPage />
            </ProtectedRoute>
          }
        />
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
