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
        {/* ── OAuth 1-Click Buttons ── */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => {
              const googleUser = { name: "Google User", email: "user.google@gmail.com", phone: "" };
              localStorage.setItem("annavedah-user-profile", JSON.stringify(googleUser));
              setUserProfile(googleUser);
            }}
            className="w-full bg-white border-2 border-[#e8ddd0] hover:border-[#c9a45c] text-[#2d1b15] font-bold text-xs py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google OAuth</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const fbUser = { name: "Facebook User", email: "user.fb@facebook.com", phone: "" };
              localStorage.setItem("annavedah-user-profile", JSON.stringify(fbUser));
              setUserProfile(fbUser);
            }}
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Continue with Facebook Auth</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e8ddd0]" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#6b5347] bg-white px-3 tracking-widest">
              OR LOG IN WITH PASSWORD
            </div>
          </div>
        </div>

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
