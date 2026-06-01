// Price formatting helper
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
}

// Discount percentage calculator
export function getDiscountPercent(normalPrice: number, discountPrice: number): number {
  return Math.round(((normalPrice - discountPrice) / normalPrice) * 100)
}

// Star rating display
export function renderStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty)
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Status badge color mapping
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'preparing': return 'bg-blue-100 text-blue-800'
    case 'shipped': return 'bg-purple-100 text-purple-800'
    case 'delivered': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Status text mapping
export function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return 'Beklemede'
    case 'preparing': return 'Hazırlanıyor'
    case 'shipped': return 'Kargoda'
    case 'delivered': return 'Teslim Edildi'
    case 'cancelled': return 'İptal Edildi'
    default: return status
  }
}

// Payment method text mapping
export function getPaymentMethodText(method: string): string {
  switch (method) {
    case 'cod': return 'Kapıda Ödeme'
    case 'bank_transfer': return 'Havale/EFT'
    case 'demo_payment': return 'Demo Ödeme'
    default: return method
  }
}

// Proxy external images through our API to avoid hotlink blocks
export function proxyImageUrl(url: string): string {
  if (!url) return ''
  // Only proxy external URLs (not placehold.co which works fine)
  if (url.includes('placehold.co') || url.includes('via.placeholder.com') || url.startsWith('/')) {
    return url
  }
  // Use our image proxy for external URLs
  return `/api/image-proxy?url=${encodeURIComponent(url)}`
}
