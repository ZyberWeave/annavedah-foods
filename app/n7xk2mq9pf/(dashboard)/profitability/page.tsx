'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { products, type Product, type ProductCategory } from '@/lib/content';
import { Button } from '@/components/ui/button';
import {
  Loader2, ShieldCheck, LogOut, ArrowLeft,
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  ChevronDown, ChevronUp, Search, Filter
} from 'lucide-react';
import { ADMIN_SLUG } from '@/lib/admin-config';

type SortKey = 'name' | 'sellPrice' | 'buyPrice' | 'margin' | 'marginPct';
type SortDir = 'asc' | 'desc';

export default function ProfitabilityPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('marginPct');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'admin') {
          router.push(`/${ADMIN_SLUG}/login`);
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push(`/${ADMIN_SLUG}/login`))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = `/${ADMIN_SLUG}/login`;
  };

  // Only products with prices
  const pricedProducts = useMemo(() =>
    products.filter(p => p.packPrices.length > 0 && p.price > 0),
    []
  );

  const categories = useMemo(() => {
    const cats = [...new Set(pricedProducts.map(p => p.category))];
    return ['All' as const, ...cats.sort()];
  }, [pricedProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = pricedProducts;
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.localName.toLowerCase().includes(q));
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal: number, bVal: number;
      const aBaseSell = a.packPrices[0]?.price ?? 0;
      const bBaseSell = b.packPrices[0]?.price ?? 0;
      const aBaseBuy = a.packPrices[0]?.buyPrice ?? 0;
      const bBaseBuy = b.packPrices[0]?.buyPrice ?? 0;

      switch (sortKey) {
        case 'name': return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'sellPrice': aVal = aBaseSell; bVal = bBaseSell; break;
        case 'buyPrice': aVal = aBaseBuy; bVal = bBaseBuy; break;
        case 'margin': aVal = aBaseSell - aBaseBuy; bVal = bBaseSell - bBaseBuy; break;
        case 'marginPct':
          aVal = aBaseSell > 0 ? ((aBaseSell - aBaseBuy) / aBaseSell) * 100 : 0;
          bVal = bBaseSell > 0 ? ((bBaseSell - bBaseBuy) / bBaseSell) * 100 : 0;
          break;
        default: aVal = 0; bVal = 0;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [pricedProducts, categoryFilter, search, sortKey, sortDir]);

  // Aggregates
  const stats = useMemo(() => {
    const totalSellValue = filteredProducts.reduce((sum, p) => sum + (p.packPrices[0]?.price ?? 0), 0);
    const totalCostValue = filteredProducts.reduce((sum, p) => sum + (p.packPrices[0]?.buyPrice ?? 0), 0);
    const totalMargin = totalSellValue - totalCostValue;
    const avgMarginPct = totalSellValue > 0 ? (totalMargin / totalSellValue) * 100 : 0;
    const highMargin = filteredProducts.filter(p => {
      const sell = p.packPrices[0]?.price ?? 0;
      const buy = p.packPrices[0]?.buyPrice ?? 0;
      return sell > 0 && ((sell - buy) / sell) * 100 >= 50;
    }).length;
    const lowMargin = filteredProducts.filter(p => {
      const sell = p.packPrices[0]?.price ?? 0;
      const buy = p.packPrices[0]?.buyPrice ?? 0;
      return sell > 0 && ((sell - buy) / sell) * 100 < 30;
    }).length;

    return { totalSellValue, totalCostValue, totalMargin, avgMarginPct, highMargin, lowMargin, count: filteredProducts.length };
  }, [filteredProducts]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#c9a45c]" /> : <ChevronDown className="w-3 h-3 text-[#c9a45c]" />;
  }

  function getMarginColor(pct: number) {
    if (pct >= 50) return 'text-green-600 bg-green-50';
    if (pct >= 35) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  }

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

        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-[#e8ddd0] shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push(`/${ADMIN_SLUG}`)} className="w-10 h-10 rounded-xl bg-[#faf6f0] flex items-center justify-center hover:bg-[#e8ddd0] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#6b5347]" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2d1b15]">Product Profitability</h1>
              <p className="text-sm text-[#6b5347]">Buy price, sell price & margin analysis</p>
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

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Avg Sell Price',
              value: `₹${stats.count > 0 ? Math.round(stats.totalSellValue / stats.count) : 0}`,
              sub: `${stats.count} products`,
              icon: DollarSign,
              color: 'text-blue-600', bg: 'bg-blue-50'
            },
            {
              label: 'Avg Cost Price',
              value: `₹${stats.count > 0 ? Math.round(stats.totalCostValue / stats.count) : 0}`,
              sub: 'per base pack',
              icon: TrendingDown,
              color: 'text-orange-600', bg: 'bg-orange-50'
            },
            {
              label: 'Avg Margin',
              value: `${stats.avgMarginPct.toFixed(1)}%`,
              sub: `₹${stats.count > 0 ? Math.round((stats.totalMargin) / stats.count) : 0} avg`,
              icon: TrendingUp,
              color: 'text-green-600', bg: 'bg-green-50'
            },
            {
              label: 'Margin Breakdown',
              value: `${stats.highMargin} high`,
              sub: `${stats.lowMargin} need attention`,
              icon: BarChart3,
              color: 'text-purple-600', bg: 'bg-purple-50'
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-[#e8ddd0] shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-[#6b5347] uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-[#2d1b15]">{stat.value}</p>
              <p className="text-xs text-[#6b5347] mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#e8ddd0] shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5347]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-[#e8ddd0] rounded-xl text-sm focus:outline-none focus:border-[#c9a45c] bg-white transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5347]" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as any)}
                className="appearance-none rounded-xl border-2 border-[#e8ddd0] bg-white py-2.5 pl-10 pr-11 text-sm focus:outline-none focus:border-[#c9a45c] transition-colors cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b5347]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-[#e8ddd0] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 bg-[#faf6f0] border-b border-[#e8ddd0] text-xs font-semibold text-[#6b5347] uppercase tracking-wider">
            <button className="flex items-center gap-1 hover:text-[#2d1b15] transition-colors text-left" onClick={() => toggleSort('name')}>
              Product <SortIcon col="name" />
            </button>
            <button className="flex items-center gap-1 hover:text-[#2d1b15] transition-colors" onClick={() => toggleSort('buyPrice')}>
              Buy Price <SortIcon col="buyPrice" />
            </button>
            <button className="flex items-center gap-1 hover:text-[#2d1b15] transition-colors" onClick={() => toggleSort('sellPrice')}>
              Sell Price <SortIcon col="sellPrice" />
            </button>
            <button className="flex items-center gap-1 hover:text-[#2d1b15] transition-colors" onClick={() => toggleSort('margin')}>
              Margin (₹) <SortIcon col="margin" />
            </button>
            <button className="flex items-center gap-1 hover:text-[#2d1b15] transition-colors" onClick={() => toggleSort('marginPct')}>
              Margin % <SortIcon col="marginPct" />
            </button>
            <span>Details</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#e8ddd0]">
            {filteredProducts.map(product => {
              const baseSell = product.packPrices[0]?.price ?? 0;
              const baseBuy = product.packPrices[0]?.buyPrice ?? 0;
              const margin = baseSell - baseBuy;
              const marginPct = baseSell > 0 ? (margin / baseSell) * 100 : 0;
              const isExpanded = expandedProduct === product.id;

              return (
                <div key={product.id}>
                  {/* Desktop Row */}
                  <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 items-center hover:bg-[#faf6f0]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#faf6f0] border border-[#e8ddd0] flex-shrink-0 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2d1b15] truncate">{product.name}</p>
                        <p className="text-xs text-[#6b5347]">{product.category} · {product.packPrices[0]?.size}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#6b5347]">₹{baseBuy}</p>
                    <p className="text-sm font-semibold text-[#2d1b15]">₹{baseSell}</p>
                    <p className={`text-sm font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{margin}</p>
                    <div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getMarginColor(marginPct)}`}>
                        {marginPct.toFixed(1)}%
                      </span>
                    </div>
                    <button
                      onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                      className="text-xs text-[#c9a45c] hover:text-[#8b1a1a] font-medium transition-colors"
                    >
                      {isExpanded ? 'Hide' : 'All packs'}
                    </button>
                  </div>

                  {/* Mobile Row */}
                  <div
                    className="md:hidden p-4 cursor-pointer active:bg-[#faf6f0]/50"
                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#faf6f0] border border-[#e8ddd0] flex-shrink-0 overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#2d1b15] truncate">{product.name}</p>
                          <p className="text-xs text-[#6b5347]">{product.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#2d1b15]">₹{margin}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getMarginColor(marginPct)}`}>
                            {marginPct.toFixed(1)}%
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#6b5347]" /> : <ChevronDown className="w-4 h-4 text-[#6b5347]" />}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-[#6b5347]">
                      <span>Buy: <strong className="text-[#2d1b15]">₹{baseBuy}</strong></span>
                      <span>Sell: <strong className="text-[#2d1b15]">₹{baseSell}</strong></span>
                    </div>
                  </div>

                  {/* Expanded Pack Details */}
                  {isExpanded && product.packPrices.length > 0 && (
                    <div className="bg-[#faf6f0]/60 border-t border-[#e8ddd0] px-6 py-4">
                      <p className="text-xs font-semibold text-[#6b5347] uppercase tracking-wider mb-3">All Pack Sizes</p>
                      <div className="grid gap-2">
                        {product.packPrices.map((pack, idx) => {
                          const packMargin = pack.price - pack.buyPrice;
                          const packPct = pack.price > 0 ? (packMargin / pack.price) * 100 : 0;
                          return (
                            <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-[#e8ddd0]">
                              <span className="text-sm font-medium text-[#2d1b15]">{pack.size}</span>
                              <div className="flex items-center gap-6 text-sm">
                                <span className="text-[#6b5347]">Buy: <strong>₹{pack.buyPrice}</strong></span>
                                <span className="text-[#2d1b15]">Sell: <strong>₹{pack.price}</strong></span>
                                <span className={`font-semibold ${packMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{packMargin}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getMarginColor(packPct)}`}>
                                  {packPct.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-[#6b5347]">
              <BarChart3 className="w-12 h-12 text-[#e8ddd0] mx-auto mb-4" />
              <p>No products match your filters.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#6b5347]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></span> ≥50% margin (high)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300"></span> 35–49% margin (moderate)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></span> &lt;30% margin (needs attention)</span>
        </div>
      </div>
    </div>
  );
}
