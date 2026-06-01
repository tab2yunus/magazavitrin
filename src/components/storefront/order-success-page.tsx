'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface OrderSuccessPageProps {
  orderNumber: string
}

export default function OrderSuccessPage({ orderNumber }: OrderSuccessPageProps) {
  const router = useRouter()

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Card className="text-center">
        <CardContent className="p-8">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-[#3CB371]" />
          </div>

          <h1 className="text-2xl font-bold text-[#1A2744] mb-2">Siparişiniz Alındı!</h1>
          <p className="text-gray-500 mb-6">
            Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanacak.
          </p>

          {/* Order number */}
          <div className="bg-[#FFF3E8] rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Sipariş Numaranız</p>
            <p className="text-xl font-bold text-[#F27A1A] mt-1">#{orderNumber}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/siparislerim')}
              className="w-full h-11 bg-[#F27A1A] hover:bg-[#D4630E] text-white font-semibold"
            >
              <Package className="h-4 w-4 mr-2" /> Siparişlerim
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full h-11 font-semibold"
              >
                Alışverişe Devam Et <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
