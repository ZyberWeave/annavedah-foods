import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Blog | Annavedah Foods',
  description: 'Explore insights on traditional nutrition, Ayurvedic wellness, and healthy living. Discover recipes, health tips, and the wisdom of ancient nutrition practices.',
  keywords: ['blog', 'nutrition blog', 'Ayurveda', 'traditional recipes', 'healthy living', 'wellness tips', 'ancient nutrition'],
  openGraph: {
    title: 'Ideas for Everyday Nourishment | Annavedah Foods',
    description: 'Discover traditional nutrition insights, Ayurvedic wisdom, and healthy living tips from Annavedah Foods.',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  return (
    <div className="container mx-auto px-4 pt-[120px] lg:pt-[190px] pb-16 space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Blog</p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">Ideas for everyday nourishment</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Practical recipes, routines, and principles to help you use Annavedah products with confidence.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {new Date(post.date).toLocaleDateString('en-IN')}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{post.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{post.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
