'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateEmail, validateRequired } from '@/lib/validations';

import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mobileInput, setMobileInput] = useState('');
  const [completeMsg, setCompleteMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('annavedah-user-profile');
      if (raw) {
        const u = JSON.parse(raw);
        setUserProfile(u);
        if (u.email && u.phone && u.phone.replace(/\D/g, '').length >= 10) {
          router.replace('/dashboard');
        }
      }
    } catch {}
  }, [router]);

  // Per-field errors & touched state for inline validation
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validateField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      const result = validateEmail(value);
      setFieldErrors(prev => ({ ...prev, email: result.valid ? '' : result.message }));
    }
    if (field === 'password') {
      const result = validateRequired(value, 'Password');
      setFieldErrors(prev => ({ ...prev, password: result.valid ? '' : result.message }));
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, field === 'email' ? email : password);
  };

  const validateAll = (): boolean => {
    const emailResult = validateEmail(email);
    const passwordResult = validateRequired(password, 'Password');
    setFieldErrors({
      email: emailResult.valid ? '' : emailResult.message,
      password: passwordResult.valid ? '' : passwordResult.message,
    });
    setTouched({ email: true, password: true });
    return emailResult.valid && passwordResult.valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateAll()) return;

    setLoading(true);

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

      window.dispatchEvent(new Event('auth-changed'));

      // All users go to dashboard from the regular login
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect');
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: 'email' | 'password') => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && (field === 'email' ? email : password);
    return `w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 bg-white/80 backdrop-blur-sm ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-200 bg-red-50/30'
        : isValid
        ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
        : 'border-[#e8ddd0] focus:border-[#c9a45c] focus:ring-[#c9a45c]/20'
    }`;
  };

  if (userProfile && (!userProfile.phone || userProfile.phone.replace(/\D/g, '').length < 10)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#faf6f0]">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-[#e8ddd0] shadow-xl text-center space-y-5">
          <span className="bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            FINISH YOUR REGISTRATION
          </span>
          <h2 className="text-2xl font-bold text-[#2d1b15]">Complete Your Profile</h2>
          <p className="text-xs text-[#6b5347]">
            You are logged in as <strong className="text-[#2d1b15]">{userProfile.email}</strong>. Please attach your 10-digit mobile number to complete registration.
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const clean = mobileInput.replace(/\D/g, '');
            if (clean.length < 10) {
              setCompleteMsg('Please enter a valid 10-digit mobile number.');
              return;
            }
            const updated = { ...userProfile, phone: clean };
            localStorage.setItem('annavedah-user-profile', JSON.stringify(updated));
            window.dispatchEvent(new Event('auth-changed'));
            router.replace('/dashboard');
          }} className="space-y-4">
            {completeMsg && <p className="text-red-500 text-xs font-bold">{completeMsg}</p>}
            <input
              type="tel"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#8b1a1a]"
              required
            />
            <Button type="submit" className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider">
              ATTACH MOBILE & FINISH REGISTRATION
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen site-page-gap pb-16 flex items-center justify-center bg-[#faf6f0] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#e8ddd0] shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8b1a1a] mb-2">Welcome Back</h1>
          <p className="text-[#6b5347]">Log in to your Annavedah account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) validateField('email', e.target.value);
                }}
                onBlur={() => handleBlur('email')}
                className={inputClass('email')}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby="email-error"
              />
              {touched.email && !fieldErrors.email && email && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {touched.email && fieldErrors.email && (
              <p id="email-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) validateField('password', e.target.value);
                }}
                onBlur={() => handleBlur('password')}
                className={`${inputClass('password')} pr-12`}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6b5347] hover:text-[#2d1b15] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <p id="password-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-xs font-semibold text-[#c9a45c] hover:text-[#8b1a1a] transition-colors"
            >
              Forgot your password?
            </a>
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
