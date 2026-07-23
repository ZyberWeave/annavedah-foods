"use client";

import { useState } from "react";
import { dispatchShipmentTrackingWhatsApp, type ShipmentDetails } from "@/lib/shipment-notifications";

export default function ShipmentAlertDispatcher() {
  const [customerName, setCustomerName] = useState("Mansi");
  const [customerPhone, setCustomerPhone] = useState("9876543210");
  const [orderId, setOrderId] = useState("60614");
  const [trackingNumber, setTrackingNumber] = useState("80110029716");
  const [courierName, setCourierName] = useState("Shiprocket Express");
  const [sentAlert, setSentAlert] = useState(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const shipment: ShipmentDetails = {
      orderId,
      customerName,
      customerPhone,
      courierName,
      trackingNumber,
      trackingUrl: `https://gobbleright.shiprocket.co/tracking/${trackingNumber}`,
      itemsSummary: "Organic Moringa & Lakadong Turmeric Powder",
      totalAmount: 1400,
    };

    const whatsappUrl = dispatchShipmentTrackingWhatsApp(shipment);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setSentAlert(true);
    setTimeout(() => setSentAlert(false), 4000);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-[#e8ddd0] p-6 mt-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-5">
        <div>
          <h2 className="text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider">
            WHATSAPP SHIPMENT NOTIFICATION DISPATCHER
          </h2>
          <p className="text-xs text-[#6b5347] mt-0.5">
            Dispatches automated order shipment notices with tracking AWB and delivery progress via WhatsApp.
          </p>
        </div>
        <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-[10px] font-extrabold px-3 py-1 rounded border border-[#c9a45c]/30 uppercase tracking-wider">
          ACTIVE
        </span>
      </div>

      {sentAlert && (
        <div className="bg-[#8b1a1a]/10 border border-[#c9a45c]/30 text-[#8b1a1a] px-4 py-3 rounded text-xs mb-4 font-bold uppercase tracking-wider">
          DISPATCHED SHIPMENT TRACKING ALERT FOR ORDER #{orderId}
        </div>
      )}

      <form onSubmit={handleDispatch} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-bold text-[#2d1b15] uppercase tracking-wider mb-1">Customer Name *</label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border-2 border-[#e8ddd0] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a] bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-[#2d1b15] uppercase tracking-wider mb-1">Customer Mobile *</label>
          <input
            type="tel"
            required
            maxLength={10}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full border-2 border-[#e8ddd0] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#8b1a1a] bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-[#2d1b15] uppercase tracking-wider mb-1">Order ID *</label>
          <input
            type="text"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border-2 border-[#e8ddd0] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#8b1a1a] bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-[#2d1b15] uppercase tracking-wider mb-1">Tracking AWB Number *</label>
          <input
            type="text"
            required
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full border-2 border-[#e8ddd0] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#8b1a1a] bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-[#2d1b15] uppercase tracking-wider mb-1">Courier Partner</label>
          <input
            type="text"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="w-full border-2 border-[#e8ddd0] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a] bg-white"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-[#2d1b15] hover:bg-black text-white font-bold text-xs py-2.5 rounded transition-colors uppercase tracking-wider"
          >
            DISPATCH TRACKING ALERT
          </button>
        </div>
      </form>
    </div>
  );
}
