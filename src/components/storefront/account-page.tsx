'use client'

import { useEffect } from 'react'
import { useRouterStore } from '@/stores/router-store'
import { useAuthStore } from '@/stores/auth-store'
import { User, Package, Heart, BarChart3, Settings, LogOut, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountPage() {
  const { navigate } = useRouterStore()
  const { user, fetchUser, logout, isLoading } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ page: 'login' })
    }
  }, [isLoading, user, navigate])

  async function handleLogout() {
    await logout()
    navigate({ page: 'home' })
  }

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const quickLinks = [
    { icon: Package, label: 'Siparişlerim', page: 'orders' as const, color: 'text-blue-600 bg-blue-50' },
    { icon: Heart, label: 'Favorilerim', page: 'favorites' as const, color: 'text-red-600 bg-red-50' },
    { icon: BarChart3, label: 'Karşılaştırmalarım', page: 'comparisons' as const, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* User info card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#F27A1A] text-white text-xl font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#1A2744]">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-1">
                <Badge variant="outline" className={user.role === 'super_admin' || user.role === 'editor' ? 'text-[#F27A1A] border-[#F27A1A]' : 'text-gray-500'}>
                  {user.role === 'super_admin' ? 'Yönetici' : user.role === 'editor' ? 'Editör' : 'Müşteri'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" /> Çıkış
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {quickLinks.map((link) => (
          <Card
            key={link.page}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate({ page: link.page })}
          >
            <CardContent className="p-5 text-center">
              <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center mx-auto mb-3`}>
                <link.icon className="h-6 w-6" />
              </div>
              <p className="font-medium text-sm text-[#1A2744]">{link.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin link */}
      {(user.role === 'super_admin' || user.role === 'editor') && (
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow mb-6 border-[#F27A1A]/30"
          onClick={() => navigate({ page: 'admin' })}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF3E8] text-[#F27A1A] flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[#1A2744]">Yönetim Paneli</p>
              <p className="text-xs text-gray-500">Ürün, sipariş ve site yönetimi</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account details */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#1A2744] mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" /> Hesap Bilgileri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Ad Soyad</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500">E-posta</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Telefon</p>
              <p className="font-medium">{user.phone || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-gray-500">Kayıt Tarihi</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
