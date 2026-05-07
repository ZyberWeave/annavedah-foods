"use client"

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Eye, Download, Package, Loader2, X, ArrowDownUp } from 'lucide-react'

interface AdminOrder {
  id: number
  orderId: string
  customerName: string
  customerEmail: string
  total: number
  items: number
  itemList: Array<{ name: string; qty: number; price: number }>
  status: string
  payment: 'Paid' | 'COD'
  createdAt: string
}

const STATUS_TABS = ['All', 'processing', 'shipped', 'delivered', 'cancelled'] as const
type Tab = typeof STATUS_TABS[number]

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN')
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function OrdersContent() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sortDesc, setSortDesc] = useState(true)
  const [selected, setSelected] = useState<AdminOrder | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' })
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let rows = orders
    if (activeTab !== 'All') {
      rows = rows.filter(o => (o.status || '').toLowerCase() === activeTab)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      )
    }
    rows = [...rows].sort((a, b) => {
      const t = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortDesc ? -t : t
    })
    return rows
  }, [orders, activeTab, search, sortDesc])

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length }
    for (const t of STATUS_TABS) {
      if (t === 'All') continue
      c[t] = orders.filter(o => (o.status || '').toLowerCase() === t).length
    }
    return c
  }, [orders])

  const totalRevenue = useMemo(
    () => orders.filter(o => (o.status || '').toLowerCase() !== 'cancelled').reduce((s, o) => s + o.total, 0),
    [orders]
  )

  const exportCSV = () => {
    const header = ['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Total (INR)', 'Payment', 'Status']
    const rows = filtered.map(o => [
      o.orderId,
      new Date(o.createdAt).toISOString(),
      o.customerName,
      o.customerEmail,
      String(o.items),
      String(o.total),
      o.payment,
      o.status,
    ])
    const csv = [header, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `annavedah-orders-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const updateStatus = async (status: string) => {
    if (!selected) return
    setUpdatingStatus(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selected.orderId, status }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.orderId === selected.orderId ? { ...o, status } : o))
        setSelected(prev => prev ? { ...prev, status } : prev)
      }
    } finally {
      setUpdatingStatus(false)
    }
  }

  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    const cls =
      s === 'delivered' ? 'bg-green-500/15 text-green-700 dark:text-green-400' :
      s === 'shipped' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400' :
      s === 'cancelled' ? 'bg-destructive/15 text-destructive dark:text-red-400' :
      'bg-amber-500/15 text-amber-700 dark:text-amber-400'
    const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Processing'
    return <Badge variant="outline" className={`border-0 font-medium ${cls}`}>{label}</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Loading orders…' :
              `${orders.length} order${orders.length === 1 ? '' : 's'} · ${formatINR(totalRevenue)} lifetime revenue`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-background shadow-sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex flex-col gap-4">
          <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab} <span className="ml-1 text-[11px] opacity-70">({counts[tab] ?? 0})</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, customer name, email…"
                className="pl-9 pr-4 py-2 w-full bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button variant="outline" size="sm" className="bg-background text-muted-foreground" onClick={() => setSortDesc(s => !s)}>
              <ArrowDownUp className="w-4 h-4 mr-2" />
              {sortDesc ? 'Newest first' : 'Oldest first'}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto bg-card">
          {loading ? (
            <div className="p-16 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-primary" />
              Loading orders…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 text-border" />
              <p className="font-medium text-foreground">No orders found</p>
              <p className="text-sm mt-1">{search ? 'Try a different search term.' : 'Orders will appear here once customers start checking out.'}</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-primary cursor-pointer hover:underline" onClick={() => setSelected(order)}>
                      #{order.orderId}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground font-bold text-xs">
                          {order.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate">{order.customerName}</span>
                          <span className="text-xs text-muted-foreground">{order.items} item{order.items === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        order.payment === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.payment === 'Paid' ? 'bg-green-600 dark:bg-green-400' : 'bg-amber-600 dark:bg-amber-400'
                        }`}></span>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground text-right">{formatINR(order.total)}</td>
                    <td className="px-6 py-4">{statusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setSelected(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-border bg-card flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of <span className="font-medium text-foreground">{orders.length}</span> orders
            </p>
          </div>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">Order #{selected.orderId}</h2>
                <p className="text-sm text-muted-foreground">{formatDate(selected.createdAt)} · {statusBadge(selected.status)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Customer</p>
                <p className="font-semibold text-foreground">{selected.customerName}</p>
                <a href={`mailto:${selected.customerEmail}`} className="text-sm text-primary hover:underline">{selected.customerEmail}</a>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Items</p>
                <ul className="divide-y divide-border border border-border rounded-lg">
                  {selected.itemList.length === 0 ? (
                    <li className="p-3 text-sm text-muted-foreground">No items recorded.</li>
                  ) : selected.itemList.map((i, idx) => (
                    <li key={idx} className="p-3 flex justify-between items-center text-sm">
                      <span><strong>{i.qty}×</strong> {i.name}</span>
                      <span className="font-medium">{formatINR(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Payment</p>
                  <p className="font-semibold text-foreground">{selected.payment}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Total</p>
                  <p className="font-bold text-lg text-primary">{formatINR(selected.total)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['processing', 'shipped', 'delivered', 'cancelled'] as const).map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant={(selected.status || '').toLowerCase() === s ? 'default' : 'outline'}
                      onClick={() => updateStatus(s)}
                      disabled={updatingStatus || (selected.status || '').toLowerCase() === s}
                      className="capitalize"
                    >
                      {updatingStatus ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="p-16 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-primary" />
        Loading orders…
      </div>
    }>
      <OrdersContent />
    </Suspense>
  )
}
