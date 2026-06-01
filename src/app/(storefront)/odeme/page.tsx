import { Metadata } from 'next'
import CheckoutClient from './checkout-client'

export const metadata: Metadata = {
  title: 'Sipariş Oluştur - MağazaVitrin',
  description: 'Siparişinizi tamamlayın',
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
