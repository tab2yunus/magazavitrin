'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LegalPageClientProps {
  title: string
  content: string
}

export default function LegalPageClient({ title, content }: LegalPageClientProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Ana Sayfa
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[#1A2744] mb-8">{title}</h1>

      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-gray-500">Bu sayfa henüz düzenlenmemiştir.</p>
        )}
      </div>
    </div>
  )
}
