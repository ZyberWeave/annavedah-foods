'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShoppingBag, TrendingUp, LogOut, ShieldCheck, Box, Instagram, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Link2, Check, BarChart3 } from 'lucide-react';
import { ADMIN_SLUG } from '@/lib/admin-config';

interface InstaReel {
  id: number;
  permalink: string;
  caption: string | null;
  displayOrder: number;
  active: boolean;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Instagram Reels state
  const [reels, setReels] = useState<InstaReel[]>([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [newReelLink, setNewReelLink] = useState('');
  const [newReelCaption, setNewReelCaption] = useState('');
  const [addingReel, setAddingReel] = useState(false);
  const [reelSuccess, setReelSuccess] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'admin') {
          router.push(`/${ADMIN_SLUG}/login`);
        } else {
          setUser(data.user);
          // Fetch refunds for admin
          fetch('/api/admin/refunds')
            .then(res => res.json())
            .then(data => {
              if (data.refunds) setRefunds(data.refunds);
            });
          // Fetch Instagram Reels
          fetch('/api/admin/instagram-reels')
            .then(res => res.json())
            .then(data => {
              if (data.reels) setReels(data.reels);
            });
        }
      })
      .catch(() => router.push(`/${ADMIN_SLUG}/login`))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = `/${ADMIN_SLUG}/login`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[#faf6f0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a45c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px] lg:pt-[190px] pb-16 bg-[#faf6f0]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-[#e8ddd0] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8b1a1a]/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#8b1a1a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2d1b15]">Portal</h1>
              <p className="text-sm text-[#6b5347]">Manage store, orders, and users securely.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-[#2d1b15]">{user?.name}</p>
              <p className="text-xs text-[#c9a45c] uppercase tracking-wider font-semibold">Manager</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10">
              <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Revenue', value: '₹0.00', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
            { title: 'Active Orders', value: '0', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
            { title: 'Total Users', value: '1', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
            { title: 'Products', value: '42', icon: Box, color: 'text-amber-600', bg: 'bg-amber-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-[#e8ddd0] shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-[#6b5347] font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-[#2d1b15]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders Table */}
            <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e8ddd0] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#2d1b15]">Recent Orders</h2>
                <Button variant="ghost" className="text-[#8b1a1a] hover:bg-[#faf6f0]">View All</Button>
              </div>
              <div className="p-12 text-center text-[#6b5347]">
                <ShoppingBag className="w-12 h-12 text-[#e8ddd0] mx-auto mb-4" />
                <p>No recent orders found.</p>
              </div>
            </div>

            {/* Refund Requests Table */}
            <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e8ddd0]">
                <h2 className="text-lg font-bold text-[#2d1b15]">Refund Requests</h2>
              </div>
              {refunds.length === 0 ? (
                <div className="p-12 text-center text-[#6b5347]">
                  <p>No refund requests.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e8ddd0]">
                  {refunds.map((refund) => (
                    <div key={refund.id} className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#2d1b15]">{refund.user.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${refund.status === 'approved' ? 'bg-green-100 text-green-800' : refund.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {refund.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#6b5347] mb-1">Order: {refund.orderId}</p>
                        <p className="text-sm text-[#2d1b15]">{refund.reason}</p>
                        <p className="text-xs text-[#c9a45c] mt-1">{new Date(refund.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {refund.imageUrl && (
                          <a href={refund.imageUrl} target="_blank" rel="noreferrer" className="flex-shrink-0">
                            <img src={refund.imageUrl} alt="Refund proof" className="h-16 w-16 object-cover rounded-lg border border-[#e8ddd0]" />
                          </a>
                        )}
                        {refund.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              onClick={async () => {
                                const res = await fetch('/api/admin/refunds/' + refund.id, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'approved' })
                                });
                                if (res.ok) {
                                  setRefunds(prev => prev.map(r => r.id === refund.id ? { ...r, status: 'approved' } : r));
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={async () => {
                                const res = await fetch('/api/admin/refunds/' + refund.id, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'rejected' })
                                });
                                if (res.ok) {
                                  setRefunds(prev => prev.map(r => r.id === refund.id ? { ...r, status: 'rejected' } : r));
                                }
                              }}
                              className="border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instagram Reels Management */}
            <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e8ddd0] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-xl flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#2d1b15]">Instagram Reels</h2>
                    <p className="text-xs text-[#6b5347]">{reels.filter(r => r.active).length} active · {reels.length} total</p>
                  </div>
                </div>
              </div>

              {/* Add New Reel Form */}
              <div className="p-6 bg-[#faf6f0]/50 border-b border-[#e8ddd0]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-4 h-4 text-[#c9a45c]" />
                    <span className="text-sm font-semibold text-[#2d1b15]">Add New Reel</span>
                  </div>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5347]" />
                    <input
                      type="text"
                      value={newReelLink}
                      onChange={(e) => setNewReelLink(e.target.value)}
                      placeholder="Paste Instagram embed code or reel URL..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={newReelCaption}
                    onChange={(e) => setNewReelCaption(e.target.value)}
                    placeholder="Caption (optional) e.g. 'A post shared by @annavedah.foods'"
                    className="w-full px-4 py-3 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white transition-colors"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={async () => {
                        if (!newReelLink.trim()) return;
                        setAddingReel(true);
                        setReelSuccess('');
                        try {
                          // Extract permalink from embed code or direct URL
                          let permalink = newReelLink.trim();
                          const match = permalink.match(/data-instgrm-permalink="([^"]+)"/);
                          if (match) permalink = match[1];
                          // Ensure it's a valid Instagram URL
                          if (!permalink.includes('instagram.com')) {
                            setReelSuccess('Invalid Instagram URL');
                            setAddingReel(false);
                            return;
                          }
                          const res = await fetch('/api/admin/instagram-reels', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ permalink, caption: newReelCaption.trim() || null }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setReels(prev => [...prev, data.reel]);
                            setNewReelLink('');
                            setNewReelCaption('');
                            setReelSuccess('Reel added successfully!');
                            setTimeout(() => setReelSuccess(''), 3000);
                          }
                        } catch {
                          setReelSuccess('Failed to add reel');
                        } finally {
                          setAddingReel(false);
                        }
                      }}
                      disabled={addingReel || !newReelLink.trim()}
                      className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white"
                    >
                      {addingReel ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Add Reel
                    </Button>
                    {reelSuccess && (
                      <span className={`text-sm font-medium flex items-center gap-1 ${reelSuccess.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                        {reelSuccess.includes('success') && <Check className="w-4 h-4" />}
                        {reelSuccess}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reels List */}
              {reels.length === 0 ? (
                <div className="p-12 text-center text-[#6b5347]">
                  <Instagram className="w-12 h-12 text-[#e8ddd0] mx-auto mb-4" />
                  <p>No Instagram reels added yet.</p>
                  <p className="text-xs mt-1 text-[#c9a45c]">Paste an embed code or URL above to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e8ddd0]">
                  {reels.sort((a, b) => a.displayOrder - b.displayOrder).map((reel, idx) => (
                    <div key={reel.id} className={`p-4 flex items-center gap-4 transition-colors ${!reel.active ? 'opacity-50 bg-gray-50' : 'hover:bg-[#faf6f0]/50'}`}>
                      {/* Order Number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8b1a1a]/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#8b1a1a]">{idx + 1}</span>
                      </div>

                      {/* Reel Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2d1b15] truncate">
                          {reel.permalink.replace('https://www.instagram.com/', '').split('?')[0]}
                        </p>
                        {reel.caption && (
                          <p className="text-xs text-[#6b5347] truncate mt-0.5">{reel.caption}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Move Up */}
                        <button
                          onClick={async () => {
                            if (idx === 0) return;
                            const prevReel = reels.sort((a, b) => a.displayOrder - b.displayOrder)[idx - 1];
                            await Promise.all([
                              fetch('/api/admin/instagram-reels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reel.id, displayOrder: prevReel.displayOrder }) }),
                              fetch('/api/admin/instagram-reels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: prevReel.id, displayOrder: reel.displayOrder }) }),
                            ]);
                            setReels(prev => prev.map(r => {
                              if (r.id === reel.id) return { ...r, displayOrder: prevReel.displayOrder };
                              if (r.id === prevReel.id) return { ...r, displayOrder: reel.displayOrder };
                              return r;
                            }));
                          }}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-[#e8ddd0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-[#6b5347]" />
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={async () => {
                            const sorted = reels.sort((a, b) => a.displayOrder - b.displayOrder);
                            if (idx === sorted.length - 1) return;
                            const nextReel = sorted[idx + 1];
                            await Promise.all([
                              fetch('/api/admin/instagram-reels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reel.id, displayOrder: nextReel.displayOrder }) }),
                              fetch('/api/admin/instagram-reels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: nextReel.id, displayOrder: reel.displayOrder }) }),
                            ]);
                            setReels(prev => prev.map(r => {
                              if (r.id === reel.id) return { ...r, displayOrder: nextReel.displayOrder };
                              if (r.id === nextReel.id) return { ...r, displayOrder: reel.displayOrder };
                              return r;
                            }));
                          }}
                          disabled={idx === reels.length - 1}
                          className="p-1.5 rounded-lg hover:bg-[#e8ddd0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-[#6b5347]" />
                        </button>

                        {/* Toggle Active */}
                        <button
                          onClick={async () => {
                            const res = await fetch('/api/admin/instagram-reels', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: reel.id, active: !reel.active }),
                            });
                            if (res.ok) {
                              setReels(prev => prev.map(r => r.id === reel.id ? { ...r, active: !r.active } : r));
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${reel.active ? 'hover:bg-amber-50 text-green-600' : 'hover:bg-green-50 text-[#6b5347]'}`}
                          title={reel.active ? 'Hide from website' : 'Show on website'}
                        >
                          {reel.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this reel?')) return;
                            const res = await fetch(`/api/admin/instagram-reels?id=${reel.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              setReels(prev => prev.filter(r => r.id !== reel.id));
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                          title="Delete reel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / System Status */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#2d1b15] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-[#faf6f0] text-[#2d1b15] hover:bg-[#e8ddd0] border border-[#e8ddd0]">
                  <Box className="w-4 h-4 mr-3 text-[#c9a45c]" /> Add New Product
                </Button>
                <Button className="w-full justify-start bg-[#faf6f0] text-[#2d1b15] hover:bg-[#e8ddd0] border border-[#e8ddd0]">
                  <ShoppingBag className="w-4 h-4 mr-3 text-[#c9a45c]" /> Manage Orders
                </Button>
                <Button className="w-full justify-start bg-[#faf6f0] text-[#2d1b15] hover:bg-[#e8ddd0] border border-[#e8ddd0]">
                  <Users className="w-4 h-4 mr-3 text-[#c9a45c]" /> View Customers
                </Button>
                <Button onClick={() => router.push(`/${ADMIN_SLUG}/profitability`)} className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 text-[#2d1b15] hover:from-green-100 hover:to-emerald-100 border border-green-200">
                  <BarChart3 className="w-4 h-4 mr-3 text-green-600" /> Product Profitability
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8ddd0] shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#2d1b15] mb-4">System Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b5347]">Database</span>
                  <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b5347]">Payment Gateway</span>
                  <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b5347]">Shipping Partner</span>
                  <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
