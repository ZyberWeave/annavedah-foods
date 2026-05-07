'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Mail, KeyRound, CheckCircle2 } from 'lucide-react';

type Step = 'email' | 'otp' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen site-page-gap pb-16 flex items-center justify-center bg-[#faf6f0] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#e8ddd0] shadow-xl">

        {/* ─── Step 1: Enter Email ─── */}
        {step === 'email' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#c9a45c]/15 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-[#c9a45c]" />
              </div>
              <h1 className="text-3xl font-bold text-[#8b1a1a] mb-2">Forgot Password?</h1>
              <p className="text-[#6b5347] text-sm">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-6">
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
              </Button>
            </form>

            <p className="mt-6 text-center">
              <Link href="/login" className="text-sm font-semibold text-[#c9a45c] hover:text-[#8b1a1a] transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </p>
          </>
        )}

        {/* ─── Step 2: Enter OTP + New Password ─── */}
        {step === 'otp' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#c9a45c]/15 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7 text-[#c9a45c]" />
              </div>
              <h1 className="text-3xl font-bold text-[#8b1a1a] mb-2">Reset Password</h1>
              <p className="text-[#6b5347] text-sm">
                Enter the 6-digit code sent to <span className="font-semibold text-[#2d1b15]">{email}</span> and choose a new password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:outline-none focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/20 transition-all text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d1b15] mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:outline-none focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/20 transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:outline-none focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/20 transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </Button>
            </form>

            <p className="mt-6 text-center">
              <button
                onClick={() => { setStep('email'); setError(''); }}
                className="text-sm font-semibold text-[#c9a45c] hover:text-[#8b1a1a] transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Try a different email
              </button>
            </p>
          </>
        )}

        {/* ─── Step 3: Success ─── */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#8b1a1a] mb-2">Password Reset!</h1>
              <p className="text-[#6b5347] text-sm">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl transition-all"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
