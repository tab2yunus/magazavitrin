'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { Mail, Phone, MapPin } from 'lucide-react'

interface FooterSettings {
  site_name: string
  site_phone: string
  site_email: string
  site_address: string
  site_whatsapp: string
  social_instagram: string
  social_facebook: string
  social_youtube: string
  social_tiktok: string
  social_twitter: string
  social_linkedin: string
  social_pinterest: string
  legal_privacy: string
  legal_terms: string
  legal_distance_sales: string
  legal_kvkk: string
  legal_return: string
  legal_contact: string
}

interface LegalPage {
  id: string
  slug: string
  title: string
  type: string
}

export default function StorefrontFooter() {
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<Partial<FooterSettings>>({})
  const [legalPages, setLegalPages] = useState<LegalPage[]>([])

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        const map: Record<string, string> = {}
        if (d && typeof d === 'object') {
          for (const [group, items] of Object.entries(d)) {
            if (typeof items === 'object' && items !== null) {
              Object.assign(map, items as Record<string, string>)
            }
          }
        }
        setSettings(map)
      })
      .catch(() => {})

    fetch('/api/admin/legal-pages')
      .then(r => r.json())
      .then(d => setLegalPages(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const siteName = settings.site_name || 'MağazaVitrin'
  const phone = settings.site_phone || ''
  const email = settings.site_email || ''
  const address = settings.site_address || ''
  const whatsapp = settings.site_whatsapp || ''

  const socials = [
    { key: 'social_instagram', label: 'Instagram', url: settings.social_instagram, icon: 'IG' },
    { key: 'social_facebook', label: 'Facebook', url: settings.social_facebook, icon: 'FB' },
    { key: 'social_youtube', label: 'YouTube', url: settings.social_youtube, icon: 'YT' },
    { key: 'social_tiktok', label: 'TikTok', url: settings.social_tiktok, icon: 'TT' },
    { key: 'social_twitter', label: 'X', url: settings.social_twitter, icon: 'X' },
    { key: 'social_linkedin', label: 'LinkedIn', url: settings.social_linkedin, icon: 'LI' },
    { key: 'social_pinterest', label: 'Pinterest', url: settings.social_pinterest, icon: 'PI' },
  ].filter(s => s.url)

  const legalLinks = [
    { type: 'privacy', label: 'Gizlilik Politikası', slug: settings.legal_privacy },
    { type: 'terms', label: 'Kullanım Koşulları', slug: settings.legal_terms },
    { type: 'kvkk', label: 'KVKK', slug: settings.legal_kvkk },
    { type: 'distance_sales', label: 'Mesafeli Satış Sözleşmesi', slug: settings.legal_distance_sales },
    { type: 'return', label: 'İade ve Değişim', slug: settings.legal_return },
  ].filter(l => l.slug)

  return (
    <footer className="mt-auto bg-[#1A2744] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Kurumsal */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">Kurumsal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map(link => (
                <li key={link.type}>
                  <Link href={`/sayfa/${link.slug}`} className="text-gray-300 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.length === 0 && (
                <>
                  <li><Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">Hakkımızda</Link></li>
                  <li><Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">İletişim</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">Müşteri Hizmetleri</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/siparislerim" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Sipariş Takibi
                </Link>
              </li>
              <li>
                <Link href="/sayfa/iade-ve-degisim" className="text-gray-300 hover:text-white text-sm transition-colors">
                  İade Koşulları
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Popüler Kategoriler */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">Popüler Kategoriler</h3>
            <PopularCategories />
          </div>

          {/* İletişim & Sosyal Medya */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">İletişim</h3>
            <ul className="space-y-3">
              {phone && (
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <Phone className="h-4 w-4 text-[#F27A1A] shrink-0" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail className="h-4 w-4 text-[#F27A1A] shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <MapPin className="h-4 w-4 text-[#F27A1A] shrink-0 mt-0.5" />
                  <span>{address}</span>
                </li>
              )}
              {!phone && !email && !address && (
                <>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Phone className="h-4 w-4 text-[#F27A1A] shrink-0" />
                    <span>0850 123 45 67</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Mail className="h-4 w-4 text-[#F27A1A] shrink-0" />
                    <span>info@magazavitrin.com</span>
                  </li>
                </>
              )}
            </ul>
            {socials.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Sosyal Medya</h4>
                <div className="flex gap-2 flex-wrap">
                  {socials.map(social => (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#F27A1A] flex items-center justify-center transition-colors text-xs font-bold"
                      title={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {whatsapp && (
              <div className="mt-3">
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  💬 WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.</span>
          <div className="flex gap-4 items-center flex-wrap justify-center">
            {legalLinks.slice(0, 3).map(link => (
              <Link key={link.type} href={`/sayfa/${link.slug}`} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
            {user && (user.role === 'super_admin' || user.role === 'editor') && (
              <Link
                href="/admin"
                className="text-[#F27A1A] hover:text-[#FFB366] transition-colors font-semibold"
              >
                Yönetim Paneli
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

function PopularCategories() {
  const [categories, setCategories] = useState<{name: string; slug: string}[]>([])

  useEffect(() => {
    fetch('/api/categories?flat=true')
      .then(r => r.json())
      .then(d => {
        const cats = Array.isArray(d) ? d : []
        setCategories(cats.slice(0, 5).map((c: any) => ({ name: c.name, slug: c.slug })))
      })
      .catch(() => {
        setCategories([
          { name: 'Fren Sistemi', slug: 'fren-sistemi' },
          { name: 'Motor Parçaları', slug: 'motor-parcalari' },
          { name: 'Kaplama', slug: 'kaplama' },
          { name: 'Aydınlatma', slug: 'aydinlatma' },
          { name: 'Elektrik', slug: 'elektrik' },
        ])
      })
  }, [])

  return (
    <ul className="space-y-2.5">
      {categories.map(cat => (
        <li key={cat.slug}>
          <Link
            href={`/kategori/${cat.slug}`}
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
