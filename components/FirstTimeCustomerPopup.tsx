"use client";

import { useEffect, useState } from "react";
import { generateFirstPurchaseCoupon, type PersonalCoupon } from "@/lib/personal-coupons";

const POPUP_SHOWN_KEY = "annavedah-first-time-popup-dismissed";

export default function FirstTimeCustomerPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [generatedCoupon, setGeneratedCoupon] = useState<PersonalCoupon | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(POPUP_SHOWN_KEY);
    if (dismissed === "true") return;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    const coupon = generateFirstPurchaseCoupon(email);
    setGeneratedCoupon(coupon);
    if (typeof window !== "undefined") {
      localStorage.setItem(POPUP_SHOWN_KEY, "true");
    }
  };

  const handleCopyCode = () => {
    if (!generatedCoupon) return;
    navigator.clipboard.writeText(generatedCoupon.code);
    setCopied(true);
    setTimeout(() => setIsOpen(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#e8ddd0] transition-all">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
        >
          ✕
        </button>

        {/* Decorative Header Banner */}
        <div className="bg-gradient-to-r from-[#2d1b15] to-[#8b1a1a] p-8 text-center text-white relative">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl border border-white/20 shadow-inner">
            🎁
          </div>
          <span className="bg-[#c9a45c] text-[#2d1b15] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2 shadow">
            First-Time Customer Offer
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight">
            Get 5% OFF Your First Order!
          </h3>
          <p className="text-amber-100 text-xs mt-1 font-medium">
            Register now to receive a 1-time personalized coupon code for your account.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!generatedCoupon ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                  Enter Email to Claim 5% OFF *
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b1a1a]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm py-3.5 rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Register & Unlock 5% OFF Code</span>
                <span>🚀</span>
              </button>

              <p className="text-[11px] text-[#6b5347] text-center font-medium">
                Valid for your first purchase only. Single-use coupon bound to your email account.
              </p>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="p-4 bg-[#8b1a1a]/10 border border-[#c9a45c]/30 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-[#8b1a1a] uppercase tracking-wider">
                  Your Exclusive 1-Time Coupon Code:
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
                className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm py-3.5 rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <span>{copied ? "Coupon Code Copied! ✓" : "Copy 5% OFF Coupon Code 📋"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
