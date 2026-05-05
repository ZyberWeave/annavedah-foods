import type { Metadata } from 'next'
import HeritageContent from '@/components/HeritageContent'

export const metadata: Metadata = {
  title: 'Our Heritage | Annavedah Foods',
  description: 'Discover the ancient wisdom and traditional knowledge behind Annavedah Foods. Learn about our commitment to authentic Ayurvedic nutrition and sustainable practices.',
  keywords: ['heritage', 'Ayurveda', 'traditional wisdom', 'ancient nutrition', 'sustainable practices', 'Annavedah story'],
  openGraph: {
    title: 'Wisdom of Generations | Annavedah Foods',
    description: 'Drawing from centuries of Ayurvedic knowledge, our blends preserve the authentic formulations passed down through generations.',
    type: 'website',
  },
}

export default function HeritagePage() {
  return <HeritageContent />
}
