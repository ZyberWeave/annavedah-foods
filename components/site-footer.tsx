import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background py-12 mt-16">
      <div className="container mx-auto px-4 grid grid-cols-1 gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-xl font-bold">Annavedah Foods</h3>
          <p className="text-sm text-background/70">
            Traditional nutrition crafted with modern science. Pure powders, heritage grains, and functional blends for daily wellness.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href="/products" className="hover:text-accent transition-colors">Products</Link></li>
            <li><Link href="/heritage" className="hover:text-accent transition-colors">Heritage</Link></li>
            <li><Link href="/benefits" className="hover:text-accent transition-colors">Benefits</Link></li>
            <li><Link href="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href="/shipping" className="hover:text-accent transition-colors">Shipping Policy</Link></li>
            <li><Link href="/returns" className="hover:text-accent transition-colors">Returns & Refunds</Link></li>
            <li>Quality & Testing</li>
            <li>Wholesale Enquiries</li>
          </ul>
        </div>

        <div className="space-y-2 text-sm text-background/70">
          <h4 className="text-lg font-semibold mb-3">Contact</h4>
          <p>Maharashtra, India</p>
          <a href="tel:+919763456100" className="hover:text-accent transition-colors">+91 97634 56100</a>
          <p>hello@annavedah.com</p>
          <div className="flex gap-3 pt-2">
            <a href="https://www.instagram.com/annavedah.foods?igsh=Zmo5YXA0bzRlbHRm&utm_source=qr" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Instagram</a>
            <a href="https://www.facebook.com/share/1CnPV6U5Ta/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Facebook</a>
            <a href="https://share.google/7br1duJ7uIARO9cDi" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Google</a>
            <a href="https://wa.me/message/WPQ6RK3USIF2M1" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-background/20 pt-6 text-center text-sm text-background/60">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Link href="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-background transition-colors">Terms & Conditions</Link>
          <Link href="/shipping" className="hover:text-background transition-colors">Shipping Policy</Link>
          <Link href="/returns" className="hover:text-background transition-colors">Cancellation & Refund Policy</Link>
        </div>
        (c) 2026 Annavedah Foods. Designed and created by Zyberweave.
      </div>
    </footer>
  )
}
