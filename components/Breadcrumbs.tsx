'use client'

import Link from 'next/link'

export type Crumb = {
  label: string
  href?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-[#6b5347]">
        <li>
          <Link href="/" className="hover:text-[#8b1a1a] transition-colors">Home</Link>
        </li>
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              <span className="text-[#b4935b]" aria-hidden="true">/</span>
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="hover:text-[#8b1a1a] transition-colors font-medium">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'font-bold text-[#2d1b15]' : 'font-medium'}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
