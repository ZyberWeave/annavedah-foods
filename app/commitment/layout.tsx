import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Donation Commitment | Annavedah Foods',
  description: 'A part of every sale made through Annavedah Foods carries a purpose beyond business to support sheltered animals and pet care centers.',
  keywords: ['donation', 'animal welfare', 'compassion', 'pet care', 'shelter support', 'Annavedah commitment'],
  openGraph: {
    title: 'Our Donation Commitment | Annavedah Foods',
    description: 'Because compassion should never be limited. Every purchase supports sheltered animals across India.',
    type: 'website',
  },
}

export default function CommitmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
