'use client'

import Link from 'next/link'
import { useBrand } from '@/lib/brand-context'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'

interface BreadcrumbItemData {
  name: string
  href?: string
}

interface StorefrontBreadcrumbProps {
  items: BreadcrumbItemData[]
}

/**
 * Reusable breadcrumb component for storefront pages.
 * - Renders a breadcrumb trail with chevron separators
 * - Last item is the current page (not a link)
 * - Includes BreadcrumbList JSON-LD structured data
 * - Always starts with "Ana Sayfa" (Home)
 * - Uses dynamic brand theme colors
 *
 * Example: Ana Sayfa > Motolux > Yaris > Ön Fren Diski
 */
export default function StorefrontBreadcrumb({ items }: StorefrontBreadcrumbProps) {
  const { theme } = useBrand()

  // Build the full breadcrumb items including Home
  const allItems: BreadcrumbItemData[] = [
    { name: 'Ana Sayfa', href: '/' },
    ...items,
  ]

  // Build JSON-LD schema
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const schemaItems = allItems.map((item, index) => ({
    name: item.name,
    url: item.href ? `${siteUrl}${item.href}` : '',
  }))

  // Only generate schema if we have valid URLs
  const hasValidUrls = schemaItems.every((item) => item.url)
  const jsonLd = hasValidUrls
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: schemaItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumb className="mb-4">
        <BreadcrumbList className="text-xs text-[var(--color-text-muted)]">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1

            return (
              <span key={index} className="contents">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-xs text-[var(--color-text)] font-medium">
                      {item.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                      <Link href={item.href || '/'}>
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            <span className="hidden sm:inline">{item.name}</span>
                          </span>
                        ) : (
                          item.name
                        )}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator className="text-[var(--color-text-muted)]" />
                )}
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}
