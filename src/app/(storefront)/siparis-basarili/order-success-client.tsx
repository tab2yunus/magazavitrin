'use client'

import { useSearchParams } from 'next/navigation'
import OrderSuccessPage from '@/components/storefront/order-success-page'

export default function OrderSuccessClient() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') || ''
  return <OrderSuccessPage orderNumber={orderNumber} />
}
