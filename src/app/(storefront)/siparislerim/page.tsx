import { Metadata } from 'next'
import OrdersClient from './orders-client'

export const metadata: Metadata = {
  title: 'Siparişlerim - MağazaVitrin',
  description: 'Siparişlerinizi takip edin',
}

export default function OrdersPage() {
  return <OrdersClient />
}
