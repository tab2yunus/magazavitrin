import { Metadata } from 'next'
import OrderSuccessClient from './order-success-client'

export const metadata: Metadata = {
  title: 'Sipariş Başarılı - MağazaVitrin',
  description: 'Siparişiniz başarıyla oluşturuldu',
}

export default function OrderSuccessPage() {
  return <OrderSuccessClient />
}
