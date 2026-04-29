"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Eye, MoreVertical, Download, ArrowDownUp, Package } from 'lucide-react'

const allOrders = [
  { id: '#ORD-7231', customer: 'Rohidas Sawant', date: 'Oct 24, 2026', items: 3, total: '₹1,250', status: 'Processing', payment: 'Paid' },
  { id: '#ORD-7230', customer: 'Amit Patel', date: 'Oct 24, 2026', items: 1, total: '₹450', status: 'Shipped', payment: 'Paid' },
  { id: '#ORD-7229', customer: 'Priya Sharma', date: 'Oct 23, 2026', items: 5, total: '₹2,800', status: 'Delivered', payment: 'Paid' },
  { id: '#ORD-7228', customer: 'Sanjay Kumar', date: 'Oct 23, 2026', items: 2, total: '₹320', status: 'Delivered', payment: 'COD' },
  { id: '#ORD-7227', customer: 'Neha Singh', date: 'Oct 22, 2026', items: 1, total: '₹150', status: 'Delivered', payment: 'Paid' },
  { id: '#ORD-7226', customer: 'Vikram Joshi', date: 'Oct 22, 2026', items: 2, total: '₹399', status: 'Processing', payment: 'Pending' },
  { id: '#ORD-7225', customer: 'Anita Desai', date: 'Oct 21, 2026', items: 4, total: '₹1,650', status: 'Cancelled', payment: 'Refunded' },
  { id: '#ORD-7224', customer: 'Rajesh Kadam', date: 'Oct 21, 2026', items: 1, total: '₹250', status: 'Delivered', payment: 'Paid' },
]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All')
  const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground text-sm mt-1">View, track and manage all customer orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-background shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Package className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by order ID, customer name..." 
                className="pl-9 pr-4 py-2 w-full bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-background text-muted-foreground">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="bg-background text-muted-foreground">
                <ArrowDownUp className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-card">
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
              {allOrders.filter(o => activeTab === 'All' || o.status === activeTab).map((order, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-primary cursor-pointer hover:underline">{order.id}</td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground font-bold text-xs">
                        {order.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-medium text-foreground block">{order.customer}</span>
                        <span className="text-xs text-muted-foreground">{order.items} items</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      order.payment === 'Paid' ? 'text-green-600 dark:text-green-400' : 
                      order.payment === 'Refunded' ? 'text-muted-foreground' : 
                      'text-amber-600 dark:text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        order.payment === 'Paid' ? 'bg-green-600 dark:bg-green-400' : 
                        order.payment === 'Refunded' ? 'bg-muted-foreground' : 
                        'bg-amber-600 dark:bg-amber-400'
                      }`}></span>
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground text-right">{order.total}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`border-0 font-medium ${
                      order.status === 'Delivered' ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 
                      order.status === 'Processing' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' : 
                      order.status === 'Cancelled' ? 'bg-destructive/15 text-destructive dark:text-red-400' :
                      'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                    }`}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing <span className="font-medium text-foreground">1-8</span> of <span className="font-medium text-foreground">1,240</span> orders</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 px-3 bg-background" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground border-primary">1</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-background">2</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-background">3</Button>
            <Button variant="outline" size="sm" className="h-8 px-3 bg-background">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
