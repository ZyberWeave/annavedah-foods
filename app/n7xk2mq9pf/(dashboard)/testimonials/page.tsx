'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  Star,
  MessageSquareQuote,
  Pencil,
  X,
  MapPin,
  User,
  Quote,
} from 'lucide-react';
import { ADMIN_SLUG } from '@/lib/admin-config';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  rating: number;
  active: boolean;
  displayOrder: number;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // New testimonial form
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formText, setFormText] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'admin') {
          router.push(`/${ADMIN_SLUG}/login`);
        } else {
          fetchTestimonials();
        }
      })
      .catch(() => router.push(`/${ADMIN_SLUG}/login`))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchTestimonials = async () => {
    const res = await fetch('/api/admin/testimonials');
    const data = await res.json();
    if (data.testimonials) setTestimonials(data.testimonials);
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAdd = async () => {
    if (!formName.trim() || !formLocation.trim() || !formText.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          location: formLocation.trim(),
          text: formText.trim(),
          rating: formRating,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestimonials((prev) => [...prev, data.testimonial]);
        setFormName('');
        setFormLocation('');
        setFormText('');
        setFormRating(5);
        setShowForm(false);
        showSuccess('Testimonial added successfully!');
      }
    } catch {
      showSuccess('Failed to add testimonial');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (t: Testimonial) => {
    const res = await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, active: !t.active }),
    });
    if (res.ok) {
      setTestimonials((prev) =>
        prev.map((r) => (r.id === t.id ? { ...r, active: !r.active } : r))
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial permanently?')) return;
    const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTestimonials((prev) => prev.filter((r) => r.id !== id));
      showSuccess('Testimonial deleted');
    }
  };

  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const sorted = [...testimonials].sort((a, b) => a.displayOrder - b.displayOrder);
    const current = sorted[idx];
    const prev = sorted[idx - 1];
    await Promise.all([
      fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, displayOrder: prev.displayOrder }),
      }),
      fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prev.id, displayOrder: current.displayOrder }),
      }),
    ]);
    setTestimonials((items) =>
      items.map((r) => {
        if (r.id === current.id) return { ...r, displayOrder: prev.displayOrder };
        if (r.id === prev.id) return { ...r, displayOrder: current.displayOrder };
        return r;
      })
    );
  };

  const handleMoveDown = async (idx: number) => {
    const sorted = [...testimonials].sort((a, b) => a.displayOrder - b.displayOrder);
    if (idx === sorted.length - 1) return;
    const current = sorted[idx];
    const next = sorted[idx + 1];
    await Promise.all([
      fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, displayOrder: next.displayOrder }),
      }),
      fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: next.id, displayOrder: current.displayOrder }),
      }),
    ]);
    setTestimonials((items) =>
      items.map((r) => {
        if (r.id === current.id) return { ...r, displayOrder: next.displayOrder };
        if (r.id === next.id) return { ...r, displayOrder: current.displayOrder };
        return r;
      })
    );
  };

  const handleEditSave = async () => {
    if (!editId) return;
    const res = await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editId,
        name: editName.trim(),
        location: editLocation.trim(),
        text: editText.trim(),
        rating: editRating,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTestimonials((prev) =>
        prev.map((r) => (r.id === editId ? data.testimonial : r))
      );
      setEditId(null);
      showSuccess('Testimonial updated!');
    }
  };

  const startEdit = (t: Testimonial) => {
    setEditId(t.id);
    setEditName(t.name);
    setEditLocation(t.location);
    setEditText(t.text);
    setEditRating(t.rating);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a45c]" />
      </div>
    );
  }

  const sorted = [...testimonials].sort((a, b) => a.displayOrder - b.displayOrder);
  const activeCount = testimonials.filter((t) => t.active).length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#c9a45c]/20 to-[#8b1a1a]/10 rounded-2xl flex items-center justify-center border border-[#c9a45c]/20">
            <MessageSquareQuote className="w-6 h-6 text-[#8b1a1a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2d1b15]">Testimonials</h1>
            <p className="text-sm text-[#6b5347]">
              {activeCount} active · {testimonials.length} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span
              className={`text-sm font-medium flex items-center gap-1 ${
                success.includes('success') || success.includes('updated') || success.includes('deleted')
                  ? 'text-green-600'
                  : 'text-red-500'
              }`}
            >
              <Check className="w-4 h-4" />
              {success}
            </span>
          )}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>
      </div>

      {/* Add New Testimonial Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm overflow-hidden animate-in slide-in-from-top-2">
          <div className="p-6 bg-[#faf6f0]/50 border-b border-[#e8ddd0]">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-[#c9a45c]" />
              <span className="text-sm font-semibold text-[#2d1b15]">New Testimonial</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5347]" />
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Customer name..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5347]" />
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Location (e.g. Mumbai, Pune)..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white transition-colors"
                />
              </div>
            </div>
            <div className="mt-4">
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="What did the customer say? Write the review text here..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white transition-colors resize-none"
              />
            </div>
            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6b5347]">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          star <= formRating
                            ? 'fill-[#c9a45c] text-[#c9a45c]'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-[#6b5347]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={adding || !formName.trim() || !formLocation.trim() || !formText.trim()}
                className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Testimonial
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#e8ddd0] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2d1b15]">All Testimonials</h2>
          <span className="text-xs text-[#6b5347] bg-[#faf6f0] px-3 py-1 rounded-full border border-[#e8ddd0]">
            {testimonials.length} total
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="p-16 text-center text-[#6b5347]">
            <Quote className="w-14 h-14 text-[#e8ddd0] mx-auto mb-4" />
            <p className="text-base">No testimonials yet.</p>
            <p className="text-sm mt-1 text-[#c9a45c]">
              Click &ldquo;Add Testimonial&rdquo; to create the first one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e8ddd0]">
            {sorted.map((t, idx) => (
              <div
                key={t.id}
                className={`p-5 transition-colors ${
                  !t.active ? 'opacity-50 bg-gray-50/50' : 'hover:bg-[#faf6f0]/50'
                }`}
              >
                {editId === t.id ? (
                  /* --- Edit Mode --- */
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#c9a45c]/40 rounded-lg text-sm focus:outline-none focus:border-[#c9a45c] bg-white"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#c9a45c]/40 rounded-lg text-sm focus:outline-none focus:border-[#c9a45c] bg-white"
                        placeholder="Location"
                      />
                    </div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border-2 border-[#c9a45c]/40 rounded-lg text-sm focus:outline-none focus:border-[#c9a45c] bg-white resize-none"
                      placeholder="Review text"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6b5347]">Rating:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setEditRating(star)}>
                              <Star
                                className={`w-4 h-4 ${
                                  star <= editRating
                                    ? 'fill-[#c9a45c] text-[#c9a45c]'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditId(null)}
                        className="text-[#6b5347] h-8"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEditSave}
                        className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white h-8"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* --- View Mode --- */
                  <div className="flex items-start gap-4">
                    {/* Order Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8b1a1a]/10 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-[#8b1a1a]">{idx + 1}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-[#2d1b15]">{t.name}</span>
                        <span className="text-xs text-[#6b5347] flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {t.location}
                        </span>
                        {!t.active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold uppercase">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < t.rating
                                ? 'fill-[#c9a45c] text-[#c9a45c]'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-[#2d1b15]/70 leading-relaxed line-clamp-2">
                        &ldquo;{t.text}&rdquo;
                      </p>
                      <p className="text-[10px] text-[#c9a45c] mt-1.5">
                        Added {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-[#e8ddd0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-[#6b5347]" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === sorted.length - 1}
                        className="p-1.5 rounded-lg hover:bg-[#e8ddd0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-[#6b5347]" />
                      </button>
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                        title="Edit testimonial"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggle(t)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          t.active
                            ? 'hover:bg-amber-50 text-green-600'
                            : 'hover:bg-green-50 text-[#6b5347]'
                        }`}
                        title={t.active ? 'Hide from website' : 'Show on website'}
                      >
                        {t.active ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete testimonial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
