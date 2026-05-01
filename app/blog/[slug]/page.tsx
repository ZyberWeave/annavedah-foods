import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { blogPosts } from '@/lib/content'

type BlogPageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const post = blogPosts.find((entry) => entry.slug === params.slug)

  if (!post) {
    return {
      title: 'Blog Post Not Found | Annavedah Foods',
    }
  }

  return {
    title: `${post.title} | Annavedah Foods Blog`,
    description: post.summary,
    keywords: ['blog', 'nutrition', 'Ayurveda', 'traditional foods', ...post.tags],
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default function BlogPostPage({ params }: BlogPageProps) {
  const post = blogPosts.find((entry) => entry.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 pt-[120px] lg:pt-[190px] pb-16 space-y-8">
      <Link href="/blog" className="text-sm font-semibold text-primary hover:text-accent transition-colors">
        Back to blog
      </Link>

      <article className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {new Date(post!.date).toLocaleDateString('en-IN')}
        </p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">{post!.title}</h1>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          {post!.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-3 py-1">{tag}</span>
          ))}
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-foreground/85">
          {post!.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
