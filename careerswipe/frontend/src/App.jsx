import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SeekerDashboard from './pages/SeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  // Sync current page with authentication state
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'recruiter') {
          setCurrentPage('recruiter-dashboard');
        } else {
          setCurrentPage('seeker-dashboard');
        }
      } else {
        // If not logged in and on a dashboard, redirect to home
        if (currentPage === 'seeker-dashboard' || currentPage === 'recruiter-dashboard') {
          setCurrentPage('home');
        }
      }
    }
  }, [user, loading]);

  const handleNavigate = (page) => {
    // Basic route protection
    if ((page === 'seeker-dashboard' || page === 'recruiter-dashboard') && !user) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#05070f] flex-center flex-col gap-4 z-[9999]">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
        <span className="font-display font-extrabold text-sm tracking-widest text-cyan-400 uppercase animate-pulse">
          Syncing CareerSwipe...
        </span>
      </div>
    );
  }

  switch (currentPage) {
    case 'login':
      return <Login onNavigate={handleNavigate} />;
    case 'seeker-dashboard':
      return <SeekerDashboard onNavigate={handleNavigate} />;
    case 'recruiter-dashboard':
      return <RecruiterDashboard onNavigate={handleNavigate} />;
    case 'home':
    default:
      return <Home onNavigate={handleNavigate} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
