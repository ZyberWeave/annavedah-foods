import 'server-only'

import productDetailsData from './product-details-data.json'

export type ProductDetails = {
  productName: string
  sourceCategory: string
  overview?: string[]
  features?: string[]
  ingredients?: string[]
  nutrition?: string[]
  uses?: string[]
  preparation?: string[]
  quality?: string[]
  speciality?: string[]
  cultivation?: string[]
  certification?: string[]
  nutritionFacts?: string[]
  storage?: string[]
}

const productDetails = productDetailsData as Record<string, ProductDetails>

export function getProductDetails(slug: string): ProductDetails | null {
  // The legacy `hirve-mung` catalogue slug points to the photographed Pivala
  // Mung pack. Use the matching editorial details so the product name and
  // copy never contradict the packet shown to customers.
  const canonicalSlug = slug === 'hirve-mung' ? 'pivala-mung' : slug
  return productDetails[canonicalSlug] ?? null
}
