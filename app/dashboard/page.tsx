'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Loader2, Package, Settings, LogOut, User, AlertCircle, LayoutDashboard,
  ShoppingBag, Heart, ChevronRight, CheckCircle2, Clock, Eye, EyeOff,
  Mail, Shield, Calendar, ArrowRight, Truck, CreditCard, Tag, Lock, Pencil, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'overview' | 'orders' | 'settings';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen site-page-gap pb-16 flex items-center justify-center bg-[#faf6f0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a45c]" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<Tab>((tabParam as Tab) || 'overview');

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    if (tabParam === 'orders' || tabParam === 'settings') setActiveTab(tabParam);
  }, [tabParam]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
      setEditName(data.user.name);
      setEditEmail(data.user.email);
      const oRes = await fetch('/api/orders');
      const oData = await oRes.json();
      if (oData.orders) setOrders(oData.orders);
    } catch { router.push('/login'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleProfileSave = async () => {
    if (!editName.trim() || !editEmail.trim()) { toast.error('Name and email are required'); return; }
    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser((u: any) => ({ ...u, name: editName.trim(), email: editEmail.trim() }));
      toast.success('Profile updated successfully');
    } catch (err: any) { toast.error(err.message || 'Failed to update profile'); }
    finally { setProfileSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw) { toast.error('Please fill in all password fields'); return; }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPw)) { toast.error('New password must include an uppercase letter'); return; }
    if (!/[a-z]/.test(newPw)) { toast.error('New password must include a lowercase letter'); return; }
    if (!/\d/.test(newPw)) { toast.error('New password must include a number'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      toast.success('Password changed successfully');
    } catch (err: any) { toast.error(err.message || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order? Prepaid orders will be sent for refund approval.')) return;

    setCancellingOrderId(orderId);
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Could not cancel this order');

      setOrders((current) => current.map((order) =>
        order.orderId === orderId ? { ...order, cancellationStatus: 'pending' } : order
      ));
      toast.success('Cancellation request submitted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not cancel this order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen site-page-gap pb-16 flex items-center justify-center bg-[#faf6f0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a45c]" />
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => o.status === 'cancelled' ? sum : sum + (o.total || 0), 0);
  const recentOrders = orders.slice(0, 3);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#e8ddd0] bg-white text-sm text-[#2d1b15] placeholder:text-[#a39189] focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30 focus:border-[#c9a45c] transition-all";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen site-page-gap pb-16 bg-[#faf6f0]">
      {/* Full-bleed Hero Banner */}
      <div className="relative overflow-hidden mb-10 bg-gradient-to-br from-[#2d1b15] via-[#3d2520] to-[#1a0f0a]">
        <div className="absolute inset-0 pattern-overlay opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a45c]/8 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#8b1a1a]/15 rounded-full blur-[80px]" />
        {/* Decorative gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a45c] to-transparent opacity-40" />
        <div className="relative container mx-auto px-4 max-w-6xl py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Glowing avatar */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-[#c9a45c]/40 to-[#c9a45c]/10 rounded-full blur-md group-hover:from-[#c9a45c]/60 group-hover:to-[#c9a45c]/20 transition-all duration-700" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#c9a45c] to-[#a07830] flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-2xl shadow-[#c9a45c]/25 ring-[3px] ring-white/15">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-[#3d2520] shadow-lg" />
              </div>
              <div>
                <p className="text-[#c9a45c]/80 text-xs font-semibold uppercase tracking-[0.25em] mb-1.5">{getGreeting()}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">{user?.name}</h1>
                <p className="text-[#faf6f0]/50 text-sm flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} className="bg-white/8 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 hover:border-white/20 backdrop-blur-sm rounded-xl px-6 py-2.5 transition-all duration-300">
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8b1a1a] text-white shadow-lg shadow-[#8b1a1a]/20'
                  : 'bg-white text-[#6b5347] border border-[#e8ddd0] hover:border-[#c9a45c] hover:text-[#8b1a1a]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: orders.length, icon: <Package className="w-5 h-5" />, color: '#8b1a1a', gradient: 'from-[#8b1a1a]/5 to-[#8b1a1a]/0' },
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: <CreditCard className="w-5 h-5" />, color: '#c9a45c', gradient: 'from-[#c9a45c]/5 to-[#c9a45c]/0' },
                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently', icon: <Calendar className="w-5 h-5" />, color: '#2d8b5a', gradient: 'from-[#2d8b5a]/5 to-[#2d8b5a]/0' },
                { label: 'Account Type', value: user?.role === 'admin' ? 'Admin' : 'Customer', icon: <Shield className="w-5 h-5" />, color: '#5a4dbf', gradient: 'from-[#5a4dbf]/5 to-[#5a4dbf]/0' },
              ].map((s, i) => (
                <div key={s.label} className={`relative rounded-2xl border border-[#e8ddd0] bg-gradient-to-br ${s.gradient} bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ background: s.color }} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300" style={{ background: `${s.color}15`, color: s.color }}>
                        {s.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2d1b15]">{s.value}</p>
                    <p className="text-xs text-[#6b5347] mt-1 font-medium uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Shop Products', desc: 'Browse our collection', href: '/products', icon: <ShoppingBag className="w-5 h-5" />, color: '#8b1a1a' },
                { label: 'My Wishlist', desc: 'Products you saved', href: '/wishlist', icon: <Heart className="w-5 h-5" />, color: '#c9a45c' },
                { label: 'Request Refund', desc: 'Need help with an order?', href: '/dashboard/refund', icon: <AlertCircle className="w-5 h-5" />, color: '#6b5347' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="group flex items-center gap-4 p-5 rounded-2xl border border-[#e8ddd0] bg-white hover:border-[#c9a45c] hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}12`, color: a.color }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2d1b15] text-sm">{a.label}</p>
                    <p className="text-xs text-[#6b5347]">{a.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#c9a45c] group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl border border-[#e8ddd0] bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-[#e8ddd0]">
                <h3 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#c9a45c]" /> Recent Orders
                </h3>
                {orders.length > 0 && (
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#c9a45c] hover:text-[#8b1a1a] flex items-center gap-1 uppercase tracking-wider transition-colors">
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="p-6 pt-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-[#e8ddd0] rounded-2xl bg-[#faf6f0]">
                    <Package className="w-12 h-12 text-[#c9a45c]/40 mx-auto mb-4" />
                    <p className="text-lg font-bold text-[#2d1b15]">No orders yet</p>
                    <p className="text-sm text-[#6b5347] mb-6">Start shopping to see your orders here.</p>
                    <Button onClick={() => router.push('/products')} className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl">
                      <ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onCancel={handleCancelOrder}
                        cancelling={cancellingOrderId === order.orderId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ORDERS TAB ═══ */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
            <div className="rounded-2xl border border-[#e8ddd0] bg-white shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-[#e8ddd0]">
                <h3 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#c9a45c]" /> All Orders
                  {orders.length > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#8b1a1a]/10 text-[#8b1a1a]">
                      {orders.length}
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-6 pt-4">
                {orders.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-[#e8ddd0] rounded-2xl bg-[#faf6f0]">
                    <Package className="w-14 h-14 text-[#c9a45c]/40 mx-auto mb-4" />
                    <p className="text-xl font-bold text-[#2d1b15]">No orders yet</p>
                    <p className="text-sm text-[#6b5347] mb-6">Your order history will appear here.</p>
                    <Button onClick={() => router.push('/products')} className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl">
                      <ShoppingBag className="w-4 h-4 mr-2" /> Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        expanded
                        onCancel={handleCancelOrder}
                        cancelling={cancellingOrderId === order.orderId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
            {/* Profile */}
            <div className="rounded-2xl border border-[#e8ddd0] bg-white shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-[#e8ddd0]">
                <h3 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-[#c9a45c]" /> Edit Profile
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#6b5347] uppercase tracking-wider mb-2 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39189]" />
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={`${inputCls} pl-10`} placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6b5347] uppercase tracking-wider mb-2 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39189]" />
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={`${inputCls} pl-10`} placeholder="you@example.com" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleProfileSave} disabled={profileSaving} className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl px-6">
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-[#e8ddd0] bg-white shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-[#e8ddd0]">
                <h3 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#c9a45c]" /> Change Password
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-[#6b5347] uppercase tracking-wider mb-2 block">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39189]" />
                    <input type={showCurrentPw ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={`${inputCls} pl-10 pr-10`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a39189] hover:text-[#6b5347]">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#6b5347] uppercase tracking-wider mb-2 block">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39189]" />
                      <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)} className={`${inputCls} pl-10 pr-10`} placeholder="Create a strong password" />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a39189] hover:text-[#6b5347]">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6b5347] uppercase tracking-wider mb-2 block">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39189]" />
                      <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={`${inputCls} pl-10`} placeholder="Re-enter new password" />
                      {confirmPw && newPw === confirmPw && (
                        <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                {newPw && (() => {
                  const checks = [
                    { label: '8+ characters', ok: newPw.length >= 8 },
                    { label: 'Uppercase letter', ok: /[A-Z]/.test(newPw) },
                    { label: 'Lowercase letter', ok: /[a-z]/.test(newPw) },
                    { label: 'A number', ok: /\d/.test(newPw) },
                  ];
                  return (
                    <div className="rounded-xl border border-[#e8ddd0] bg-[#faf6f0]/60 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b5347] mb-2">Password requirements</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {checks.map((c) => (
                          <div key={c.label} className={`flex items-center gap-1.5 ${c.ok ? 'text-green-600' : 'text-[#a39189]'}`}>
                            {c.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#a39189] inline-block" />}
                            {c.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange} disabled={pwSaving} className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl px-6">
                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                    Update Password
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
              <h3 className="text-sm font-bold text-red-800 mb-1">Danger Zone</h3>
              <p className="text-xs text-red-600/80 mb-4">Logging out will end your current session.</p>
              <Button onClick={handleLogout} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 rounded-xl text-sm font-bold">
                <LogOut className="w-4 h-4 mr-2" /> Log Out of Account
              </Button>
            </div>
          </div>
        )}
      </div>{/* end container */}
    </div>
  );
}

/* ────── Order Card Component ────── */
function OrderCard({
  order,
  expanded = false,
  onCancel,
  cancelling = false,
}: {
  order: any;
  expanded?: boolean;
  onCancel?: (orderId: string) => void;
  cancelling?: boolean;
}) {
  let parsedItems: any[] = [];
  try { parsedItems = JSON.parse(order.items); } catch {}

  const isCOD = order.paymentId === 'COD';
  const statusColor = order.status === 'success'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : order.status === 'cancelled'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="border border-[#e8ddd0] rounded-2xl p-5 bg-[#faf6f0] hover:border-[#c9a45c]/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8b1a1a]/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-[#8b1a1a]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2d1b15]">Order #{order.orderId?.slice(0, 20)}{order.orderId?.length > 20 ? '…' : ''}</p>
            <p className="text-xs text-[#6b5347]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:text-right">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
              {order.status === 'cancelled'
                ? <XCircle className="w-3 h-3" />
                : order.status === 'success'
                  ? <CheckCircle2 className="w-3 h-3" />
                  : <Clock className="w-3 h-3" />}
              {order.status || 'Confirmed'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isCOD ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
              {isCOD ? <Truck className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
              {isCOD ? 'COD' : 'Prepaid'}
            </span>
          </div>
          <p className="text-lg font-bold text-[#2d1b15]">₹{order.total}</p>
        </div>
      </div>
      {(expanded || parsedItems.length <= 4) && parsedItems.length > 0 && (
        <div className="pt-3 border-t border-[#e8ddd0]/60">
          <div className="flex flex-wrap gap-2">
            {parsedItems.map((item: any, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e8ddd0] text-xs font-medium text-[#2d1b15]">
                <Tag className="w-3 h-3 text-[#c9a45c]" />
                {item.qty}× {item.name || 'Product'}
              </span>
            ))}
          </div>
        </div>
      )}
      {!expanded && parsedItems.length > 4 && (
        <p className="pt-3 border-t border-[#e8ddd0]/60 text-xs text-[#6b5347]">
          {parsedItems.length} items in this order
        </p>
      )}
      {order.status !== 'cancelled' && order.cancellationStatus ? (
        <div className="mt-3 pt-3 border-t border-[#e8ddd0]/60 flex items-center gap-2 text-xs font-semibold text-amber-700">
          <Clock className="w-4 h-4" />
          {order.cancellationStatus === 'approved' ? 'Cancellation approved' : 'Cancellation request pending'}
        </div>
      ) : order.status === 'success' && onCancel ? (
        <div className="mt-3 pt-3 border-t border-[#e8ddd0]/60 flex justify-end">
          <button
            type="button"
            onClick={() => onCancel(order.orderId)}
            disabled={cancelling}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            {cancelling ? 'Submitting…' : 'Cancel order'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
