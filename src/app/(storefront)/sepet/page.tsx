import { Metadata } from 'next'
import CartClient from './cart-client'

export const metadata: Metadata = {
  title: 'Sepetim - MağazaVitrin',
  description: 'Sepetinizdeki ürünleri görüntüleyin',
}

export default function CartPage() {
  return <CartClient />
}
