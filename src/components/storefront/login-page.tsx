'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: 'Hata', description: 'Lütfen tüm alanları doldurun', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast({ title: 'Hoş geldiniz!', description: 'Başarıyla giriş yaptınız' })
        router.push('/hesabim')
      } else {
        toast({ title: 'Giriş başarısız', description: 'E-posta veya şifre hatalı', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Hata', description: 'Giriş yapılırken bir hata oluştu', variant: 'destructive' })
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
              <span className="text-[#F27A1A]">Mağaza</span>
              <span className="text-[#1A2744]">Vitrin</span>
            </Link>
          </div>
          <CardTitle className="text-xl">Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Şifreniz"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#F27A1A] hover:bg-[#D4630E] text-white font-semibold"
            >
              {isLoading ? 'Giriş yapılıyor...' : (
                <>
                  <LogIn className="h-4 w-4 mr-2" /> Giriş Yap
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Hesabınız yok mu?{' '}
              <Link
                href="/kayit"
                className="text-[#F27A1A] font-semibold hover:underline"
              >
                Kayıt olun
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-semibold mb-1">Demo Giriş Bilgileri:</p>
            <p>Admin: admin@magazavitrin.com / password123</p>
            <p>Müşteri: musteri1@test.com / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
