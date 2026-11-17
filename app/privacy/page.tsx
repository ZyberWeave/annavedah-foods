import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Annavedah Foods',
  description: 'Privacy policy for Annavedah Foods regarding data collection and usage.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#faf6f0] min-h-screen site-page-gap pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl border border-[#e8ddd0] p-8 md:p-12 space-y-8 text-[#6b5347]">
          <h1 className="text-3xl md:text-5xl font-bold text-[#2d1b15] text-center border-b border-[#e8ddd0] pb-8">Privacy Policy</h1>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes your name, email, phone number, and address.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">2. How We Use Your Information</h2>
            <p>We use your information to process orders, communicate with you about your purchases, and improve our services. We do not sell your personal data to third parties.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">4. Cookies</h2>
            <p>We use cookies to enhance your experience on our website, such as keeping track of items in your shopping cart.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">5. Third-Party Services</h2>
            <p>We use third-party services like Razorpay for payment processing. These services have their own privacy policies regarding how they handle your data.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">6. Google Sign-In</h2>
            <p>When you sign in with Google, we receive your verified email address and basic profile information, including your name and a link to your profile photo when available. We use your email address to sign you into an existing Annavedah Foods account or create a new one. We store your name, email address, and the profile photo link with your account. If we create an account, we use your email address to link any previous guest orders placed with that address to your account.</p>
          </section>

          <div className="pt-8 border-t border-[#e8ddd0] text-center italic text-sm">
            Last updated: November 2026
          </div>
        </div>
      </div>
    </div>
  )
}
