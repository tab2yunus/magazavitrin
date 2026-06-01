import { Metadata } from 'next'
import OrderDetailClient from './order-detail-client'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Sipariş #${id} - MağazaVitrin`,
    description: 'Sipariş detayları',
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  return <OrderDetailClient id={id} />
}
