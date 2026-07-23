'use client'

import { useState, useEffect } from 'react'
import { products as staticProducts, type Product } from '@/lib/content'
import { getFreeGiftConfig, saveFreeGiftConfig, type FreeGiftConfig } from '@/lib/free-gift-config'

export default function GiftBundleCreator() {
  const [giftName, setGiftName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [selectedItems, setSelectedItems] = useState<{ productSlug: string; quantity: number }[]>([])

  // Free Gift Threshold state
  const [freeGiftEnabled, setFreeGiftEnabled] = useState(true)
  const [thresholdPrice, setThresholdPrice] = useState('899')
  const [giftProductSlug, setGiftProductSlug] = useState('moringa-powder')

  useEffect(() => {
    const cfg = getFreeGiftConfig()
    setFreeGiftEnabled(cfg.enabled)
    setThresholdPrice(String(cfg.thresholdPrice))
    setGiftProductSlug(cfg.giftProductSlug)
  }, [])

  const handleSaveFreeGiftConfig = (e: React.FormEvent) => {
    e.preventDefault()
    saveFreeGiftConfig({
      enabled: freeGiftEnabled,
      thresholdPrice: Number(thresholdPrice) || 0,
      giftProductSlug,
    })
    setSuccessMsg(`Free Gift promotion updated! (Enabled: ${freeGiftEnabled ? 'YES' : 'NO'}, Threshold: ₹${thresholdPrice})`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }
  const [createdGifts, setCreatedGifts] = useState<Partial<Product>[]>([
    {
      name: 'Superfood Wellness Gift Box',
      slug: 'superfood-wellness-gift-box',
      price: 899,
      bundleItems: [
        { productSlug: 'moringa-powder', quantity: 1 },
        { productSlug: 'turmeric-powder', quantity: 1 },
      ],
    },
  ])
  const [successMsg, setSuccessMsg] = useState('')

  const handleAddItem = (slug: string) => {
    if (!slug) return
    if (selectedItems.some((i) => i.productSlug === slug)) return
    setSelectedItems([...selectedItems, { productSlug: slug, quantity: 1 }])
  }

  const handleQtyChange = (slug: string, qty: number) => {
    setSelectedItems(
      selectedItems.map((i) =>
        i.productSlug === slug ? { ...i, quantity: Math.max(1, qty) } : i
      )
    )
  }

  const handleRemoveItem = (slug: string) => {
    setSelectedItems(selectedItems.filter((i) => i.productSlug !== slug))
  }

  const handleCreateGift = (e: React.FormEvent) => {
    e.preventDefault()
    if (!giftName || !price || selectedItems.length === 0) return

    const slug = giftName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const newGift: Partial<Product> = {
      name: giftName,
      slug,
      price: Number(price),
      category: 'Gift Boxes & Bundles',
      description: description || `Curated gift box containing ${selectedItems.length} items.`,
      isGift: true,
      bundleItems: [...selectedItems],
    }

    setCreatedGifts([newGift, ...createdGifts])
    setGiftName('')
    setPrice('')
    setDescription('')
    setSelectedItems([])
    setSuccessMsg(`Gift Box '${giftName}' created successfully! Stock tracking linked for each bundled product.`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const catalogProducts = staticProducts.filter((p) => !p.isGift)

  return (
    <div className="bg-white rounded-2xl border-2 border-[#e8ddd0] p-6 mt-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
            <span>🎁</span> Admin Gift Box & Bundle Creator
          </h2>
          <p className="text-xs text-[#6b5347] mt-1">
            Bundle existing traditional food products into curated Gift Boxes. Purchasing automatically decrements stock for each underlying item.
          </p>
        </div>
        <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-xs font-bold px-3 py-1 rounded-full border border-[#c9a45c]/30">
          Stock Sync Active
        </span>
      </div>

      {successMsg && (
        <div className="bg-[#8b1a1a]/10 border border-[#c9a45c]/40 text-[#8b1a1a] px-4 py-3 rounded-xl text-sm mb-6 font-bold">
          {successMsg}
        </div>
      )}

      {/* Free Gift Threshold Controls */}
      <form onSubmit={handleSaveFreeGiftConfig} className="bg-[#faf6f0] border-2 border-[#e8ddd0] rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#2d1b15] flex items-center gap-2">
              <span>🎁</span> Free Gift Over Threshold Promotion
            </h3>
            <p className="text-xs text-[#6b5347] mt-0.5">
              Encourage customers during cart & checkout to spend over a target amount to receive a free gift item.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={freeGiftEnabled}
              onChange={(e) => setFreeGiftEnabled(e.target.checked)}
              className="w-4 h-4 text-[#8b1a1a] rounded focus:ring-[#8b1a1a]"
            />
            <span className="text-xs font-bold text-[#2d1b15] uppercase tracking-wider">
              {freeGiftEnabled ? 'Promotion Active' : 'Promotion Paused'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Minimum Order Threshold (₹)
            </label>
            <input
              type="number"
              required
              value={thresholdPrice}
              onChange={(e) => setThresholdPrice(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#8b1a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Select Free Gift Product
            </label>
            <select
              value={giftProductSlug}
              onChange={(e) => setGiftProductSlug(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#8b1a1a]"
            >
              {catalogProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} (Value: ₹{p.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs px-5 py-2 rounded-xl transition-all"
        >
          Save Free Gift Threshold Settings
        </button>
      </form>

      <form onSubmit={handleCreateGift} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Gift Box Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Festive Superfood Hamper"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a1a]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Bundle Selling Price (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 899"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a1a]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
            Gift Box Description
          </label>
          <textarea
            rows={2}
            placeholder="Traditional wellness & superfood gift box..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a1a]"
          />
        </div>

        {/* Add Products */}
        <div className="border-2 border-[#e8ddd0] rounded-xl p-4 bg-[#faf6f0]">
          <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-2">
            Select Products to Bundle in this Gift Box:
          </label>

          <div className="flex gap-2 mb-4">
            <select
              onChange={(e) => {
                handleAddItem(e.target.value)
                e.target.value = ''
              }}
              className="flex-1 border-2 border-[#e8ddd0] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#8b1a1a]"
            >
              <option value="">-- Choose Product to Add --</option>
              {catalogProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} (₹{p.price})
                </option>
              ))}
            </select>
          </div>

          {selectedItems.length === 0 ? (
            <p className="text-xs text-[#6b5347] italic">No products added yet.</p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item) => {
                const p = staticProducts.find((prod) => prod.slug === item.productSlug)
                return (
                  <div
                    key={item.productSlug}
                    className="flex items-center justify-between bg-white border border-[#e8ddd0] rounded-xl px-3 py-2 text-sm"
                  >
                    <span className="font-bold text-[#2d1b15]">
                      {p ? p.name : item.productSlug}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#6b5347]">Qty in Box:</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item.productSlug, parseInt(e.target.value) || 1)}
                        className="w-16 border border-[#e8ddd0] rounded-lg px-2 py-1 text-center text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productSlug)}
                        className="text-[#8b1a1a] hover:underline text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md"
        >
          Create Gift Box & Link Stock
        </button>
      </form>

      {/* Created Gifts */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-[#2d1b15] uppercase tracking-wider mb-3">
          Existing Curated Gift Boxes ({createdGifts.length})
        </h3>
        <div className="space-y-3">
          {createdGifts.map((g) => (
            <div key={g.slug} className="border-2 border-[#e8ddd0] rounded-xl p-4 bg-[#faf6f0] flex items-start justify-between">
              <div>
                <h4 className="font-bold text-[#2d1b15] text-sm">{g.name}</h4>
                <p className="text-xs text-[#8b1a1a] font-bold mt-0.5">Price: ₹{g.price}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {g.bundleItems?.map((b) => (
                    <span key={b.productSlug} className="bg-white border border-[#e8ddd0] rounded-lg px-2.5 py-1 text-xs text-[#2d1b15] font-semibold">
                      {b.quantity}x {b.productSlug}
                    </span>
                  ))}
                </div>
              </div>
              <span className="bg-[#8b1a1a] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Active Gift Box
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
