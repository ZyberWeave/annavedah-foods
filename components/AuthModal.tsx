"use client";

import { useState } from "react";

const PROFILE_KEY = "annavedah-user-profile";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMethod, setAuthMethod] = useState<"OAUTH" | "GMAIL_OTP" | "MOBILE_OTP">("OAUTH");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [inputOtp, setInputOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [nameInput, setNameInput] = useState("");

  if (!isOpen) return null;

  const saveProfile = (p: any) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      } catch {
        // fallback
      }
    }
  };

  const handleGoogleOAuth = () => {
    const googleUser = {
      name: "Aditya Deshmukh",
      email: "aditya.deshmukh.google@gmail.com",
      phone: "", // Missing phone -> triggers Mobile Enforcer Guard!
    };
    saveProfile(googleUser);
    onClose();
  };

  const handleFacebookAuth = () => {
    const fbUser = {
      name: "Sneha Kulkarni (Facebook)",
      email: "sneha.fb@facebook.com",
      phone: "", // Missing phone -> triggers Mobile Enforcer Guard!
    };
    saveProfile(fbUser);
    onClose();
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp.trim() !== generatedOtp) {
      alert("Invalid OTP code!");
      return;
    }

    const newUser = {
      name: nameInput || (authMethod === "GMAIL_OTP" ? emailInput.split("@")[0] : `User ${phoneInput}`),
      email: emailInput || `${phoneInput}@mobileuser.com`,
      phone: phoneInput || "",
    };

    saveProfile(newUser);
    setOtpSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#e8ddd0]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-[10px] font-bold uppercase px-3 py-1 rounded-full inline-block mb-2 border border-[#c9a45c]/30">
            Secure Account Sign-In
          </span>
          <h3 className="text-xl font-bold text-[#2d1b15]">Log In or Create Account</h3>
          <p className="text-xs text-[#6b5347] mt-1">
            Choose OAuth 1-Click Sign In or OTP Verification
          </p>
        </div>

        {/* Tab Switching */}
        <div className="grid grid-cols-3 gap-1 bg-[#faf6f0] p-1 rounded-xl mb-6 text-xs font-bold border border-[#e8ddd0]">
          <button
            type="button"
            onClick={() => { setAuthMethod("OAUTH"); setOtpSent(false); }}
            className={`py-2 rounded-lg transition-all ${authMethod === "OAUTH" ? "bg-[#8b1a1a] text-white shadow" : "text-[#6b5347]"}`}
          >
            OAuth Social
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod("GMAIL_OTP"); setOtpSent(false); }}
            className={`py-2 rounded-lg transition-all ${authMethod === "GMAIL_OTP" ? "bg-[#8b1a1a] text-white shadow" : "text-[#6b5347]"}`}
          >
            Gmail OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod("MOBILE_OTP"); setOtpSent(false); }}
            className={`py-2 rounded-lg transition-all ${authMethod === "MOBILE_OTP" ? "bg-[#8b1a1a] text-white shadow" : "text-[#6b5347]"}`}
          >
            Mobile OTP
          </button>
        </div>

        {/* OAUTH FLOW */}
        {authMethod === "OAUTH" && (
          <div className="space-y-3">
            <button
              onClick={handleGoogleOAuth}
              className="w-full bg-white border-2 border-[#e8ddd0] hover:bg-[#faf6f0] text-[#2d1b15] font-bold text-xs py-3 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors"
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
              onClick={handleFacebookAuth}
              className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs py-3 rounded-xl shadow flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook Auth</span>
            </button>

            <p className="text-[11px] text-[#6b5347] text-center mt-3">
              OAuth login bypasses password verification. Mobile number will be checked upon login.
            </p>
          </div>
        )}

        {/* GMAIL OTP & MOBILE OTP FLOW */}
        {authMethod !== "OAUTH" && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {authMethod === "GMAIL_OTP" ? (
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                      Gmail Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b1a1a]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b1a1a] font-mono"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm py-3.5 rounded-xl shadow transition-colors"
                >
                  Send OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-[#8b1a1a]/10 border border-[#c9a45c]/30 rounded-xl text-center">
                  <p className="text-xs font-bold text-[#8b1a1a]">
                    OTP Sent to {authMethod === "GMAIL_OTP" ? emailInput : phoneInput}!
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
                  Verify OTP & Log In
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
