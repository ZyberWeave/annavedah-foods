"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateFirstPurchaseCoupon, type PersonalCoupon } from "@/lib/personal-coupons";

const POPUP_SHOWN_KEY = "annavedah-first-time-popup-dismissed";
const PROFILE_KEY = "annavedah-user-profile";

export default function FirstTimeCustomerPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mobileInput, setMobileInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedCoupon, setGeneratedCoupon] = useState<PersonalCoupon | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(POPUP_SHOWN_KEY);
    if (dismissed === "true") return;

    try {
      const rawProfile = localStorage.getItem(PROFILE_KEY);
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile);
        setUserProfile(parsed);
        if (parsed.email && parsed.phone) {
          const coupon = generateFirstPurchaseCoupon(parsed.email);
          setGeneratedCoupon(coupon);
        }
      }
    } catch {
      // fallback
    }

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(POPUP_SHOWN_KEY, "true");
    }
  };

  const handleSendMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = mobileInput.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setErrorMsg("");
  };

  const handleVerifyMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() !== generatedOtp) {
      setErrorMsg("Invalid OTP code. Please enter the 6-digit OTP sent to your phone.");
      return;
    }

    const updatedProfile = {
      ...userProfile,
      email: userProfile?.email || "user@annavedah.com",
      phone: mobileInput.trim(),
    };

    setUserProfile(updatedProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    }

    const coupon = generateFirstPurchaseCoupon(updatedProfile.email);
    setGeneratedCoupon(coupon);
    setOtpSent(false);
    setErrorMsg("");
  };

  const handleCopyCode = () => {
    if (!generatedCoupon) return;
    navigator.clipboard.writeText(generatedCoupon.code);
    setCopied(true);
    setTimeout(() => setIsOpen(false), 2000);
  };

  if (!isOpen) return null;

  const hasMobile = Boolean(userProfile?.phone && userProfile.phone.replace(/\D/g, "").length >= 10);
  const isLoggedIn = Boolean(userProfile?.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#e8ddd0] transition-all">
        {/* CLOSE BUTTON */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold text-xs transition-colors"
        >
          CLOSE
        </button>

        {/* POPUP HEADER */}
        <div className="bg-[#2d1b15] p-6 text-center text-white relative border-b border-[#e8ddd0]">
          {!isLoggedIn ? (
            <>
              <span className="bg-[#8b1a1a] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2">
                FIRST-TIME CUSTOMER OFFER
              </span>
              <h3 className="text-xl font-extrabold uppercase tracking-wider">
                GET 5% OFF YOUR FIRST ORDER
              </h3>
              <p className="text-gray-300 text-xs mt-1 font-medium">
                Register now to receive a 1-time personalized coupon code sent to your account via email.
              </p>
            </>
          ) : !hasMobile ? (
            <>
              <span className="bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2">
                FINISH YOUR REGISTRATION
              </span>
              <h3 className="text-xl font-extrabold uppercase tracking-wider">
                MOBILE NUMBER STILL MISSING
              </h3>
              <p className="text-amber-100 text-xs mt-1 font-medium">
                You logged in as <span className="font-bold underline">{userProfile.email}</span>. Attach mobile number to complete 100% registration and claim 5% OFF code.
              </p>
            </>
          ) : (
            <>
              <span className="bg-green-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2">
                100% REGISTRATION COMPLETE
              </span>
              <h3 className="text-xl font-extrabold uppercase tracking-wider">
                YOUR 5% OFF COUPON CODE IS READY
              </h3>
              <p className="text-gray-300 text-xs mt-1 font-medium">
                Personalized 1-time discount code bound to your registered email account.
              </p>
            </>
          )}
        </div>

        {/* POPUP BODY */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl uppercase tracking-wider">
              {errorMsg}
            </div>
          )}

          {/* SCENARIO 1: NOT LOGGED IN / GUEST */}
          {!isLoggedIn && (
            <div className="space-y-4 text-center">
              <div className="bg-[#faf6f0] border border-[#e8ddd0] p-4 rounded-2xl text-xs text-[#6b5347] space-y-2">
                <p className="font-bold text-[#2d1b15] uppercase tracking-wider">
                  100% REGISTRATION REQUIRED
                </p>
                <p>
                  To prevent unauthorized coupon misuse, your 5% OFF coupon code is generated only after full account creation with email and verified mobile number.
                </p>
              </div>

              <Link
                href="/register"
                onClick={handleDismiss}
                className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-all block uppercase tracking-wider"
              >
                REGISTER NOW & CLAIM 5% OFF
              </Link>

              <div className="pt-2">
                <Link
                  href="/login"
                  onClick={handleDismiss}
                  className="text-xs text-[#6b5347] hover:text-[#2d1b15] font-bold underline uppercase tracking-wider"
                >
                  Already have an account? Log In
                </Link>
              </div>
            </div>
          )}

          {/* SCENARIO 2: LOGGED IN OAUTH / EMAIL WITHOUT MOBILE */}
          {isLoggedIn && !hasMobile && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendMobileOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                      ENTER 10-DIGIT MOBILE NUMBER *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#8b1a1a]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-all uppercase tracking-wider"
                  >
                    SEND OTP TO UNLOCK 5% OFF
                  </button>

                  <p className="text-[10px] text-[#6b5347] text-center font-bold uppercase tracking-wider">
                    Mobile number is required for order updates and discount validation.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs font-bold text-amber-800 uppercase tracking-wider">
                    OTP SENT TO +91 {mobileInput} (DEMO OTP: {generatedOtp})
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                      ENTER 6-DIGIT OTP CODE *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-sm font-mono text-center tracking-widest focus:outline-none focus:border-[#8b1a1a]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-all uppercase tracking-wider"
                  >
                    VERIFY & UNLOCK 5% OFF CODE
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SCENARIO 3: 100% REGISTERED USER WITH COUPON GENERATED */}
          {isLoggedIn && hasMobile && generatedCoupon && (
            <div className="text-center space-y-4 py-2">
              <div className="p-4 bg-[#8b1a1a]/10 border border-[#c9a45c]/30 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-[#8b1a1a] uppercase tracking-wider">
                  YOUR EXCLUSIVE 1-TIME COUPON CODE:
                </span>
                <div className="text-2xl font-extrabold text-[#2d1b15] tracking-widest font-mono py-1">
                  {generatedCoupon.code}
                </div>
                <p className="text-xs text-[#6b5347] font-medium">
                  5% OFF bound to <strong className="text-[#2d1b15]">{generatedCoupon.boundEmail}</strong>
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-all uppercase tracking-wider"
              >
                {copied ? "COUPON CODE COPIED" : "COPY 5% OFF COUPON CODE"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
