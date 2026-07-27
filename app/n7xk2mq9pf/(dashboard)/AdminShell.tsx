'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ADMIN_SLUG } from '@/lib/admin-config'
import {
  LayoutDashboard, ShoppingCart, BarChart3, LogOut, Bell, Search, Menu, MessageSquareQuote, Star, Loader2, Box, Store, Layers, Users, Receipt, PanelLeftClose, PanelLeftOpen, MessageSquare, Mail
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
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const storedState = localStorage.getItem('admin_sidebar_collapsed')
    if (storedState === 'true') {
      setCollapsed(true)
    }
  }, [])

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('admin_sidebar_collapsed', String(next))
      return next
    })
  }

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
    { href: `/${ADMIN_SLUG}/whatsapp`, icon: MessageSquare, label: 'WhatsApp Flows', badge: '12' },
    { href: `/${ADMIN_SLUG}/email-flows`, icon: Mail, label: 'Email Automation', badge: '50' },
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

  const renderSidebar = (isMobile = false) => {
    const isMin = !isMobile && collapsed

    return (
      <>
        <div className={`h-16 flex items-center justify-between border-b border-border bg-card transition-all duration-300 ${isMin ? 'justify-center px-2' : 'px-6'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <span className="font-serif font-bold text-primary">A</span>
            </div>
            {(!isMin || isMobile) && (
              <span className="text-lg font-serif font-bold text-primary tracking-tight truncate">Console</span>
            )}
          </div>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5 text-primary" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          <div className="space-y-1">
            {(!isMin || isMobile) ? (
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-1">
                MANAGEMENT
              </span>
            ) : (
              <div className="h-4" />
            )}
            {mainNavItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isMin && !isMobile ? item.label : undefined}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center ${isMin && !isMobile ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary/10 text-primary shadow-sm border border-primary/10 font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className={`flex items-center ${isMin && !isMobile ? 'justify-center' : 'gap-3'}`}>
                    <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : ''}`} />
                    {(!isMin || isMobile) && <span className="truncate">{item.label}</span>}
                  </div>
                  {(!isMin || isMobile) && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                  {isMin && !isMobile && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="w-2 h-2 rounded-full bg-primary absolute top-2 right-2" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-border/50">
            {(!isMin || isMobile) ? (
              <div className="px-3 flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  STORE POS SUITE
                </span>
                <span className="bg-primary/20 text-primary text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                  COUNTER
                </span>
              </div>
            ) : (
              <div className="h-4" />
            )}
            {posNavItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isMin && !isMobile ? item.label : undefined}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center ${isMin && !isMobile ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground font-bold shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className={`flex items-center ${isMin && !isMobile ? 'justify-center' : 'gap-3'}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {(!isMin || isMobile) && <span className="truncate">{item.label}</span>}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title={isMin && !isMobile ? 'Sign Out' : undefined}
            className={`flex items-center ${isMin && !isMobile ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'} w-full rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left text-sm font-medium disabled:opacity-50`}
          >
            {signingOut ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <LogOut className="w-4 h-4 shrink-0" />}
            {(!isMin || isMobile) && <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex h-screen bg-background text-foreground overflow-hidden">
      <aside className={`${collapsed ? 'w-20' : 'w-64'} border-r border-border bg-card hidden md:flex flex-col shadow-sm transition-all duration-300 relative`}>
        {renderSidebar(false)}
      </aside>

      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative w-64 border-r border-border bg-card flex flex-col shadow-xl">
            {renderSidebar(true)}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-muted/20 flex flex-col transition-all duration-300">
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNavOpen(true)} className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4 text-primary" /> : <PanelLeftClose className="w-4 h-4" />}
              <span>{collapsed ? "Expand Menu" : "Collapse Menu"}</span>
            </button>
            <form onSubmit={onSearchSubmit} className="relative hidden sm:block ml-2">
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

        <div className="flex-1 p-4 sm:p-6 lg:p-8 scroll-smooth w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
