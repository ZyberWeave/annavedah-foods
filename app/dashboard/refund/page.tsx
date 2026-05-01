'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RefundRequestPage() {
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
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

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-[#e8ddd0] shadow-sm space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. order_Ph8X..."
              className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:outline-none focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Reason for Refund</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain the issue..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#e8ddd0] focus:outline-none focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/20 transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d1b15] mb-2">Upload Image (Optional)</label>
            <div className="border-2 border-dashed border-[#e8ddd0] rounded-2xl p-6 text-center hover:bg-[#faf6f0] transition-colors relative">
              <input
                type="file"
                accept="image/*"
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
                  <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
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
