import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/products'
import { getProductDetails } from '@/lib/product-details'
import ProductDetailClient from '@/components/ProductDetailClient'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params
  const products = await getProducts()
  const product = products.find((item) => item.slug === params.slug)

  if (!product) {
    return { title: 'Product Not Found - Annavedah Foods' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://annavedahfoods.com'
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`
  const pageUrl = `${baseUrl}/products/${product.slug}`
  const detailedDescription = getProductDetails(product.slug)?.overview?.join(' ') || product.description
  const metadataDescription = detailedDescription.length > 200
    ? `${detailedDescription.slice(0, 197).trimEnd()}...`
    : detailedDescription

  return {
    title: `${product.name} | Annavedah Foods`,
    description: metadataDescription,
    openGraph: {
      title: product.name,
      description: metadataDescription,
      url: pageUrl,
      siteName: 'Annavedah Foods',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: metadataDescription,
      images: [imageUrl],
    },
  }
}

export default async function ProductDetailPage(props: ProductPageProps) {
  const params = await props.params
  const products = await getProducts()
  const product = products.find((item) => item.slug === params.slug)

  if (!product) {
    notFound()
  }

  const details = getProductDetails(product.slug)

  return <ProductDetailClient product={product} details={details} />
}
