"use client";

import { useEffect, useState } from "react";
import { getFreeGiftConfig, getFreeGiftProduct, type FreeGiftConfig } from "@/lib/free-gift-config";

type FreeGiftBannerProps = {
  subtotal: number;
};

export default function FreeGiftBanner({ subtotal }: FreeGiftBannerProps) {
  const [config, setConfig] = useState<FreeGiftConfig | null>(null);

  useEffect(() => {
    setConfig(getFreeGiftConfig());
  }, []);

  if (!config || !config.enabled) return null;

  const giftProduct = getFreeGiftProduct(config);
  if (!giftProduct) return null;

  const threshold = config.thresholdPrice;
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const amountNeeded = Math.max(0, threshold - subtotal);
  const isUnlocked = subtotal >= threshold;

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${
      isUnlocked
        ? "bg-[#8b1a1a]/10 border-[#c9a45c]/40 text-[#2d1b15]"
        : "bg-[#faf6f0] border-[#e8ddd0] text-[#6b5347]"
    }`}>
      <div className="flex items-center justify-between gap-3 text-sm font-bold mb-2">
        <span className="flex items-center gap-2">
          <span className="text-lg">{isUnlocked ? "🎉" : "🎁"}</span>
          {isUnlocked ? (
            <span className="text-[#8b1a1a]">
              Congratulations! You unlocked a <strong>FREE {giftProduct.name}</strong>!
            </span>
          ) : (
            <span>
              Add <strong className="text-[#2d1b15]">₹{amountNeeded}</strong> more to get a <strong className="text-[#8b1a1a]">FREE {giftProduct.name}</strong>!
            </span>
          )}
        </span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#c9a45c]/30 text-[#8b1a1a] shrink-0">
          {isUnlocked ? "UNLOCKED" : `${progressPercent}%`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#e8ddd0] rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isUnlocked ? "bg-[#8b1a1a]" : "bg-[#c9a45c]"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-[11px] text-[#6b5347] mt-1.5 font-semibold flex items-center justify-between">
        <span>Order Threshold: ₹{threshold}</span>
        <span>Free Item Value: ₹{giftProduct.price}</span>
      </p>
    </div>
  );
}
