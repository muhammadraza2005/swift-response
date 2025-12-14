'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/login?message=Account created! Please log in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#F4B942] to-[#FFD700] px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#008C5A] opacity-10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-white opacity-20 rounded-full blur-3xl" style={{animation: 'float 6s ease-in-out infinite'}}></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#00A366] opacity-10 rounded-full blur-2xl" style={{animation: 'float 8s ease-in-out infinite'}}></div>
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-white opacity-15 rounded-full blur-3xl" style={{animation: 'float 7s ease-in-out infinite'}}></div>
      
      {/* Signup Card */}
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-[#FFD700] mb-2">Create Account</h2>
          <p className="text-gray-600">Join Swift Response today</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white"
              placeholder="John Doe"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all duration-300 hover:border-gray-300 pr-12 bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FFD700] transition-colors duration-300 hover:scale-110 active:scale-95"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Must be at least 6 characters</p>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-2">I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white cursor-pointer"
            >
              <option value="citizen">Citizen (I need help)</option>
              <option value="volunteer">Volunteer (I want to help)</option>
              <option value="ngo_admin">NGO Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#F4B942] text-gray-900 font-bold py-4 rounded-xl hover:from-[#F4B942] hover:to-[#FFD700] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FFD700] font-bold hover:text-[#F4B942] hover:underline transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
