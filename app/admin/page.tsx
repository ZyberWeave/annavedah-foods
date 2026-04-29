"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, Package, IndianRupee, MoreVertical, Search, Filter } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const revenueData = [
  { name: 'Mon', total: 12500 },
  { name: 'Tue', total: 15200 },
  { name: 'Wed', total: 14800 },
  { name: 'Thu', total: 18400 },
  { name: 'Fri', total: 22500 },
  { name: 'Sat', total: 28900 },
  { name: 'Sun', total: 24100 },
]

const salesByCategory = [
  { name: 'Powders', value: 45000 },
  { name: 'Grains', value: 28000 },
  { name: 'Blends', value: 35000 },
  { name: 'Oils', value: 15000 },
]

const recentOrders = [
  { id: '#ORD-7231', customer: 'Rohidas Sawant', product: 'Premium Desi Ghee (1L)', date: '2 mins ago', amount: '₹1,250', status: 'Processing' },
  { id: '#ORD-7230', customer: 'Amit Patel', product: 'Pure Turmeric Powder', date: '1 hour ago', amount: '₹450', status: 'Shipped' },
  { id: '#ORD-7229', customer: 'Priya Sharma', product: 'A2 Cow Milk (Monthly)', date: '3 hours ago', amount: '₹2,800', status: 'Delivered' },
  { id: '#ORD-7228', customer: 'Sanjay Kumar', product: 'Cold Pressed Mustard Oil', date: '5 hours ago', amount: '₹320', status: 'Delivered' },
  { id: '#ORD-7227', customer: 'Neha Singh', product: 'Himalayan Pink Salt', date: '1 day ago', amount: '₹150', status: 'Delivered' },
  { id: '#ORD-7226', customer: 'Vikram Joshi', product: 'Moringa Leaf Powder', date: '1 day ago', amount: '₹399', status: 'Processing' },
]

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('7days')

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value="₹1,36,400" 
          icon={IndianRupee} 
          trend="+12.5%" 
          trendUp={true} 
          desc="vs previous 7 days" 
          delay="delay-100"
        />
        <StatCard 
          title="Total Orders" 
          value="1,240" 
          icon={Package} 
          trend="+8.2%" 
          trendUp={true} 
          desc="vs previous 7 days" 
          delay="delay-200"
        />
        <StatCard 
          title="Active Customers" 
          value="342" 
          icon={Users} 
          trend="-2.4%" 
          trendUp={false} 
          desc="vs previous 7 days" 
          delay="delay-300"
        />
        <StatCard 
          title="Conversion Rate" 
          value="3.2%" 
          icon={TrendingUp} 
          trend="+1.1%" 
          trendUp={true} 
          desc="vs previous 7 days" 
          delay="delay-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-card">
            <div className="space-y-1">
              <CardTitle className="text-lg font-serif font-bold">Revenue Trends</CardTitle>
              <CardDescription>Daily revenue for the last 7 days</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-card">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.35 0.15 25)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="oklch(0.35 0.15 25)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="currentColor" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    className="text-muted-foreground font-medium"
                    dy={10}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value/1000}k`}
                    className="text-muted-foreground font-medium"
                    dx={-10}
                  />
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="oklch(0.9 0.02 60 / 0.5)" className="dark:stroke-neutral-800" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid oklch(0.9 0.02 60)', backgroundColor: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="oklch(0.35 0.15 25)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    activeDot={{ r: 6, fill: "oklch(0.35 0.15 25)", stroke: "var(--background)", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="lg:col-span-1 border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle className="text-lg font-serif font-bold">Sales by Category</CardTitle>
            <CardDescription>Revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 bg-card">
            <div className="h-[240px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategory} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={13}
                    className="text-foreground font-medium"
                    width={80}
                  />
                  <Tooltip 
                    cursor={{fill: 'oklch(0.92 0.02 60 / 0.5)'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`oklch(${0.35 + index*0.1} ${0.15 - index*0.02} 25)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {salesByCategory.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `oklch(${0.35 + i*0.1} ${0.15 - i*0.02} 25)` }}></span>
                    <span className="font-medium text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-bold text-foreground">₹{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-serif font-bold">Recent Orders</CardTitle>
            <CardDescription>Latest transactions needing attention</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[200px] transition-all"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 bg-background">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto bg-card">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-primary">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground font-bold text-xs">
                        {order.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-foreground">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">{order.product}</td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{order.date}</td>
                  <td className="px-6 py-4 font-semibold text-foreground text-right">{order.amount}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`border-0 font-medium ${
                      order.status === 'Delivered' ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 
                      order.status === 'Processing' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' : 
                      'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                    }`}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border bg-muted/10 flex justify-center">
          <Button variant="link" className="text-primary font-medium">View All Orders <ArrowUpRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, trendUp, desc, delay }: any) {
  return (
    <Card className={`border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-card rounded-2xl overflow-hidden animate-fade-in-up ${delay}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-foreground font-serif tracking-tight">{value}</h3>
          <div className="flex items-center mt-2">
            <Badge variant="outline" className={`px-1.5 py-0 border-0 ${trendUp ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-destructive/15 text-destructive dark:text-red-400'}`}>
              {trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {trend}
            </Badge>
            <span className="text-muted-foreground ml-2 text-xs font-medium">{desc}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
