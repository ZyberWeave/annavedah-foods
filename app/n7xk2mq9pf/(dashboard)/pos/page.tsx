"use client";

import { useState } from "react";
import Link from "next/link";
import BarcodeScannerGuard from "@/components/admin/BarcodeScannerGuard";
import BarcodeGenerator from "@/components/admin/BarcodeGenerator";
import BatchProductSearch from "@/components/admin/pos/BatchProductSearch";
import CustomerPOSLookup from "@/components/admin/pos/CustomerPOSLookup";
import POSRegisterSummary from "@/components/admin/pos/POSRegisterSummary";
import POSHeader from "@/components/admin/pos/POSHeader";
import { savePOSOrder } from "@/lib/pos-orders-storage";
import { deductBatchStock } from "@/lib/batch-inventory";
import { ADMIN_SLUG } from "@/lib/admin-config";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  batchId: string;
  mfdDate: string;
  expiryDate: string;
  barcode: string;
};

export default function OfflinePOSPage() {
  const [activeTab, setActiveTab] = useState<"billing" | "inventory" | "printers" | "register">("billing");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [customer, setCustomer] = useState<{
    name: string;
    phone: string;
    isFirstTime: boolean;
    discountPercent: number;
  }>({
    name: "Walk-in Customer",
    phone: "",
    isFirstTime: false,
    discountPercent: 0,
  });

  const [cashTendered, setCashTendered] = useState<string>("");
  const [lastBill, setLastBill] = useState<{
    invoiceNo: string;
    subtotal: number;
    gstAmount: number;
    discountAmount: number;
    total: number;
    items: CartItem[];
    payment: string;
    date: string;
  } | null>(null);

  const handleAddBatchItem = (batchItem: {
    productId: string;
    productName: string;
    batchId: string;
    mfdDate: string;
    expiryDate: string;
    price: number;
    barcode: string;
  }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.batchId === batchItem.batchId);
      if (existing) {
        return prev.map((item) =>
          item.batchId === batchItem.batchId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: batchItem.productId,
          name: batchItem.productName,
          price: batchItem.price,
          qty: 1,
          batchId: batchItem.batchId,
          mfdDate: batchItem.mfdDate,
          expiryDate: batchItem.expiryDate,
          barcode: batchItem.barcode,
        },
      ];
    });
  };

  const updateQty = (batchId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.batchId === batchId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const discountAmount = (subtotal * customer.discountPercent) / 100;
  const gstAmount = ((subtotal - discountAmount) * 0.05);
  const grandTotal = Math.round(subtotal - discountAmount + gstAmount);

  const cashReturn = Math.max(0, (parseFloat(cashTendered) || 0) - grandTotal);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    cart.forEach((item) => {
      deductBatchStock(item.batchId, item.qty);
    });

    const invoiceNo = "INV-AV-" + Math.floor(100000 + Math.random() * 900000);
    const bill = {
      invoiceNo,
      subtotal,
      gstAmount,
      discountAmount,
      total: grandTotal,
      items: [...cart],
      payment: paymentMethod,
      date: new Date().toLocaleString("en-IN"),
    };

    setLastBill(bill);
    savePOSOrder({
      invoiceNo,
      date: bill.date,
      customerName: customer.name,
      customerPhone: customer.phone,
      subtotal,
      gstAmount,
      discountAmount,
      total: grandTotal,
      paymentMethod,
      items: [...cart],
    });
    setCart([]);
    alert(`Order ${invoiceNo} Completed Successfully. Stock deducted.`);
  };

  const handlePrint80mmBill = () => {
    if (!lastBill) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt #${lastBill.invoiceNo}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: monospace; width: 78mm; padding: 4mm; font-size: 11px; color: #000; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
            .title { font-size: 14px; font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .total { font-size: 13px; font-weight: bold; }
            .footer { text-align: center; margin-top: 10px; font-size: 9px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ANNAVEDAH FOODS</div>
            <div>Offline Counter Terminal</div>
            <div>Tax Invoice #: ${lastBill.invoiceNo}</div>
            <div>${lastBill.date}</div>
            <div>Customer: ${customer.name}</div>
          </div>
          <div class="divider"></div>
          ${lastBill.items
            .map(
              (i) => `
            <div class="row">
              <span>${i.qty}x ${i.name}</span>
              <span>INR ${i.price * i.qty}.00</span>
            </div>
            <div style="font-size:8px; color:#444;">Batch: ${i.batchId} | Exp: ${i.expiryDate}</div>
          `
            )
            .join("")}
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span><span>INR ${lastBill.subtotal}.00</span></div>
          <div class="row"><span>GST (5%):</span><span>INR ${lastBill.gstAmount.toFixed(2)}</span></div>
          ${lastBill.discountAmount > 0 ? `<div class="row"><span>Discount:</span><span>-INR ${lastBill.discountAmount.toFixed(2)}</span></div>` : ""}
          <div class="divider"></div>
          <div class="row total"><span>GRAND TOTAL:</span><span>INR ${lastBill.total}.00</span></div>
          <div class="row"><span>Payment Mode:</span><span>${lastBill.payment}</span></div>
          <div class="divider"></div>
          <div class="footer">
            Thank you for shopping at Annavedah Foods!<br/>
            Visit again
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSendWhatsAppBill = () => {
    if (!lastBill || !customer.phone) {
      alert("Please enter customer phone number to send WhatsApp bill receipt!");
      return;
    }

    const itemsSummary = lastBill.items.map((i) => `${i.qty}x ${i.name} (Batch: ${i.batchId})`).join("\n");
    const msg = `ANNAVEDAH FOODS TAX INVOICE

Hi ${customer.name},

Thank you for shopping at our Offline Counter! Here is your itemized bill receipt:

Invoice #: ${lastBill.invoiceNo}
Date: ${lastBill.date}

Purchased Items:
${itemsSummary}

Grand Total: INR ${lastBill.total}.00
Payment Mode: ${lastBill.payment}

Thank you for choosing Annavedah Foods!`;

    const cleanPhone = customer.phone.replace(/\D/g, "");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      <POSHeader />

        {/* TAB 1: COUNTER BILLING TERMINAL */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <BarcodeScannerGuard
              onScannedProductFound={(batch) => {
                handleAddBatchItem({
                  productId: batch.productId,
                  productName: batch.productName,
                  batchId: batch.batchId,
                  mfdDate: batch.mfdDate,
                  expiryDate: batch.expiryDate,
                  price: batch.unitPrice,
                  barcode: batch.barcode,
                });
              }}
            />

            <CustomerPOSLookup onCustomerIdentified={setCustomer} />

            <BatchProductSearch onSelectBatchItem={handleAddBatchItem} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl p-5 border-2 border-[#e8ddd0] shadow-xs">
                <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-3 mb-4">
                  <h3 className="font-extrabold text-[#2d1b15] text-xs uppercase tracking-wider">
                    BILLED CART ITEMS ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-red-600 font-bold hover:underline uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="p-12 text-center text-[#6b5347]">
                    <p className="font-bold text-xs uppercase text-[#2d1b15]">Cart is empty</p>
                    <p className="text-xs text-[#6b5347] mt-1">
                      Scan product barcode or search by name to select batch item.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.batchId}
                        className="p-3.5 rounded-lg border border-[#e8ddd0] bg-[#faf6f0] flex items-center justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-xs text-[#2d1b15]">{item.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-[#6b5347] mt-1">
                            <span className="font-mono bg-[#2d1b15] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              BATCH: {item.batchId}
                            </span>
                            <span>EXP: {item.expiryDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                            <button
                              onClick={() => updateQty(item.batchId, -1)}
                              className="px-2 py-0.5 hover:bg-gray-100 font-bold text-gray-700 text-xs"
                            >
                              -
                            </button>
                            <span className="px-2.5 font-bold text-xs text-[#2d1b15]">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.batchId, 1)}
                              className="px-2 py-0.5 hover:bg-gray-100 font-bold text-gray-700 text-xs"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="font-bold text-xs text-[#2d1b15]">
                              INR {item.price * item.qty}.00
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-[#e8ddd0] shadow-xs space-y-4">
                <h3 className="font-extrabold text-[#2d1b15] text-xs uppercase tracking-wider border-b border-[#e8ddd0] pb-3">
                  PAYMENT SUMMARY
                </h3>

                <div className="space-y-2 text-xs text-[#6b5347]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-[#2d1b15]">INR {subtotal}.00</span>
                  </div>
                  {customer.discountPercent > 0 && (
                    <div className="flex justify-between text-[#8b1a1a] font-bold">
                      <span>Discount (5%):</span>
                      <span>-INR {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span className="font-bold text-[#2d1b15]">INR {gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#e8ddd0] pt-2 flex justify-between text-sm font-extrabold text-[#2d1b15]">
                    <span>GRAND TOTAL:</span>
                    <span className="text-[#8b1a1a]">INR {grandTotal}.00</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6b5347] uppercase tracking-wider mb-1.5">
                    PAYMENT METHOD
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["UPI", "CASH", "CARD"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 rounded text-xs font-bold border transition-all uppercase tracking-wider ${
                          paymentMethod === m
                            ? "bg-[#8b1a1a] text-white border-[#8b1a1a]"
                            : "bg-[#faf6f0] border-[#e8ddd0] text-[#2d1b15] hover:bg-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "CASH" && (
                  <div className="bg-[#faf6f0] border border-[#e8ddd0] p-3 rounded-lg space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#6b5347] uppercase tracking-wider">
                      CASH TENDERED (INR)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-extrabold text-[#2d1b15] focus:outline-none focus:border-[#8b1a1a] bg-white"
                    />
                    {cashReturn > 0 && (
                      <div className="flex justify-between items-center text-xs font-bold text-[#2d1b15] pt-1">
                        <span>CHANGE TO RETURN:</span>
                        <span className="text-[#8b1a1a] font-extrabold">INR {cashReturn}.00</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleCompleteSale}
                  disabled={cart.length === 0}
                  className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-lg transition-colors uppercase tracking-wider"
                >
                  COMPLETE SALE & DEDUCT STOCK
                </button>

                {lastBill && (
                  <div className="pt-3 border-t border-[#e8ddd0] space-y-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block text-center">
                      LAST BILL: #{lastBill.invoiceNo}
                    </span>
                    <button
                      onClick={handlePrint80mmBill}
                      className="w-full bg-[#2d1b15] hover:bg-black text-white font-bold text-xs py-2.5 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      PRINT BILL RECEIPT (80MM)
                    </button>
                    {customer.phone && (
                      <button
                        onClick={handleSendWhatsAppBill}
                        className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs py-2.5 rounded-lg transition-colors uppercase tracking-wider"
                      >
                        SEND DIGITAL RECEIPT VIA WHATSAPP
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-white rounded-xl p-6 border-2 border-[#e8ddd0] shadow-xs">
            <h2 className="text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider mb-2">
              MULTI-BATCH INVENTORY MANAGEMENT
            </h2>
            <p className="text-xs text-[#6b5347] mb-6">
              Track stock levels, manufacturing dates, expiry dates, and barcode labels across store batches.
            </p>
            <BarcodeGenerator />
          </div>
        )}

        {activeTab === "printers" && (
          <div className="bg-white rounded-xl p-6 border-2 border-[#e8ddd0] shadow-xs space-y-6">
            <h2 className="text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider">
              PRINTER CONFIGURATION STUDIO
            </h2>
            <BarcodeGenerator />
          </div>
        )}

        {activeTab === "register" && <POSRegisterSummary />}
    </div>
  );
}
