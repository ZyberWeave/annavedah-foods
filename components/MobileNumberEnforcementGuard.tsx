"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Pages requiring a mandatory attached mobile number
const PROTECTED_PREFIXES = ["/account", "/checkout", "/orders", "/profile"];
const PROFILE_KEY = "annavedah-user-profile";

export default function MobileNumberEnforcementGuard() {
  const pathname = usePathname();

  const [profile, setProfile] = useState<any>(null);
  const [inputPhone, setInputPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [inputOtp, setInputOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      // fallback
    }
  }, [pathname]);

  if (!profile) return null;

  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const hasValidPhone = Boolean(profile.phone && profile.phone.replace(/\D/g, "").length >= 10);

  if (!isProtectedPage || hasValidPhone) {
    return null;
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPhone.replace(/\D/g, "");
    if (clean.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setErrorMsg("");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp.trim() !== generatedOtp) {
      setErrorMsg("Invalid OTP code. Please enter the 6-digit OTP sent to your phone.");
      return;
    }

    const updated = { ...profile, phone: inputPhone.trim() };
    setProfile(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    }

    setOtpSent(false);
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-red-200">
        <div className="text-center space-y-3">
          <span className="bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            MANDATORY ACTION REQUIRED
          </span>

          <h3 className="text-xl font-bold text-[#2d1b15]">
            Attach Mobile Number to Proceed
          </h3>

          <p className="text-xs text-[#6b5347] font-medium">
            You logged in as <strong className="text-[#2d1b15]">{profile.email}</strong>. To access your dashboard and checkout, you must verify a valid mobile number for order updates.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                10-Digit Mobile Number *
              </label>
              <div className="flex gap-2">
                <span className="bg-[#faf6f0] border-2 border-[#e8ddd0] rounded-xl px-3 py-3 text-sm font-bold text-[#2d1b15] flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  maxLength={10}
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="flex-1 border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#8b1a1a]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm py-3.5 rounded-xl shadow transition-colors"
            >
              Send SMS OTP Verification
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div className="p-3 bg-[#8b1a1a]/10 border border-[#c9a45c]/30 rounded-xl text-center">
              <p className="text-xs font-bold text-[#8b1a1a]">
                OTP Sent to +91 {inputPhone}!
              </p>
              <p className="text-xs font-mono text-[#6b5347] mt-0.5">
                (Demo OTP: <strong className="text-[#8b1a1a] text-sm">{generatedOtp}</strong>)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1 text-center">
                Enter 6-Digit OTP *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono border-2 border-[#e8ddd0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b1a1a]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm py-3.5 rounded-xl shadow transition-colors"
            >
              Verify OTP & Attach Phone
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
