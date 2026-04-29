import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, Bell, Search, Menu } from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard | Annavedah Foods',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="font-serif font-bold text-primary">A</span>
            </div>
            <span className="text-lg font-serif font-bold text-primary tracking-tight">Admin Console</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" active />
          <NavItem href="/admin/orders" icon={ShoppingCart} label="Orders" badge="12" />
          <NavItem href="/admin/products" icon={Package} label="Products" />
          <NavItem href="/admin/customers" icon={Users} label="Customers" />
          <NavItem href="/admin/analytics" icon={BarChart3} label="Analytics" />
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</p>
          </div>
          <NavItem href="/admin/settings" icon={Settings} label="Settings" />
        </div>
        
        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground mt-1">Super Admin</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon: Icon, label, active, badge }: any) {
  return (
    <Link href={href} className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4.5 h-4.5 ${active ? 'text-primary' : ''}`} />
        {label}
      </div>
      {badge && (
        <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </Link>
  )
}
