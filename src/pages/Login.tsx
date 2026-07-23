import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ArrowRight, ShieldCheck, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginProps {
  onLogin: () => void;
}

const BRAND_LOGO_URL = 'https://res.cloudinary.com/ju7wkm1y/image/upload/v1784828543/ChatGPT_Image_Jul_23_2026_11_11_54_PM_axvdkp.png';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useApp();
  const [loading, setLoading] = useState(false);

  // Email / Password auth toggle state
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      onLogin();
    } catch (err: any) {
      console.error('Google login failed:', err);
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      if (authTab === 'register') {
        if (!email.includes('@') || password.length < 6) {
          throw new Error('Please enter a valid email and a password of at least 6 characters.');
        }
        await signUpWithEmail(email.trim(), password, name.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      onLogin();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please sign in.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      }
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#09090B] via-[#1F1F23] via-[#E4E4E7] to-[#FFFFFF] flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden text-black">
      {/* Ambient Top Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-black/5 blur-3xl pointer-events-none" />

      {/* Top Hero Brand Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] pt-8 sm:pt-12 flex flex-col items-center text-center space-y-3 z-10"
      >
        {/* Perfect Circle Logo Emblem */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-white/30 blur-md group-hover:opacity-100 transition duration-500" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-2xl border-4 border-white/80 ring-4 ring-black/20 flex items-center justify-center overflow-hidden">
            <img
              src={BRAND_LOGO_URL}
              alt="Laundrify Logo"
              className="w-full h-full object-cover scale-[2.7] translate-y-1"
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md pt-1">
          Laundrify
        </h1>

        <p className="text-neutral-300 text-sm font-medium tracking-wide max-w-xs drop-shadow-xs">
          Smart Hostel Laundry & Wardrobe Manager
        </p>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 pt-1">
          <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-3.5 py-1 rounded-full border border-white/20 shadow-xs">
            🧺 Room Tagged
          </span>
          <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-3.5 py-1 rounded-full border border-white/20 shadow-xs">
            🔒 Verified
          </span>
        </div>
      </motion.div>

      {/* Bottom Login Card Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 z-10 my-4 space-y-4"
      >
        {authError && (
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200 text-center">
            {authError}
          </div>
        )}

        {!isEmailMode ? (
          <>
            {/* Primary Google Auth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              id="btn-google-login"
              className="w-full py-4 px-5 bg-black text-white hover:bg-neutral-900 active:scale-98 font-bold text-sm rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl disabled:opacity-60 group border border-black"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887c-.58 3.257-3.476 5.586-6.887 5.586-4.143 0-7.5-3.357-7.5-7.5s3.357-7.5 7.5-7.5c1.86 0 3.553.685 4.86 1.815l2.42-2.42C17.72 1.83 15.15 1 12.24 1 6.14 1 1.2 5.94 1.2 12s4.94 11 11.04 11c6.33 0 10.53-4.45 10.53-10.72 0-.72-.07-1.42-.19-2.005H12.24z" />
                  </svg>
                  <span className="tracking-wide">CONTINUE WITH GOOGLE</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-mono text-neutral-400 uppercase tracking-widest absolute">
                OR EMAIL AUTH
              </span>
            </div>

            <button
              onClick={() => setIsEmailMode(true)}
              className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-black font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 border border-neutral-300"
            >
              <Mail className="w-4 h-4 text-black" />
              <span>Sign in with Email & Password</span>
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 mb-3">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authTab === 'login' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setAuthError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authTab === 'register' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
              {authTab === 'register' && (
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Kumar"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                      required={authTab === 'register'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@hostel.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white font-bold text-xs rounded-xl hover:bg-neutral-900 active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md mt-1"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <span>{authTab === 'register' ? 'REGISTER ACCOUNT' : 'LOG IN'}</span>
                )}
              </button>
            </form>

            <button
              onClick={() => setIsEmailMode(false)}
              className="w-full text-center text-xs font-mono text-neutral-500 hover:text-black pt-1"
            >
              ← Back to Google Sign-In
            </button>
          </div>
        )}

        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-neutral-500 font-mono pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-black" />
          <span>Secure Hostel Room Verification</span>
        </div>
      </motion.div>

      {/* Footer Notice */}
      <div className="text-[11px] font-mono text-neutral-500 text-center pb-2 z-10">
        Laundrify v2.4
      </div>
    </div>
  );
};
