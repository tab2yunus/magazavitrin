'use client'

import OrderDetailPage from '@/components/storefront/order-detail-page'

interface OrderDetailClientProps {
  id: string
}

export default function OrderDetailClient({ id }: OrderDetailClientProps) {
  return <OrderDetailPage id={id} />
}
