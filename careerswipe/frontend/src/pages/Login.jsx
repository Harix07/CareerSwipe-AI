import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

export default function Login({ onNavigate }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('seeker'); // 'seeker' | 'recruiter'

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email || !password || (isRegister && !name)) {
      setErrorMsg('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isRegister) {
        result = await register(name, email, password, role);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        if (isRegister) {
          // Success registration flow: redirect to login form
          setIsRegister(false);
          setPassword('');
          setName('');
          setSuccessMsg('Registration successful! Please sign in with your credentials.');
        } else {
          // Redirect based on role
          if (role === 'recruiter') {
            onNavigate('recruiter-dashboard');
          } else {
            onNavigate('seeker-dashboard');
          }
        }
      } else {
        setErrorMsg(result.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getAccentClass = () => {
    return role === 'seeker' ? 'text-cyan-400' : 'text-purple-400';
  };

  const getButtonClass = () => {
    return role === 'seeker' ? 'glow-btn-cyan' : 'glow-btn-purple';
  };

  return (
    <div className="relative min-h-screen flex-center px-4 py-12 dots-grid">
      <ParticleBackground />

      {/* Back button */}
      <div className="absolute top-6 left-6 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex-center font-bold text-sm text-cyan-400">
          ←
        </div>
        <span className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Back to Home</span>
      </div>

      <div className="w-full max-w-md glass-card p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-t border-slate-700/50">
        {/* Core Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold tracking-wider text-slate-400 mb-4 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            CareerSwipe Gateway
          </div>
          <h2 className="text-3xl font-display font-extrabold mb-2">
            {isRegister ? 'Join CareerSwipe' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {isRegister ? 'Create an account to start matching.' : 'Sign in to access your dashboard.'}
          </p>
        </div>

        {/* Form Error */}
        {errorMsg && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs py-3 px-4 rounded-xl text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Form Success */}
        {successMsg && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3 px-4 rounded-xl text-center leading-relaxed font-bold">
            {successMsg}
          </div>
        )}

        {/* Role Selector Slider */}
        <div className="mb-6 bg-slate-950/80 p-1.5 border border-slate-800/80 rounded-xl grid grid-cols-2 relative">
          <button
            type="button"
            onClick={() => { setRole('seeker'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
              role === 'seeker' ? 'bg-slate-900 text-cyan-400 shadow' : 'bg-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" /> Job Seeker
          </button>
          <button
            type="button"
            onClick={() => { setRole('recruiter'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
              role === 'recruiter' ? 'bg-slate-900 text-purple-400 shadow' : 'bg-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Recruiter
          </button>
        </div>

        {/* Core Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="custom-label">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 flex items-center justify-center pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="custom-input pl-11"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="custom-label">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 flex items-center justify-center pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input pl-11"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="custom-label">Password</label>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 flex items-center justify-center pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="custom-input pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-500 hover:text-slate-300 cursor-pointer p-0 flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold flex-center mt-6 ${getButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <hr className="border-slate-800/80 my-6" />

        {/* Toggle Account State */}
        <div className="text-center text-xs text-slate-400 leading-relaxed">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`font-semibold bg-transparent border-none cursor-pointer hover:underline ${getAccentClass()}`}
          >
            {isRegister ? 'Log in instead' : 'Register now for free'}
          </button>
        </div>
      </div>
    </div>
  );
}
