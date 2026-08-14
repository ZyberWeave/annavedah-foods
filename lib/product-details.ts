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
  return productDetails[slug] ?? null
}
