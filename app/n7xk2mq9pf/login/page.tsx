'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { ADMIN_SLUG } from '@/lib/admin-config';

export default function SecureLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Only allow admin role through this login
      if (data.user.role !== 'admin') {
        throw new Error('Access denied');
      }

      router.push(`/${ADMIN_SLUG}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <div className="max-w-sm w-full">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shadow-2xl">
            <Lock className="w-7 h-7 text-[#c9a45c]" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-white text-center mb-1">Secure Access</h1>
        <p className="text-sm text-[#666] text-center mb-8">Authorized personnel only</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#c9a45c] focus:ring-1 focus:ring-[#c9a45c]/20 transition-all"
              placeholder="Email"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#c9a45c] focus:ring-1 focus:ring-[#c9a45c]/20 transition-all"
              placeholder="Password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#555] hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#c9a45c] hover:bg-[#b8933e] text-[#0f0f0f] font-bold rounded-xl transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
          </Button>
        </form>
      </div>
    </div>
  );
}
