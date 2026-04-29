'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="container mx-auto px-4 pt-32 lg:pt-40 pb-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] md:items-start">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Contact</p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">Let's talk about your nutrition goals.</h1>
        <p className="text-lg text-muted-foreground">
          Whether you want to stock up for home, plan corporate wellness packs, or explore wholesale partnerships, we are here to help.
        </p>
        <div className="space-y-3 text-sm text-foreground/80">
          <p><span className="font-semibold text-primary">Address:</span> Maharashtra, India</p>
          <p><span className="font-semibold text-primary">Phone:</span> +91 98765 43210</p>
          <p><span className="font-semibold text-primary">Email:</span> hello@annavedah.com</p>
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Name</label>
              <input required className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Email</label>
              <input required type="email" className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Phone</label>
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Reason</label>
              <select className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none">
                <option>Product enquiry</option>
                <option>Wholesale/Corporate</option>
                <option>Feedback</option>
                <option>Partnership</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Company (optional)</label>
            <input className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Message</label>
            <textarea required rows={4} className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none" />
          </div>
          <Button type="submit" className="h-11 px-6 font-semibold w-full">Send message</Button>
          {submitted && <p className="text-sm text-accent">Thank you! We will get back within one business day.</p>}
        </form>

        <div className="rounded-3xl border border-border bg-card p-4">
          <iframe
            title="Annavedah location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.7896763426176!2d72.87765591538352!3d19.0760909570134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c63065000001%3A0xabadb7f77ec2a3f5!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="280"
            allowFullScreen
            loading="lazy"
            className="rounded-2xl border border-border"
          />
        </div>
      </div>
    </div>
  )
}
