'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ADMIN_SLUG } from '@/lib/admin-config'
import {
  LayoutDashboard, ShoppingCart, BarChart3, LogOut, Bell, Search, Menu, MessageSquareQuote, Star, Loader2, Box, Store, Layers, Users, Receipt
} from 'lucide-react'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [activeOrders, setActiveOrders] = useState<number | null>(null)
  const [pendingRefunds, setPendingRefunds] = useState<number>(0)
  const [signingOut, setSigningOut] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d?.user) setUser(d.user)
    }).catch(() => {})
    fetch('/api/admin/stats').then(r => r.json()).then(d => {
      if (typeof d?.activeOrders === 'number') setActiveOrders(d.activeOrders)
      if (typeof d?.pendingRefunds === 'number') setPendingRefunds(d.pendingRefunds)
    }).catch(() => {})
  }, [pathname])

  const initials = (user?.name || 'AF')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      window.location.href = `/${ADMIN_SLUG}/login`
    }
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    router.push(`/${ADMIN_SLUG}/orders?q=${encodeURIComponent(q)}`)
  }

  const mainNavItems = [
    { href: `/${ADMIN_SLUG}`, icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: `/${ADMIN_SLUG}/orders`, icon: ShoppingCart, label: 'Orders', badge: activeOrders ?? undefined },
    { href: `/${ADMIN_SLUG}/products`, icon: Box, label: 'Products' },
    { href: `/${ADMIN_SLUG}/profitability`, icon: BarChart3, label: 'Profitability' },
    { href: `/${ADMIN_SLUG}/testimonials`, icon: MessageSquareQuote, label: 'Testimonials' },
    { href: `/${ADMIN_SLUG}/reviews`, icon: Star, label: 'Reviews' },
  ]

  const posNavItems = [
    { href: `/${ADMIN_SLUG}/pos`, icon: Store, label: 'POS Billing Terminal', exact: true },
    { href: `/${ADMIN_SLUG}/pos/batches`, icon: Layers, label: 'Batch & Expiry' },
    { href: `/${ADMIN_SLUG}/pos/customers`, icon: Users, label: 'Customer Directory' },
    { href: `/${ADMIN_SLUG}/pos/audit`, icon: Receipt, label: 'Sales Audit & Receipts' },
  ]

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href

  const SidebarBody = (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="font-serif font-bold text-primary">A</span>
          </div>
          <span className="text-lg font-serif font-bold text-primary tracking-tight">Console</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {/* MAIN NAVIGATION */}
        <div className="space-y-1">
          <span className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            MANAGEMENT
          </span>
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href, item.exact)
                  ? 'bg-primary/10 text-primary shadow-sm border border-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActive(item.href, item.exact) ? 'text-primary' : ''}`} />
                {item.label}
              </div>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* OFFLINE POS SUITE */}
        <div className="space-y-1">
          <div className="px-4 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
              OFFLINE POS SUITE
            </span>
            <span className="bg-primary/20 text-primary text-[9px] font-extrabold px-1.5 py-0.5 rounded">
              COUNTER
            </span>
          </div>
          {posNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href, item.exact)
                  ? 'bg-primary text-primary-foreground font-bold shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left text-sm font-medium disabled:opacity-50"
        >
          {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </>
  )

  return (
    <div className="fixed inset-0 z-[100] flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col shadow-sm">
        {SidebarBody}
      </aside>

      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative w-64 border-r border-border bg-card flex flex-col shadow-xl">
            {SidebarBody}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-muted/20">
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileNavOpen(true)} className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <form onSubmit={onSearchSubmit} className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders by ID, name, email..."
                className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/${ADMIN_SLUG}`}
              className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              title={pendingRefunds ? `${pendingRefunds} pending refund request${pendingRefunds === 1 ? '' : 's'}` : 'No new notifications'}
            >
              <Bell className="w-5 h-5" />
              {pendingRefunds > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground rounded-full border-2 border-card text-[10px] font-bold flex items-center justify-center">
                  {pendingRefunds}
                </span>
              )}
            </Link>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none text-foreground">{user?.name || 'Loading…'}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.role || '—'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shadow-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  )
}
