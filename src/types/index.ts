// TypeScript types for the marketplace application

export interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  barcode: string | null
  description: string | null
  shortDescription: string | null
  normalPrice: number
  discountPrice: number | null
  stock: number
  shippingTime: string | null
  isActive: boolean
  isFeatured: boolean
  isBestSeller: boolean
  isNew: boolean
  seoTitle: string | null
  seoDescription: string | null
  focusKeyword: string | null
  canonicalUrl: string | null
  brandId: string | null
  categoryId: string | null
  storeId: string | null
  createdAt: string
  updatedAt: string
  brand?: Brand | null
  category?: Category | null
  store?: Store | null
  images?: ProductImage[]
  variations?: ProductVariation[]
  attributes?: ProductAttribute[]
  reviews?: Review[]
}

export interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
  productId: string
}

export interface ProductVariation {
  id: string
  name: string
  value: string
  sku: string | null
  price: number | null
  stock: number
  productId: string
}

export interface ProductAttribute {
  id: string
  name: string
  value: string
  productId: string
}

export interface Store {
  id: string
  name: string
  slug: string
  logo: string | null
  coverImage: string | null
  description: string | null
  city: string | null
  category: string | null
  rating: number
  followerCount: number
  salesCount: number
  isActive: boolean
  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  createdAt: string
  updatedAt: string
  products?: Product[]
  _count?: { products: number }
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  isActive: boolean
  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  createdAt: string
  updatedAt: string
  _count?: { products: number }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  icon: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  createdAt: string
  updatedAt: string
  parent?: Category | null
  children?: Category[]
  _count?: { products: number }
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'cod' | 'bank_transfer' | 'demo_payment'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  shippingAddress: string | null
  billingAddress: string | null
  notes: string | null
  trackingNumber: string | null
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  user?: User
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variationId: string | null
  product?: Product
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  variationId: string | null
  product?: Product
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

export interface Campaign {
  id: string
  title: string
  slug: string
  description: string | null
  image: string | null
  discountText: string | null
  link: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  sortOrder: number
}

export interface Banner {
  id: string
  title: string
  image: string
  link: string | null
  position: string
  sortOrder: number
  isActive: boolean
  startDate: string | null
  endDate: string | null
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  isActive: boolean
  createdAt: string
  user?: User
}

export interface User {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'editor' | 'customer'
  phone: string | null
  avatar: string | null
  isActive: boolean
  createdAt: string
}

export interface StoreQuestion {
  id: string
  userId: string | null
  storeId: string
  question: string
  answer: string | null
  isAnswered: boolean
  isActive: boolean
  createdAt: string
  user?: User | null
}

export interface SiteSetting {
  id: string
  key: string
  value: string | null
  type: string
  group: string
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalStores: number
  totalRevenue: number
  recentOrders: Order[]
  lowStockProducts: Product[]
}
