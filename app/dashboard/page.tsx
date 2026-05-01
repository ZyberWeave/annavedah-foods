'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Settings, LogOut, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
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
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#8b1a1a]">My Dashboard</h1>
            <p className="text-[#6b5347]">Welcome back, {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10">
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="md:col-span-1 rounded-3xl border border-[#e8ddd0] bg-white p-6 shadow-sm h-fit">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-[#f0e8dc] flex items-center justify-center border-4 border-[#c9a45c]/20">
                <User className="w-10 h-10 text-[#8b1a1a]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d1b15]">{user?.name}</h2>
                <p className="text-sm text-[#6b5347]">{user?.email}</p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-[#8b1a1a]/10 text-[#8b1a1a] text-xs font-semibold uppercase tracking-wider">
                  {user?.role}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#e8ddd0] space-y-2">
              <Button variant="ghost" className="w-full justify-start text-[#6b5347] hover:text-[#8b1a1a] hover:bg-[#faf6f0]">
                <Package className="w-4 h-4 mr-3" /> Order History
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-[#6b5347] hover:text-[#8b1a1a] hover:bg-[#faf6f0]">
                <Link href="/dashboard/refund">
                  <AlertCircle className="w-4 h-4 mr-3" /> Request a Refund
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-[#6b5347] hover:text-[#8b1a1a] hover:bg-[#faf6f0]">
                <Settings className="w-4 h-4 mr-3" /> Account Settings
              </Button>
            </div>
          </div>

          {/* Recent Activity / Orders */}
          <div className="md:col-span-2 rounded-3xl border border-[#e8ddd0] bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#2d1b15] mb-6">Recent Orders</h3>
            
            <div className="text-center py-12 border-2 border-dashed border-[#e8ddd0] rounded-2xl bg-[#faf6f0]">
              <Package className="w-12 h-12 text-[#c9a45c]/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-[#2d1b15]">No orders yet</p>
              <p className="text-sm text-[#6b5347] mb-6">When you place an order, it will appear here.</p>
              <Button onClick={() => router.push('/products')} className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white">
                Start Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
