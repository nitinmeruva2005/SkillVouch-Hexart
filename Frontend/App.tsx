import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from './components/Logo';

// Auth forms component
function AuthForms() {
  const { login, signup, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    setError('');
    
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return false;
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Invalid email format. Example: user@example.com');
        return false;
      }
      
      // Password length
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      
      // Password match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
        setSuccess('Account created successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <Logo className="w-20 h-20 mb-2" />
          <h1 className="text-3xl font-bold text-white">SkillVouch AI</h1>
          <p className="text-slate-400">Connect • Learn • Grow</p>
        </div>

        {error && (
          <div className="flex items-center text-red-400 text-sm bg-red-400/10 p-3 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded-lg mb-4">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard component
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p className="text-slate-400">Name: {user?.name}</p>
            <p className="text-slate-400">Email: {user?.email}</p>
            {user?.bio && <p className="text-slate-400 mt-2">{user.bio}</p>}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            {user?.skillsKnown && user.skillsKnown.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsKnown.map((skill, idx) => (
                  <span key={idx} className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No skills added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <AuthForms />;
}
