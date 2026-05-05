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
            <li><Link href="/heritage" className="hover:text-accent transition-colors">Quality & Testing</Link></li>
            <li><Link href="/contact" className="hover:text-accent transition-colors">Wholesale Enquiries</Link></li>
          </ul>
        </div>

        <div className="space-y-2 text-sm text-background/70">
          <h4 className="text-lg font-semibold mb-3">Contact</h4>
          <p>Shivdatta Nagar, Karmvir Bhaurao Patil Rd, Shivramnagar, Pimple Gurav, Pimpri-Chinchwad, Pune, Maharashtra 411061</p>
          <a href="tel:+919763456100" className="hover:text-accent transition-colors">+91 97634 56100</a>
          <p>support@annavedah.com</p>
          <div className="flex gap-3 pt-2">
            <a href="https://www.instagram.com/annavedah.foods?igsh=Zmo5YXA0bzRlbHRm&utm_source=qr" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Instagram</a>
            <a href="https://www.facebook.com/share/1CnPV6U5Ta/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Facebook</a>
            <a href="https://share.google/7br1duJ7uIARO9cDi" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Google</a>
            <a href="https://wa.me/message/WPQ6RK3USIF2M1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline hover:text-accent">
              <svg viewBox="0 0 32 32" fill="currentColor" className="w-4 h-4"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.898 15.898 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.336 22.616c-.39 1.1-1.932 2.014-3.178 2.282-.854.18-1.968.324-5.72-1.23-4.802-1.988-7.892-6.852-8.132-7.172-.23-.32-1.938-2.58-1.938-4.922 0-2.342 1.228-3.494 1.664-3.972.436-.478.952-.598 1.268-.598.316 0 .632.004.908.016.292.014.682-.11 1.068.814.39.938 1.33 3.248 1.448 3.486.118.238.196.516.038.834-.158.318-.238.516-.476.796-.238.278-.5.622-.714.834-.238.238-.486.496-.21.974.278.478 1.232 2.032 2.646 3.292 1.818 1.62 3.35 2.124 3.828 2.362.478.238.756.198 1.034-.118.278-.318 1.192-1.388 1.51-1.864.316-.478.634-.396 1.07-.238.436.158 2.77 1.306 3.248 1.544.478.238.796.358.914.556.118.198.118 1.148-.272 2.248z"/></svg>
              WhatsApp
            </a>
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
