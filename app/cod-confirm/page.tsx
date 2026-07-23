"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { updateCODOrderStatus } from "@/lib/cod-automation";

function CODConfirmContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const action = searchParams.get("action");

  const [status, setStatus] = useState<"processing" | "confirmed" | "cancelled" | "invalid">("processing");

  useEffect(() => {
    if (!orderId || !action) {
      setStatus("invalid");
      return;
    }

    if (action === "confirm") {
      updateCODOrderStatus(orderId, "confirm");
      setStatus("confirmed");
    } else if (action === "cancel") {
      updateCODOrderStatus(orderId, "cancel");
      setStatus("cancelled");
    } else {
      setStatus("invalid");
    }
  }, [orderId, action]);

  return (
    <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-2 border-[#e8ddd0] text-center">
        {status === "processing" && (
          <div className="space-y-4 py-8">
            <div className="w-12 h-12 border-4 border-[#8b1a1a] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#2d1b15]">Verifying COD Order Confirmation...</p>
          </div>
        )}

        {status === "confirmed" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#8b1a1a]/10 text-[#8b1a1a] rounded-full flex items-center justify-center mx-auto text-3xl font-bold border border-[#c9a45c]/30">
              ✓
            </div>
            <span className="bg-[#8b1a1a] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full inline-block">
              AUTOMATICALLY ACCEPTED
            </span>
            <h2 className="text-2xl font-extrabold text-[#2d1b15]">
              COD Order Confirmed!
            </h2>
            <p className="text-xs text-[#6b5347] font-medium">
              Thank you! Order <strong className="text-[#2d1b15]">#{orderId}</strong> has been automatically verified and accepted. Our warehouse is preparing your shipment.
            </p>
            <div className="pt-4">
              <Link
                href="/products"
                className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm px-6 py-3 rounded-xl shadow inline-block transition-colors"
              >
                Continue Shopping 🌾
              </Link>
            </div>
          </div>
        )}

        {status === "cancelled" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✕
            </div>
            <span className="bg-red-100 text-red-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full inline-block">
              ORDER CANCELLED
            </span>
            <h2 className="text-2xl font-extrabold text-[#2d1b15]">
              Order Cancelled
            </h2>
            <p className="text-xs text-[#6b5347] font-medium">
              Order <strong className="text-[#2d1b15]">#{orderId}</strong> has been cancelled as requested.
            </p>
            <div className="pt-4">
              <Link
                href="/products"
                className="bg-[#2d1b15] text-white font-bold text-sm px-6 py-3 rounded-xl shadow inline-block transition-colors"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#2d1b15]">Invalid Confirmation Link</h2>
            <p className="text-xs text-[#6b5347]">The order link appears to be invalid or expired.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CODConfirmPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-[#6b5347]">Loading Confirmation...</div>}>
      <CODConfirmContent />
    </Suspense>
  );
}
