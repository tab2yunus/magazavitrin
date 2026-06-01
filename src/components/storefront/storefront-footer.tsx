'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  Award,
  RefreshCcw,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react'

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
          for (const [, items] of Object.entries(d)) {
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

  const socialLinks = [
    { key: 'social_instagram', label: 'Instagram', url: settings.social_instagram, Icon: Instagram },
    { key: 'social_facebook', label: 'Facebook', url: settings.social_facebook, Icon: Facebook },
    { key: 'social_youtube', label: 'YouTube', url: settings.social_youtube, Icon: Youtube },
    { key: 'social_twitter', label: 'X', url: settings.social_twitter, Icon: Twitter },
    { key: 'social_linkedin', label: 'LinkedIn', url: settings.social_linkedin, Icon: Linkedin },
  ].filter(s => s.url)

  const legalLinks = [
    { type: 'privacy', label: 'Gizlilik Politikası', slug: settings.legal_privacy },
    { type: 'terms', label: 'Kullanım Koşulları', slug: settings.legal_terms },
    { type: 'kvkk', label: 'KVKK', slug: settings.legal_kvkk },
    { type: 'distance_sales', label: 'Mesafeli Satış Sözleşmesi', slug: settings.legal_distance_sales },
    { type: 'return', label: 'İade ve Değişim', slug: settings.legal_return },
  ].filter(l => l.slug)

  const trustItems = [
    { icon: ShieldCheck, label: 'Güvenli Ödeme', desc: '256-bit SSL' },
    { icon: Truck, label: 'Hızlı Kargo', desc: 'Aynı gün gönderim' },
    { icon: Award, label: 'Orijinal Parça', desc: 'Garantili ürünler' },
    { icon: RefreshCcw, label: 'Kolay İade', desc: '14 gün içinde' },
  ]

  return (
    <footer className="mt-auto">
      {/* Trust Band Strip */}
      <div className="bg-gradient-to-r from-[#0F1B2D] to-[#1B2D45] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F27A1A]/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#F27A1A]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-[#8C95A6] text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-gradient-to-b from-[#0F1B2D] to-[#0A1320]">
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Brand Description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <span className="text-2xl font-extrabold">
                  <span className="text-[#F27A1A]">Mağaza</span>
                  <span className="text-white">Vitrin</span>
                </span>
              </Link>
              <p className="text-[#8C95A6] text-sm leading-relaxed mb-5">
                Türkiye&apos;nin en büyük motosiklet yedek parça pazaryeri. Orijinal ve kaliteli
                motosiklet parçalarını en uygun fiyatlarla sizlere sunuyoruz. Tüm marka ve
                modeller için güvenilir alışveriş deneyimi.
              </p>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Destek
                </a>
              )}
            </div>

            {/* Column 2: Kurumsal */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[#F27A1A] rounded-full" />
                Kurumsal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/sayfa/hakkimizda" className="text-[#8C95A6] hover:text-white text-sm transition-colors duration-200 hover:pl-1">
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link href="/sayfa/kariyer" className="text-[#8C95A6] hover:text-white text-sm transition-colors duration-200 hover:pl-1">
                    Kariyer
                  </Link>
                </li>
                <li>
                  <Link href="/sayfa/basin" className="text-[#8C95A6] hover:text-white text-sm transition-colors duration-200 hover:pl-1">
                    Basın
                  </Link>
                </li>
                <li>
                  <Link href="/sayfa/iletisim" className="text-[#8C95A6] hover:text-white text-sm transition-colors duration-200 hover:pl-1">
                    İletişim
                  </Link>
                </li>
                {legalLinks.map(link => (
                  <li key={link.type}>
                    <Link href={`/sayfa/${link.slug}`} className="text-[#8C95A6] hover:text-white text-sm transition-colors duration-200 hover:pl-1">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Popüler Kategoriler */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[#F27A1A] rounded-full" />
                Popüler Kategoriler
              </h3>
              <PopularCategories />
            </div>

            {/* Column 4: İletişim & Sosyal Medya */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[#F27A1A] rounded-full" />
                İletişim
              </h3>
              <ul className="space-y-3 mb-5">
                {phone ? (
                  <li>
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 text-[#8C95A6] hover:text-white text-sm transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#1B2D45] group-hover:bg-[#F27A1A]/20 flex items-center justify-center shrink-0 transition-colors">
                        <Phone className="h-4 w-4 text-[#F27A1A]" />
                      </span>
                      <span>{phone}</span>
                    </a>
                  </li>
                ) : (
                  <li>
                    <div className="flex items-center gap-3 text-[#8C95A6] text-sm">
                      <span className="w-8 h-8 rounded-lg bg-[#1B2D45] flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4 text-[#F27A1A]" />
                      </span>
                      <span>0850 123 45 67</span>
                    </div>
                  </li>
                )}
                {email ? (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 text-[#8C95A6] hover:text-white text-sm transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#1B2D45] group-hover:bg-[#F27A1A]/20 flex items-center justify-center shrink-0 transition-colors">
                        <Mail className="h-4 w-4 text-[#F27A1A]" />
                      </span>
                      <span>{email}</span>
                    </a>
                  </li>
                ) : (
                  <li>
                    <div className="flex items-center gap-3 text-[#8C95A6] text-sm">
                      <span className="w-8 h-8 rounded-lg bg-[#1B2D45] flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-[#F27A1A]" />
                      </span>
                      <span>info@magazavitrin.com</span>
                    </div>
                  </li>
                )}
                {address && (
                  <li>
                    <div className="flex items-start gap-3 text-[#8C95A6] text-sm">
                      <span className="w-8 h-8 rounded-lg bg-[#1B2D45] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-[#F27A1A]" />
                      </span>
                      <span className="leading-relaxed">{address}</span>
                    </div>
                  </li>
                )}
              </ul>

              {/* Social Media Icons */}
              {socialLinks.length > 0 && (
                <div>
                  <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
                    Sosyal Medya
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {socialLinks.map(social => (
                      <a
                        key={social.key}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#1B2D45] hover:bg-[#F27A1A] flex items-center justify-center transition-all duration-200 hover:scale-110"
                        title={social.label}
                      >
                        <social.Icon className="w-4 h-4 text-[#8C95A6] group-hover:text-white" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#080E18] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#8C95A6] text-xs">
              © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {legalLinks.slice(0, 3).map((link, index) => (
                <span key={link.type} className="flex items-center gap-3">
                  {index > 0 && <span className="text-[#4A5568] text-xs">|</span>}
                  <Link href={`/sayfa/${link.slug}`} className="text-[#8C95A6] hover:text-white text-xs transition-colors">
                    {link.label}
                  </Link>
                </span>
              ))}
              {user && (user.role === 'super_admin' || user.role === 'editor') && (
                <>
                  <span className="text-[#4A5568] text-xs">|</span>
                  <Link
                    href="/admin"
                    className="text-[#F27A1A] hover:text-[#FFB366] text-xs font-semibold transition-colors"
                  >
                    Yönetim Paneli
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function PopularCategories() {
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])

  useEffect(() => {
    fetch('/api/categories?flat=true')
      .then(r => r.json())
      .then(d => {
        const cats = Array.isArray(d) ? d : []
        setCategories(cats.slice(0, 7).map((c: any) => ({ name: c.name, slug: c.slug })))
      })
      .catch(() => {
        setCategories([
          { name: 'Fren Sistemi', slug: 'fren-sistemi' },
          { name: 'Motor Parçaları', slug: 'motor-parcalari' },
          { name: 'Kaplama', slug: 'kaplama' },
          { name: 'Aydınlatma', slug: 'aydinlatma' },
          { name: 'Elektrik', slug: 'elektrik' },
          { name: 'Egzoz Sistemi', slug: 'egzoz-sistemi' },
          { name: 'Süspansiyon', slug: 'suspansiyon' },
        ])
      })
  }, [])

  return (
    <ul className="space-y-3">
      {categories.map(cat => (
        <li key={cat.slug}>
          <Link
            href={`/kategori/${cat.slug}`}
            className="text-[#8C95A6] hover:text-white text-sm transition-colors duration-200 hover:pl-1"
          >
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
