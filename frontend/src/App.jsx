// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardPage from './components/DashboardPage';
import AdvancedAnalyticsPage from './components/AdvancedAnalyticsPage';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { auth, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Router>
        <Routes>
          <Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route
            path="/"
            element={auth ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={auth ? <DashboardPage /> : <Navigate to="/login" />} 
          />
          <Route
            path="/advanced-analytics"
            element={auth ? <AdvancedAnalyticsPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
