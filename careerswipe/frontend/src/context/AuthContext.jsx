import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careerswipe_token') || null);
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('careerswipe_token', token);
      fetchUserProfile();
    } else {
      localStorage.removeItem('careerswipe_token');
      setUser(null);
      setResumeData(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      setResumeData(null); // Reset old resume data to prevent cross-user leakage
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);

        // If seeker, try loading current resume analysis
        if (data.role === 'seeker') {
          await fetchCurrentResume();
        }
      } else {
        // Token invalid, logout
        logout();
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentResume = async () => {
    try {
      const res = await fetch(`${API_URL}/resumes/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResumeData(data);
      }
    } catch (err) {
      console.warn("Failed to load existing resume:", err);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ full_name: name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setToken(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setResumeData(null);
    localStorage.removeItem('careerswipe_token');
  };

  const uploadResume = async (resumeText) => {
    if (!token) return { success: false, message: "Unauthenticated" };
    try {
      const res = await fetch(`${API_URL}/resumes/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ resumeText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setResumeData({
        raw_text: resumeText,
        analysis: data.analysis
      });
      return { success: true, analysis: data.analysis };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const uploadResumeFile = async (file) => {
    if (!token) return { success: false, message: "Unauthenticated" };
    try {
      const formData = new FormData();
      formData.append('resumeFile', file);

      const res = await fetch(`${API_URL}/resumes/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setResumeData({
        raw_text: data.raw_text || '',
        analysis: data.analysis
      });
      return { success: true, analysis: data.analysis };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      resumeData,
      register,
      login,
      logout,
      uploadResume,
      uploadResumeFile,
      refreshResume: fetchCurrentResume
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
