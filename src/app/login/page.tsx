'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#008C5A] via-[#00A366] to-[#006B47] px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#FFD700] opacity-10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#00A366] opacity-10 rounded-full blur-2xl" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-[#FFD700] opacity-5 rounded-full blur-3xl" style={{ animation: 'float 7s ease-in-out infinite' }}></div>

      {/* Login Card */}
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-[#008C5A] mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue to Swift Response</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008C5A] focus:border-[#008C5A] transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008C5A] focus:border-[#008C5A] transition-all duration-300 hover:border-gray-300 pr-12 bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#008C5A] transition-colors duration-300 hover:scale-110 active:scale-95"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#008C5A] to-[#00A366] text-white font-bold py-4 rounded-xl hover:from-[#006B47] hover:to-[#008C5A] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Logging in...
              </span>
            ) : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#008C5A] font-bold hover:text-[#006B47] hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
