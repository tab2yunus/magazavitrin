'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { useBrand } from '@/lib/brand-context'
import { Mail, Lock, UserPlus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuthStore()
  const { theme } = useBrand()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast({ title: 'Hata', description: 'Lütfen tüm alanları doldurun', variant: 'destructive' })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: 'Hata', description: 'Şifreler eşleşmiyor', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'Hata', description: 'Şifre en az 6 karakter olmalıdır', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const success = await register(name, email, password)
      if (success) {
        toast({ title: 'Hoş geldiniz!', description: 'Hesabınız oluşturuldu' })
        router.push('/hesabim')
      } else {
        toast({ title: 'Kayıt başarısız', description: 'Bu e-posta adresi zaten kayıtlı olabilir', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Hata', description: 'Kayıt olurken bir hata oluştu', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Link href="/" className="text-3xl font-extrabold">
              <span className="text-[var(--color-primary)]">{theme.brandName}</span>
            </Link>
          </div>
          <CardTitle className="text-xl">Kayıt Ol</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold"
            >
              {isLoading ? 'Kayıt olunuyor...' : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" /> Kayıt Ol
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Zaten hesabınız var mı?{' '}
              <Link
                href="/giris"
                className="text-[var(--color-primary)] font-semibold hover:underline"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
