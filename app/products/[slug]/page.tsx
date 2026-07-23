import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/products'
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

  return {
    title: `${product.name} | Annavedah Foods`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
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
      description: product.description,
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

  return <ProductDetailClient product={product} />
}
