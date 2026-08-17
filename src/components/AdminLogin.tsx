import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { verifyAdminCredentials } from '../firebase-mock';

interface AdminLoginProps {
  language: Language;
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export default function AdminLogin({ language, onLoginSuccess, onBackToHome }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      const result = await verifyAdminCredentials({
        username: cleanUsername,
        password: cleanPassword
      });

      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(
          result.error ||
          (language === 'bn'
            ? 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Invalid username or password! Please try again.')
        );
      }
    } catch (err: any) {
      setErrorMsg(language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-[#B8862A]/25 shadow-xl space-y-6 relative bg-grain">
        
        {/* Floating Back Button */}
        <button 
          onClick={onBackToHome}
          className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition cursor-pointer border border-[#B8862A]/10 bg-[#FAF7F2] shadow-xs flex items-center justify-center"
          title={language === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="text-center space-y-3 pt-4">
          <div className="p-3 bg-[#2E5942]/10 rounded-full inline-block text-[#2E5942] border border-[#2E5942]/10 shadow-inner">
            <Lock className="h-8 w-8 text-[#B8862A]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black font-serif text-[#1C3E2D] tracking-tight">
              {language === 'bn' ? 'অ্যাডমিন পোর্টাল লগইন' : 'Admin Portal Login'}
            </h2>
            <p className="text-xs text-stone-500 font-sans leading-relaxed mt-1">
              {language === 'bn' 
                ? 'স্লাইডার পরিবর্তন, কার্যক্রম নিয়ন্ত্রণ বা কন্টেন্ট এডিট করতে লগইন করুন।' 
                : 'Log in to manage home sliders, activities, and edit pages information.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block font-sans">
              {language === 'bn' ? 'ইউজারনেম / আইডি' : 'Username / Admin ID'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                <User className="h-4 w-4" />
              </span>
              <input 
                type="text"
                placeholder={language === 'bn' ? 'যেমন: admin' : 'e.g. admin'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#B8862A]/25 rounded-xl text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942]/20 font-sans font-medium text-sm transition"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block font-sans">
              {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                <Lock className="h-4 w-4" />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-[#B8862A]/25 rounded-xl text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942]/20 font-sans font-medium text-sm transition"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-start gap-2 border border-red-200 font-sans leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-650 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-sans text-xs font-black uppercase tracking-widest rounded-xl transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
              </span>
            ) : (
              <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-[11px] text-stone-400 font-sans">
          <span>{language === 'bn' ? 'নিরাপদ সেশন ব্যবস্থা' : 'Secure Admin Session System'}</span>
        </div>
      </div>
    </div>
  );
}
