'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get('redirect');
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-[120px] lg:pt-[190px] pb-16 flex items-center justify-center bg-[#faf6f0] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#e8ddd0] shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8b1a1a] mb-2">Welcome Back</h1>
          <p className="text-[#6b5347]">Log in to your Annavedah account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:outline-none focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/20 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:outline-none focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/20 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
          </Button>
        </form>

        <p className="mt-8 text-center text-[#6b5347] text-sm">
          Don't have an account?{' '}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.location.href = '/register' + window.location.search; }} 
            className="font-bold text-[#c9a45c] hover:text-[#8b1a1a] transition-colors"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
