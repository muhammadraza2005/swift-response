'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Loader from '@/components/Loader';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-50 rounded-md">
        <Loader variant="inline" size="sm" text="Loading..." className="!text-gray-400" />
      </div>
    );
  }

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-md font-bold hover:bg-red-600 transition-colors text-sm"
      >
        Log Out
      </button>
    );
  }

  return (
    <a
      href="/login"
      className="bg-green-500 text-white px-4 py-2 rounded-md font-bold hover:bg-green-600 transition-colors text-sm"
    >
      Log In
    </a>
  );
}
