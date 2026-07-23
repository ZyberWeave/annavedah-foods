'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/public-content';
import type { AdminPackPrice, ProductCategory } from '@/lib/content';
import { ADMIN_SLUG } from '@/lib/admin-config';
import {
  Box,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  nameHindi: string;
  localName: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  costPrice: number;
  image: string;
  description: string;
  benefits: string[];
  usage: string;
  highlights: string[];
  packPrices: AdminPackPrice[];
  badge?: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type EditablePack = {
  size: string;
  price: string;
  buyPrice: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  nameHindi: string;
  localName: string;
  category: ProductCategory;
  image: string;
  description: string;
  usage: string;
  badge: string;
  active: boolean;
  benefits: string;
  highlights: string;
  packPrices: EditablePack[];
};

const categoryOptions = categories.filter((category) => category !== 'All') as ProductCategory[];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function emptyPack(): EditablePack {
  return { size: '', price: '', buyPrice: '' };
}

function createEmptyForm(): ProductFormState {
  return {
    name: '',
    slug: '',
    nameHindi: '',
    localName: '',
    category: 'Powders',
    image: '',
    description: '',
    usage: '',
    badge: '',
    active: true,
    benefits: '',
    highlights: '',
    packPrices: [emptyPack()],
  };
}

function linesToText(lines: string[]) {
  return lines.join('\n');
}

function textToLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function productToForm(product: AdminProduct): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    nameHindi: product.nameHindi,
    localName: product.localName,
    category: product.category,
    image: product.image,
    description: product.description,
    usage: product.usage,
    badge: product.badge ?? '',
    active: product.active,
    benefits: linesToText(product.benefits),
    highlights: linesToText(product.highlights),
    packPrices: product.packPrices.length
      ? product.packPrices.map((pack) => ({
          size: pack.size,
          price: String(pack.price),
          buyPrice: String(pack.buyPrice),
        }))
      : [emptyPack()],
  };
}

