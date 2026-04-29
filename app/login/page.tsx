import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Login | Annavedah Foods',
  description: 'Sign in to your Annavedah Foods account to access your orders, saved items, and personalized wellness recommendations.',
  keywords: ['login', 'account', 'Annavedah Foods', 'traditional nutrition', 'wellness recommendations'],
  openGraph: {
    title: 'Login to Annavedah Foods',
    description: 'Access your account for personalized traditional nutrition recommendations.',
    type: 'website',
  },
}

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-xl space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Account</p>
        <h1 className="text-4xl font-bold text-primary">Login</h1>
        <p className="text-muted-foreground">Access your orders, saved items, and wellness recommendations.</p>
      </div>

      <form className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Email</label>
          <input required type="email" className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Password</label>
          <input required type="password" className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="h-4 w-4" /> Remember me
          </label>
          <Link href="#" className="text-primary font-semibold hover:text-accent">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full h-12 font-semibold">Sign in</Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New here? <Link href="/contact" className="text-primary font-semibold hover:text-accent">Talk to us</Link>
      </p>
    </div>
  )
}
