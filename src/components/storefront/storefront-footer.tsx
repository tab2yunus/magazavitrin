'use client'

import { useRouterStore } from '@/stores/router-store'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function StorefrontFooter() {
  const { navigate, goHome } = useRouterStore()

  return (
    <footer className="mt-auto bg-[#1A2744] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Kurumsal */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">Kurumsal</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={goHome} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Hakkımızda
                </button>
              </li>
              <li>
                <button onClick={goHome} className="text-gray-300 hover:text-white text-sm transition-colors">
                  İletişim
                </button>
              </li>
              <li>
                <button onClick={goHome} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Kariyer
                </button>
              </li>
              <li>
                <button onClick={goHome} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Basın
                </button>
              </li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">Müşteri Hizmetleri</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate({ page: 'orders' })} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Sipariş Takibi
                </button>
              </li>
              <li>
                <button onClick={goHome} className="text-gray-300 hover:text-white text-sm transition-colors">
                  İade Koşulları
                </button>
              </li>
              <li>
                <button onClick={goHome} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Sıkça Sorulan Sorular
                </button>
              </li>
              <li>
                <button onClick={goHome} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Gizlilik Politikası
                </button>
              </li>
            </ul>
          </div>

          {/* Popüler Kategoriler */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">Popüler Kategoriler</h3>
            <ul className="space-y-2.5">
              {['Elektronik', 'Moda', 'Ev & Yaşam', 'Spor & Outdoor', 'Kozmetik'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => navigate({ page: 'category', slug: cat.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/g, '-').replace(/(^-|-$)/g, '') })}
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim & Sosyal Medya */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F27A1A]">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Phone className="h-4 w-4 text-[#F27A1A] shrink-0" />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Mail className="h-4 w-4 text-[#F27A1A] shrink-0" />
                <span>info@magazavitrin.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <MapPin className="h-4 w-4 text-[#F27A1A] shrink-0 mt-0.5" />
                <span>Levent, Büyükdere Cad. No:123, Şişli / İstanbul</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">Sosyal Medya</h4>
              <div className="flex gap-3">
                {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                  <button
                    key={social}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#F27A1A] flex items-center justify-center transition-colors text-xs font-bold"
                  >
                    {social[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} MağazaVitrin. Tüm hakları saklıdır.</span>
          <div className="flex gap-4">
            <button className="hover:text-white transition-colors">Kullanım Koşulları</button>
            <button className="hover:text-white transition-colors">KVKK</button>
            <button className="hover:text-white transition-colors">Çerez Politikası</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