function productToPayload(product: AdminProduct, overrides: Partial<AdminProduct> = {}) {
  const next = { ...product, ...overrides };
  return {
    id: next.id,
    slug: next.slug,
    name: next.name,
    nameHindi: next.nameHindi,
    localName: next.localName,
    category: next.category,
    image: next.image,
    description: next.description,
    usage: next.usage,
    badge: next.badge ?? '',
    active: next.active,
    benefits: next.benefits,
    highlights: next.highlights,
    packPrices: next.packPrices,
  };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [query, setQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState<ProductFormState>(createEmptyForm());
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (!authData.user || authData.user.role !== 'admin') {
          router.push(`/${ADMIN_SLUG}/login`);
          return;
        }

        const productsRes = await fetch('/api/admin/products');
        const productsData = await productsRes.json();
        if (Array.isArray(productsData.products)) {
          setProducts(productsData.products);
        }
      } catch {
        router.push(`/${ADMIN_SLUG}/login`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const activeCount = useMemo(
    () => products.filter((product) => product.active).length,
    [products],
  );

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;

    return products.filter((product) =>
      [
        product.name,
        product.slug,
        product.localName,
        product.nameHindi,
        product.category,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [products, query]);

  const showStatus = (message: string) => {
    setStatusMessage(message);
    setErrorMessage('');
    window.setTimeout(() => setStatusMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setStatusMessage('');
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setShowForm(false);
    setSlugTouched(false);
    setErrorMessage('');
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const updatePack = (index: number, key: keyof EditablePack, value: string) => {
    setForm((prev) => ({
      ...prev,
      packPrices: prev.packPrices.map((pack, packIndex) =>
        packIndex === index ? { ...pack, [key]: value } : pack,
      ),
    }));
  };

  const addPack = () => {
    setForm((prev) => ({
      ...prev,
      packPrices: [...prev.packPrices, emptyPack()],
    }));
  };

  const removePack = (index: number) => {
    setForm((prev) => ({
      ...prev,
      packPrices:
        prev.packPrices.length === 1
          ? [emptyPack()]
          : prev.packPrices.filter((_, packIndex) => packIndex !== index),
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Please choose an image file (jpeg, png, webp, or gif).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image is too large. Maximum size is 5 MB.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]+/g, '-');
      const blob = await upload(`products/${Date.now()}-${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: file.type,
      });
      setForm((prev) => ({ ...prev, image: blob.url }));
      showStatus('Image uploaded.');
    } catch (error) {
      showError((error as Error).message || 'Could not upload image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setShowForm(true);
    setSlugTouched(false);
    setErrorMessage('');
    setStatusMessage('');
  };

  const startEdit = (product: AdminProduct) => {
    setForm(productToForm(product));
    setEditingId(product.id);
    setShowForm(true);
    setSlugTouched(true);
    setErrorMessage('');
  };

  const buildPayload = () => ({
    slug: form.slug.trim().toLowerCase(),
    name: form.name.trim(),
    nameHindi: form.nameHindi.trim(),
    localName: form.localName.trim(),
    category: form.category,
    image: form.image.trim(),
    description: form.description.trim(),
    usage: form.usage.trim(),
    badge: form.badge.trim(),
    active: form.active,
    benefits: textToLines(form.benefits),
    highlights: textToLines(form.highlights),
    packPrices: form.packPrices
      .map((pack) => ({
        size: pack.size.trim(),
        price: Number(pack.price || 0),
        buyPrice: Number(pack.buyPrice || 0),
      }))
      .filter((pack) => pack.size),
  });

  const handleSubmit = async () => {
    setSaving(true);
    setErrorMessage('');

    try {
      const payload = buildPayload();
      const res = await fetch('/api/admin/products', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Could not save product.');
        return;
      }

      if (data.product) {
        setProducts((prev) => {
          const next = editingId
            ? prev.map((product) => (product.id === editingId ? data.product : product))
            : [...prev, data.product];
          return [...next].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
        });
      }

      showStatus(editingId ? 'Product updated.' : 'Product created.');
      resetForm();
    } catch {
      showError('Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToPayload(product, { active: !product.active })),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Could not update product status.');
        return;
      }

      if (data.product) {
        setProducts((prev) =>
          prev.map((item) => (item.id === product.id ? data.product : item)),
        );
      }
      showStatus(product.active ? 'Product hidden from storefront.' : 'Product activated.');
    } catch {
      showError('Could not update product status.');
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    if (!confirm(`Delete "${product.name}" permanently?`)) return;

    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Could not delete product.');
        return;
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      showStatus('Product deleted.');

      if (editingId === product.id) {
        resetForm();
      }
    } catch {
      showError('Could not delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a45c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#c9a45c]/20 to-[#8b1a1a]/10 rounded-2xl flex items-center justify-center border border-[#c9a45c]/20">
            <Box className="w-6 h-6 text-[#8b1a1a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2d1b15]">Products</h1>
            <p className="text-sm text-[#6b5347]">
              {activeCount} active · {products.length} total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {statusMessage && (
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              {statusMessage}
            </span>
          )}
          {errorMessage && (
            <span className="text-sm font-medium text-red-500 flex items-center gap-1">
              <X className="w-4 h-4" />
              {errorMessage}
            </span>
          )}
          <Button type="button" onClick={startCreate} className="relative z-10 bg-[#8b1a1a] hover:bg-[#6d1414] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5347]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, slug, or category..."
            className="w-full pl-10 pr-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white transition-colors"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e8ddd0] bg-[#faf6f0]/60 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#2d1b15]">
                {editingId ? 'Edit Product' : 'New Product'}
              </h2>
              <p className="text-sm text-[#6b5347]">
                Manage storefront copy, pricing packs, and visibility.
              </p>
            </div>
            <Button variant="ghost" onClick={resetForm} className="text-[#6b5347]">
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                  placeholder="Moringa Powder"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setForm((prev) => ({ ...prev, slug: event.target.value.toLowerCase() }));
                  }}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                  placeholder="moringa-powder"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Local Name</label>
                <input
                  type="text"
                  value={form.localName}
                  onChange={(event) => setForm((prev) => ({ ...prev, localName: event.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                  placeholder="Moringa Powder"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Hindi / Alternate Name</label>
                <input
                  type="text"
                  value={form.nameHindi}
                  onChange={(event) => setForm((prev) => ({ ...prev, nameHindi: event.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                  placeholder="Optional alternate storefront name"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as ProductCategory }))}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Badge</label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                  placeholder="Bestseller, New, Popular..."
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Product Image</label>
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl bg-[#faf6f0] border border-[#e8ddd0] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {form.image ? (
                      <img src={form.image} alt="Product preview" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <Box className="w-6 h-6 text-[#e8ddd0]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="border-[#c9a45c] text-[#8b1a1a]"
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploading ? 'Uploading...' : form.image ? 'Replace Image' : 'Upload Image'}
                      </Button>
                      {form.image && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={form.image}
                      onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                      placeholder="Or paste an image path / URL"
                    />
                    <p className="text-[11px] text-[#6b5347]">JPEG, PNG, WebP, or GIF · up to 5 MB.</p>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-[#e8ddd0] rounded-xl bg-[#faf6f0]/40 mt-6 lg:mt-0">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-[#2d1b15]">Visible on storefront</span>
              </label>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] resize-none"
                  placeholder="Short storefront description..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Usage</label>
                <textarea
                  value={form.usage}
                  onChange={(event) => setForm((prev) => ({ ...prev, usage: event.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] resize-none"
                  placeholder="How customers should use the product..."
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Benefits</label>
                <textarea
                  value={form.benefits}
                  onChange={(event) => setForm((prev) => ({ ...prev, benefits: event.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] resize-none"
                  placeholder={'One line per benefit\nPure & Farm-sourced\nEasy daily use'}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b5347] block mb-2">Highlights</label>
                <textarea
                  value={form.highlights}
                  onChange={(event) => setForm((prev) => ({ ...prev, highlights: event.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] resize-none"
                  placeholder={'One line per highlight\nFine powder texture for quick mixing'}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#e8ddd0] overflow-hidden">
              <div className="px-4 py-3 bg-[#faf6f0]/60 border-b border-[#e8ddd0] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2d1b15]">Pack Pricing</h3>
                  <p className="text-xs text-[#6b5347]">Leave blank if the product is enquiry-only.</p>
                </div>
                <Button type="button" variant="outline" onClick={addPack} className="border-[#c9a45c] text-[#8b1a1a]">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Pack
                </Button>
              </div>
              <div className="divide-y divide-[#e8ddd0]">
                {form.packPrices.map((pack, index) => (
                  <div key={`${index}-${pack.size}`} className="grid md:grid-cols-[1.4fr_1fr_1fr_auto] gap-3 p-4">
                    <input
                      type="text"
                      value={pack.size}
                      onChange={(event) => updatePack(index, 'size', event.target.value)}
                      className="px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                      placeholder="100gm"
                    />
                    <input
                      type="number"
                      min="0"
                      value={pack.price}
                      onChange={(event) => updatePack(index, 'price', event.target.value)}
                      className="px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                      placeholder="Selling price"
                    />
                    <input
                      type="number"
                      min="0"
                      value={pack.buyPrice}
                      onChange={(event) => updatePack(index, 'buyPrice', event.target.value)}
                      className="px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c]"
                      placeholder="Cost price"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removePack(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={resetForm} className="text-[#6b5347]">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                {editingId ? 'Save Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8ddd0] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2d1b15]">Catalog</h2>
          <span className="text-xs text-[#6b5347] bg-[#faf6f0] px-3 py-1 rounded-full border border-[#e8ddd0]">
            {filteredProducts.length} shown
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-[#6b5347]">
            <Box className="w-14 h-14 text-[#e8ddd0] mx-auto mb-4" />
            <p className="text-base">No products match the current search.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e8ddd0]">
            {filteredProducts.map((product) => (
              <div key={product.id} className={`p-5 ${product.active ? 'hover:bg-[#faf6f0]/40' : 'bg-gray-50/50 opacity-75'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-[#faf6f0] border border-[#e8ddd0] overflow-hidden flex-shrink-0">
                      <img src={product.image || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[#2d1b15]">{product.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[#faf6f0] border border-[#e8ddd0] text-[#6b5347]">
                          {product.category}
                        </span>
                        <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                          product.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {product.active ? 'Active' : 'Hidden'}
                        </span>
                        {product.badge && (
                          <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[#8b1a1a]/10 text-[#8b1a1a] border border-[#8b1a1a]/10">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6b5347] mt-1">{product.slug}</p>
                      <p className="text-sm text-[#2d1b15]/70 mt-2 line-clamp-2">{product.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:w-[420px]">
                    <div className="rounded-xl border border-[#e8ddd0] bg-[#faf6f0]/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#6b5347]">Base Price</p>
                      <p className="text-sm font-bold text-[#8b1a1a]">₹{product.price}</p>
                    </div>
                    <div className="rounded-xl border border-[#e8ddd0] bg-[#faf6f0]/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#6b5347]">Cost</p>
                      <p className="text-sm font-bold text-[#2d1b15]">₹{product.costPrice}</p>
                    </div>
                    <div className="rounded-xl border border-[#e8ddd0] bg-[#faf6f0]/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#6b5347]">Packs</p>
                      <p className="text-sm font-bold text-[#2d1b15]">{product.packPrices.length}</p>
                    </div>
                    <div className="rounded-xl border border-[#e8ddd0] bg-[#faf6f0]/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#6b5347]">Updated</p>
                      <p className="text-sm font-bold text-[#2d1b15]">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => startEdit(product)}
                    className="border-[#e8ddd0] text-[#2d1b15]"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleActive(product)}
                    className="border-[#e8ddd0] text-[#2d1b15]"
                  >
                    {product.active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {deletingId === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
