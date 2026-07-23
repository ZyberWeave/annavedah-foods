'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Info, Sparkles, Shield, Leaf, Heart } from 'lucide-react';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateOtp,
  getPasswordStrength,
  getStrengthColor,
  getStrengthLabel,
} from '@/lib/validations';

type FieldKey = 'name' | 'email' | 'password';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
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

  const validateField = (field: string, value: string) => {
    let result;
    switch (field) {
      case 'name':
        result = validateName(value, 'Full name');
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        const clean = value.replace(/\D/g, '');
        result = { valid: clean.length >= 10, message: 'Please enter a valid 10-digit mobile number' };
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'otp':
        result = validateOtp(value);
        break;
      default:
        return;
    }
    setFieldErrors(prev => ({ ...prev, [field]: result.valid ? '' : result.message }));
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const validateDetailsStep = (): boolean => {
    const nameResult = validateName(name, 'Full name');
    const emailResult = validateEmail(email);
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneValid = cleanPhone.length >= 10;
    const passwordResult = validatePassword(password);
    setFieldErrors({
      name: nameResult.valid ? '' : nameResult.message,
      email: emailResult.valid ? '' : emailResult.message,
      phone: phoneValid ? '' : 'Please enter a valid 10-digit mobile number',
      password: passwordResult.valid ? '' : passwordResult.message,
    });
    setTouched({ name: true, email: true, phone: true, password: true });
    return nameResult.valid && emailResult.valid && phoneValid && passwordResult.valid;
  };

  const validateOtpStep = (): boolean => {
    const otpResult = validateOtp(otp);
    setFieldErrors(prev => ({ ...prev, otp: otpResult.valid ? '' : otpResult.message }));
    setTouched(prev => ({ ...prev, otp: true }));
    return otpResult.valid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 'details' && !validateDetailsStep()) return;
    if (step === 'otp' && !validateOtpStep()) return;

    setLoading(true);

    try {
      const payload = step === 'details' 
        ? { name, email, phone, password }
        : { name, email, phone, password, otp };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      if (data.status === 'pending_otp') {
        setStep('otp');
        setLoading(false);
        return;
      }

      const profile = { name, email, phone };
      localStorage.setItem('annavedah-user-profile', JSON.stringify(profile));
      window.dispatchEvent(new Event('auth-changed'));

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

  const passwordInfo = getPasswordStrength(password);
  const strengthColor = getStrengthColor(passwordInfo.strength);
  const strengthLabel = getStrengthLabel(passwordInfo.strength);

  const inputClass = (field: string, value: string) => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && value;
    return `w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 bg-white/80 backdrop-blur-sm ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-200 bg-red-50/30'
        : isValid
        ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
        : 'border-[#e8ddd0] focus:border-[#c9a45c] focus:ring-[#c9a45c]/20'
    }`;
  };

  const benefits = [
    { icon: Shield, label: 'Secure checkout with encryption' },
    { icon: Leaf, label: 'Farm-fresh, pure ingredients' },
    { icon: Heart, label: 'Exclusive member-only offers' },
    { icon: Sparkles, label: 'Early access to new products' },
  ];

  return (
    <div className="min-h-screen pt-0 pb-12 flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #faf6f0 0%, #f5ede3 40%, #faf6f0 100%)',
      }}
    >
      {/* Subtle decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #8b1a1a, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #c9a45c, transparent 70%)' }} />
      </div>

      <div
        className={`relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{
          boxShadow: '0 25px 60px -12px rgba(139,26,26,0.12), 0 0 0 1px rgba(232,221,208,0.6)',
        }}
      >
        {/* ── Left Brand Panel ── */}
        <div
          className="hidden lg:flex lg:col-span-2 flex-col justify-between p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #2d1b15 0%, #4a2518 40%, #8b1a1a 100%)',
          }}
        >
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c9a45c' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zM0 20h20v2H0v-2zm0 4h20v2H0v-2zm0 4h20v2H0v-2zm0 4h20v2H0v-2zm0 4h20v2H0v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Floating glow */}
          <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
            style={{ background: '#c9a45c' }} />

          {/* Top content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Image
                src="/Logo.webp"
                alt="Annavedah"
                width={44}
                height={44}
                className="rounded-xl"
              />
              <span className="text-white/90 font-bold text-lg tracking-wide">Annavedah</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Start your journey to
              <span className="block mt-1" style={{ color: '#c9a45c' }}>
                पौष्टिक living
              </span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Join thousands of families who trust Annavedah for farm-sourced, सात्विक nutrition — crafted with care, delivered with love.
            </p>
          </div>

          {/* Benefits list */}
          <div className="relative z-10 space-y-4 mt-8">
            {benefits.map((b, i) => (
              <div
                key={b.label}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                  transitionDelay: `${400 + i * 120}ms`,
                }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,164,92,0.15)' }}>
                  <b.icon className="w-4 h-4" style={{ color: '#c9a45c' }} />
                </div>
                <span className="text-white/75 text-sm">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom trust badge */}
          <div className="relative z-10 mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-xs">
              🔒 Your data is encrypted and never shared with third parties.
            </p>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="lg:col-span-3 bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <Image src="/Logo.webp" alt="Annavedah" width={36} height={36} className="rounded-lg" />
              <span className="font-bold text-[#2d1b15] text-lg">Annavedah</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[3px] rounded-full" style={{ background: '#c9a45c' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c9a45c' }}>
                  {step === 'details' ? 'Get Started' : 'Verification'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#2d1b15] mb-2">
                {step === 'details' ? 'Create your account' : 'Verify your email'}
              </h1>
              <p className="text-[#6b5347] text-sm">
                {step === 'details'
                  ? 'Fill in your details to join the Annavedah family.'
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>

            {/* ── OAuth 1-Click Buttons ── */}
            {step === 'details' && (
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
                    OR REGISTER WITH EMAIL & PHONE
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #fef2f2, #fff5f5)',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              {step === 'details' ? (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (touched.name) validateField('name', e.target.value);
                        }}
                        onBlur={() => handleBlur('name', name)}
                        className={inputClass('name', name)}
                        placeholder="Rahul Desai"
                        autoComplete="name"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby="name-error"
                      />
                      {touched.name && !fieldErrors.name && name && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {touched.name && fieldErrors.name && (
                      <p id="name-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
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
                        onBlur={() => handleBlur('email', email)}
                        className={inputClass('email', email)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby="email-error"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Mobile Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPhone(val);
                          if (touched.phone) validateField('phone', val);
                        }}
                        onBlur={() => handleBlur('phone', phone)}
                        className={inputClass('phone', phone)}
                        placeholder="9876543210"
                        autoComplete="tel"
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby="phone-error"
                      />
                      {touched.phone && !fieldErrors.phone && phone.length >= 10 && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {touched.phone && fieldErrors.phone && (
                      <p id="phone-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Password */}
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
                        onBlur={() => handleBlur('password', password)}
                        className={`${inputClass('password', password)} pr-12`}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        aria-invalid={!!fieldErrors.password}
                        aria-describedby="password-error password-strength"
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

                    {/* Password strength meter */}
                    {password && (
                      <div id="password-strength" className="mt-2.5 space-y-2">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="h-1.5 flex-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: i <= passwordInfo.score ? strengthColor : '#e8ddd0',
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: strengthColor }}>
                            {strengthLabel}
                          </span>
                          {passwordInfo.feedback.length > 0 && (
                            <span className="text-[10px] text-[#6b5347]">
                              Need: {passwordInfo.feedback.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {touched.password && fieldErrors.password && !password && (
                      <p id="password-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Password requirements */}
                  <div className="rounded-xl p-3.5"
                    style={{ background: 'linear-gradient(135deg, #faf6f0, #f5ede3)', border: '1px solid #e8ddd0' }}>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#6b5347] mb-2 flex items-center gap-1.5">
                      <Info className="w-3 h-3" /> Password requirements
                    </p>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        { label: '8+ characters', test: password.length >= 8 },
                        { label: 'Uppercase letter', test: /[A-Z]/.test(password) },
                        { label: 'Lowercase letter', test: /[a-z]/.test(password) },
                        { label: 'A number', test: /\d/.test(password) },
                      ].map(({ label, test }) => (
                        <li
                          key={label}
                          className={`text-[11px] flex items-center gap-1.5 transition-all duration-300 ${
                            test ? 'text-green-600' : 'text-[#a39189]'
                          }`}
                        >
                          {test ? (
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#d4c5b5] flex-shrink-0" />
                          )}
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                /* OTP Step */
                <div>
                  <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                      if (touched.otp) validateField('otp', val);
                    }}
                    onBlur={() => handleBlur('otp', otp)}
                    className={`${inputClass('otp', otp)} text-center text-2xl tracking-widest font-bold`}
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-invalid={!!fieldErrors.otp}
                    aria-describedby="otp-error"
                  />
                  {touched.otp && fieldErrors.otp && (
                    <p id="otp-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {fieldErrors.otp}
                    </p>
                  )}
                  <p className="text-xs text-[#6b5347] mt-2 text-center">
                    Didn&apos;t receive the code? Check your spam folder.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-white font-bold rounded-xl transition-all duration-300 mt-2 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #8b1a1a 0%, #6d1414 100%)',
                  boxShadow: '0 4px 15px -3px rgba(139,26,26,0.4)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === 'details' ? 'Continue' : 'Verify & Register')}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #a02020 0%, #8b1a1a 100%)' }} />
              </Button>
              
              {step === 'otp' && (
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full mt-3 text-sm font-semibold text-[#6b5347] hover:text-[#2d1b15] transition-colors"
                >
                  &larr; Back to edit details
                </button>
              )}
            </form>

            {/* Footer Link */}
            {step === 'details' && (
              <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid #e8ddd0' }}>
                <p className="text-[#6b5347] text-sm">
                  Already have an account?{' '}
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); window.location.href = '/login' + window.location.search; }} 
                    className="font-bold transition-colors"
                    style={{ color: '#c9a45c' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#8b1a1a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#c9a45c')}
                  >
                    Log In
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
