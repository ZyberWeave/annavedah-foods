import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, MapPin, User, Settings, LogOut, CreditCard, ChevronRight, CheckCircle2, Clock, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'My Account | Annavedah Foods',
  description: 'Manage your Annavedah Foods account, orders, and preferences.',
}

// Dummy data for the dashboard
const recentOrders = [
  { id: 'ORD-2026-001', date: 'April 20, 2026', total: '₹1,250', status: 'Delivered', items: 3 },
  { id: 'ORD-2026-002', date: 'April 15, 2026', total: '₹890', status: 'Processing', items: 2 },
  { id: 'ORD-2026-003', date: 'April 02, 2026', total: '₹2,100', status: 'Delivered', items: 5 },
]

const savedAddresses = [
  {
    id: 1,
    type: 'Home',
    name: 'Rohidas Sawant',
    street: '123 Annavedah Street, Apt 4B',
    city: 'Pune',
    state: 'Maharashtra',
    zip: '411001',
    isDefault: true,
  },
  {
    id: 2,
    type: 'Office',
    name: 'Rohidas Sawant',
    street: 'Tech Park, Tower A, 5th Floor',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    isDefault: false,
  }
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Tabs List */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
                RS
              </div>
              <div>
                <h2 className="font-bold text-lg">Rohidas Sawant</h2>
                <p className="text-sm text-muted-foreground">Premium Member</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <nav className="flex flex-col p-2">
              <Link href="#dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors">
                <User className="w-5 h-5" />
                Dashboard
              </Link>
              <Link href="#orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors">
                <Package className="w-5 h-5" />
                My Orders
              </Link>
              <Link href="#addresses" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors">
                <MapPin className="w-5 h-5" />
                Addresses
              </Link>
              <Link href="#settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors">
                <Settings className="w-5 h-5" />
                Account Settings
              </Link>
              <div className="h-px bg-border my-2 mx-4" />
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary mb-2">Welcome back, Rohidas!</h1>
            <p className="text-muted-foreground">From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-card to-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <h3 className="text-2xl font-bold text-foreground">12</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold text-foreground">1</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Addresses</p>
                  <h3 className="text-2xl font-bold text-foreground">2</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start h-12 p-1 bg-muted">
              <TabsTrigger value="overview" className="h-10 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="orders" className="h-10 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Recent Orders</TabsTrigger>
              <TabsTrigger value="addresses" className="h-10 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 animate-fade-in-up">
              {/* Recent Orders Preview */}
              <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-serif text-primary">Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-accent/10">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 rounded-tr-lg">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-4 font-medium text-foreground">{order.id}</td>
                            <td className="px-4 py-4 text-muted-foreground">{order.date}</td>
                            <td className="px-4 py-4">
                              <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={order.status === 'Delivered' ? 'bg-green-600/10 text-green-700 hover:bg-green-600/20 border-0' : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-0'}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 font-semibold text-primary">{order.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Default Address Preview */}
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-primary">Default Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/50">
                    <div className="mt-1 p-2 bg-primary/10 rounded-full text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{savedAddresses[0].name}</h4>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-primary/20">Default</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {savedAddresses[0].street}<br />
                        {savedAddresses[0].city}, {savedAddresses[0].state} {savedAddresses[0].zip}<br />
                        India
                      </p>
                      <div className="mt-4 flex gap-3">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-border hover:bg-muted">Edit Address</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="animate-fade-in-up">
               <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-primary">Order History</CardTitle>
                  <CardDescription>View all your past orders and their current status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors bg-card">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-foreground">{order.id}</h4>
                              <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={order.status === 'Delivered' ? 'bg-green-600/10 text-green-700 hover:bg-green-600/20 border-0' : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-0'}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Ordered on {order.date} • {order.items} items</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 pl-16 sm:pl-0">
                          <span className="font-bold text-lg text-primary">{order.total}</span>
                          <Button variant="link" className="h-auto p-0 text-accent font-semibold">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-primary">Saved Addresses</h2>
                <Button className="bg-accent hover:bg-accent/90 text-white shadow-sm font-semibold">
                  Add New Address
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedAddresses.map((address) => (
                  <Card key={address.id} className={'border-border shadow-sm transition-all hover:shadow-md ' + (address.isDefault ? 'ring-2 ring-primary/20' : '')}>
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {address.type} 
                          {address.isDefault && <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">Default</Badge>}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-foreground mb-1">{address.name}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed h-20">
                        {address.street}<br />
                        {address.city}, {address.state} {address.zip}<br />
                        India
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs border-border hover:bg-muted font-medium">
                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-border font-medium">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </div>
  )
}
