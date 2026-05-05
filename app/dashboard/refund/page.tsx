'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, Package, RefreshCw, ShieldAlert, Clock, Truck, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { validateRequired, validateMinLength } from '@/lib/validations';

const REFUND_REASONS = [
  { value: 'damaged', label: 'Damaged Product', description: 'Product arrived broken or damaged', icon: ShieldAlert },
  { value: 'wrong_item', label: 'Wrong Item Received', description: 'Received a different product than ordered', icon: Package },
  { value: 'quality', label: 'Quality Issue', description: 'Product quality does not match expectations', icon: RefreshCw },
  { value: 'late_delivery', label: 'Late Delivery', description: 'Order delivered after the expected date', icon: Clock },
  { value: 'not_delivered', label: 'Not Delivered', description: 'Order was not delivered at all', icon: Truck },
  { value: 'other', label: 'Other', description: 'Any other reason not listed above', icon: HelpCircle },
];

export default function RefundRequestPage() {
  const [orderId, setOrderId] = useState('');
  const [reasonCategory, setReasonCategory] = useState('');
  const [reason, setReason] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let result;
    if (field === 'orderId') {
      result = validateRequired(value, 'Order ID');
    } else if (field === 'reasonCategory') {
      result = validateRequired(value, 'Reason for refund');
    } else if (field === 'reason') {
      result = validateMinLength(value, 20, 'Additional details');
    }
    if (result) {
      setFieldErrors(prev => ({ ...prev, [field]: result!.valid ? '' : result!.message }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const validateAll = (): boolean => {
    const orderResult = validateRequired(orderId, 'Order ID');
    const categoryResult = validateRequired(reasonCategory, 'Reason for refund');
    const reasonResult = validateMinLength(reason, 20, 'Additional details');
    setFieldErrors({
      orderId: orderResult.valid ? '' : orderResult.message,
      reasonCategory: categoryResult.valid ? '' : categoryResult.message,
      reason: reasonResult.valid ? '' : reasonResult.message,
    });
    setTouched({ orderId: true, reasonCategory: true, reason: true });
    return orderResult.valid && categoryResult.valid && reasonResult.valid;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, WebP, and GIF images are allowed');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateAll()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('reasonCategory', reasonCategory);
      formData.append('reason', reason);
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch('/api/refund', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string, value: string) => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && value;
    return `w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-200 bg-red-50/30'
        : isValid
        ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
        : 'border-[#e8ddd0] focus:border-[#c9a45c] focus:ring-[#c9a45c]/20'
    }`;
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#faf6f0] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-[#e8ddd0] shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#2d1b15] mb-2">Request Submitted</h1>
          <p className="text-[#6b5347] mb-8">We have received your refund request. Our team will review it and get back to you shortly.</p>
          <Button asChild className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px] lg:pt-[190px] pb-16 bg-[#faf6f0]">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm font-semibold text-[#c9a45c] hover:text-[#8b1a1a] mb-4 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-[#8b1a1a]">Request a Refund</h1>
          <p className="text-[#6b5347] mt-2">Please provide details about your order and the reason for your refund request. Uploading an image of the issue helps speed up the process.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-[#e8ddd0] shadow-sm space-y-6" noValidate>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Order ID <span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  if (touched.orderId) validateField('orderId', e.target.value);
                }}
                onBlur={() => handleBlur('orderId', orderId)}
                placeholder="e.g. order_Ph8X..."
                className={inputClass('orderId', orderId)}
                aria-invalid={!!fieldErrors.orderId}
                aria-describedby="orderId-error"
              />
              {touched.orderId && !fieldErrors.orderId && orderId && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {touched.orderId && fieldErrors.orderId && (
              <p id="orderId-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.orderId}
              </p>
            )}
          </div>

          {/* Reason Category Selector */}
          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-3">Reason for Refund <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REFUND_REASONS.map((item) => {
                const Icon = item.icon;
                const isSelected = reasonCategory === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setReasonCategory(item.value);
                      setTouched(prev => ({ ...prev, reasonCategory: true }));
                      setFieldErrors(prev => ({ ...prev, reasonCategory: '' }));
                    }}
                    className={`group relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-[#8b1a1a] bg-[#8b1a1a]/5 shadow-sm'
                        : 'border-[#e8ddd0] bg-white hover:border-[#c9a45c]/60 hover:bg-[#faf6f0]'
                    }`}
                  >
                    {/* Radio indicator */}
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'border-[#8b1a1a]' : 'border-[#c4b5a8] group-hover:border-[#c9a45c]'
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8b1a1a] animate-[scaleIn_0.15s_ease-out]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#8b1a1a]' : 'text-[#c9a45c]'}`} />
                        <span className={`text-sm font-semibold ${isSelected ? 'text-[#8b1a1a]' : 'text-[#2d1b15]'}`}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b5347] leading-relaxed">{item.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[#8b1a1a]" />
                    )}
                  </button>
                );
              })}
            </div>
            {touched.reasonCategory && fieldErrors.reasonCategory && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.reasonCategory}
              </p>
            )}
          </div>

          {/* Additional Details Textarea */}
          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Additional Details <span className="text-red-400">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (touched.reason) validateField('reason', e.target.value);
              }}
              onBlur={() => handleBlur('reason', reason)}
              placeholder="Please describe the issue in detail — what happened, when you noticed it, etc. (minimum 20 characters)..."
              rows={4}
              className={`${inputClass('reason', reason)} resize-none`}
              aria-invalid={!!fieldErrors.reason}
              aria-describedby="reason-error"
            />
            <div className="flex items-center justify-between mt-1.5">
              {touched.reason && fieldErrors.reason ? (
                <p id="reason-error" className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.reason}
                </p>
              ) : <span />}
              <span className={`text-[10px] tabular-nums ${reason.length < 20 ? 'text-[#a39189]' : 'text-green-600'}`}>
                {reason.length}/20 min
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Upload Image (Optional)</label>
            <div className="border-2 border-dashed border-[#e8ddd0] rounded-2xl p-6 text-center hover:bg-[#faf6f0] transition-colors relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {preview ? (
                <div className="flex flex-col items-center">
                  <img src={preview} alt="Preview" className="h-32 object-contain rounded-lg mb-2 border border-[#e8ddd0]" />
                  <p className="text-sm text-[#6b5347]">Click to change image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-[#6b5347]">
                  <UploadCloud className="w-10 h-10 mb-2 text-[#c9a45c]" />
                  <p className="font-medium text-[#2d1b15]">Click or drag to upload</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e8ddd0]">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
            </Button>
            <p className="text-xs text-center text-[#6b5347] mt-4">
              By submitting this request, you agree to our <Link href="/returns" className="text-[#c9a45c] hover:underline">Cancellation & Refund Policy</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
