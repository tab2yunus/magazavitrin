'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { formatPrice } from '@/lib/storefront-utils'
import { CreditCard, Truck, Banknote, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, getShippingCost, getTotal, couponDiscount, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod' as 'cod' | 'bank_transfer' | 'demo_payment',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = getSubtotal()
  const shipping = getShippingCost()
  const total = getTotal()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast({ title: 'Hata', description: 'Lütfen tüm zorunlu alanları doldurun', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.postalCode}`,
          billingAddress: `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.postalCode}`,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          discountAmount: couponDiscount,
        }),
      })

      if (res.ok) {
        const order = await res.json()
        await clearCart()
        router.push(`/siparis-basarili?orderNumber=${encodeURIComponent(order.orderNumber)}`)
      } else {
        const data = await res.json()
        toast({
          title: 'Sipariş oluşturulamadı',
          description: data.error || 'Bir hata oluştu',
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Hata', description: 'Sipariş oluşturulurken bir hata oluştu', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#0F1B2D] mb-2">Sepetiniz Boş</h2>
        <p className="text-gray-500 mb-6">Önce sepetinize ürün eklemeniz gerekiyor.</p>
        <Button onClick={() => router.push('/')} className="bg-[#F27A1A] hover:bg-[#D4630E]">
          Alışverişe Başla
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-[#0F1B2D] mb-6">Sipariş Oluştur</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-[#F27A1A]" /> Teslimat Adresi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Adınız Soyadınız"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="0532 123 45 67"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Mahalle, Sokak, Bina No, Daire No"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="İstanbul"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Posta Kodu</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      placeholder="34000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Sipariş Notu</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Siparişiniz hakkında notunuz (isteğe bağlı)"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-[#F27A1A]" /> Ödeme Yöntemi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => updateField('paymentMethod', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-[#10B981]" />
                      <div>
                        <p className="font-medium">Kapıda Ödeme</p>
                        <p className="text-xs text-gray-500">Ürün tesliminde nakit ödeme</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Havale/EFT</p>
                        <p className="text-xs text-gray-500">Banka havalesi ile ödeme</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="demo_payment" id="demo_payment" />
                    <Label htmlFor="demo_payment" className="flex-1 cursor-pointer flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#F27A1A]" />
                      <div>
                        <p className="font-medium">Demo Ödeme</p>
                        <p className="text-xs text-gray-500">Test amaçlı anında onaylı ödeme</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {items.map((item) => {
                    const product = item.product
                    if (!product) return null
                    const price = product.discountPrice || product.normalPrice
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{item.quantity}x</span>
                        <span className="flex-1 truncate">{product.name}</span>
                        <span className="font-medium shrink-0">{formatPrice(price * item.quantity)}</span>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ara Toplam</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kargo</span>
                    <span>{shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>İndirim</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span className="text-[#F27A1A]">{formatPrice(total)}</span>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-bold bg-[#F27A1A] hover:bg-[#D4630E]"
                >
                  {isSubmitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}
                </Button>

                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 pt-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Güvenli ödeme ile korunuyorsunuz</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
