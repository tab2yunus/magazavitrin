import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/settings/seed-brand - Initialize brand identity and theme settings
export async function POST() {
  try {
    const brandSettings = [
      // Brand Identity group
      { key: 'brand_name', value: 'MağazaVitrin', type: 'text', group: 'brand_identity', label: 'Marka Adı' },
      { key: 'brand_short_name', value: 'MV', type: 'text', group: 'brand_identity', label: 'Kısa Marka Adı' },
      { key: 'brand_slogan', value: "Türkiye'nin Motosiklet Yedek Parça Pazaryeri", type: 'text', group: 'brand_identity', label: 'Marka Sloganı' },
      { key: 'brand_description', value: "Türkiye'nin en büyük motosiklet yedek parça pazaryeri. Orijinal ve kaliteli motosiklet parçalarını en uygun fiyatlarla sizlere sunuyoruz.", type: 'textarea', group: 'brand_identity', label: 'Marka Açıklaması' },
      { key: 'brand_logo', value: '', type: 'image', group: 'brand_identity', label: 'Logo' },
      { key: 'brand_logo_dark', value: '', type: 'image', group: 'brand_identity', label: 'Koyu Tema Logo' },
      { key: 'brand_mobile_logo', value: '', type: 'image', group: 'brand_identity', label: 'Mobil Logo' },
      { key: 'brand_footer_logo', value: '', type: 'image', group: 'brand_identity', label: 'Footer Logo' },
      { key: 'brand_favicon', value: '/logo.svg', type: 'image', group: 'brand_identity', label: 'Favicon' },
      { key: 'default_product_image', value: '', type: 'image', group: 'brand_identity', label: 'Varsayılan Ürün Görseli' },
      { key: 'default_category_image', value: '', type: 'image', group: 'brand_identity', label: 'Varsayılan Kategori Görseli' },
      { key: 'default_store_image', value: '', type: 'image', group: 'brand_identity', label: 'Varsayılan Mağaza Görseli' },

      // Theme Colors group (Classic defaults)
      { key: 'theme_preset', value: 'classic', type: 'text', group: 'theme', label: 'Tema Seçimi' },
      { key: 'theme_name', value: 'classic', type: 'text', group: 'theme', label: 'Tema Adı' },
      { key: 'theme_color_primary', value: '#F27A1A', type: 'color', group: 'theme', label: 'Ana Renk' },
      { key: 'theme_color_primary_dark', value: '#D4630E', type: 'color', group: 'theme', label: 'Ana Renk (Koyu)' },
      { key: 'theme_color_primary_light', value: '#FFF3E8', type: 'color', group: 'theme', label: 'Ana Renk (Açık)' },
      { key: 'theme_color_secondary', value: '#0F1B2D', type: 'color', group: 'theme', label: 'İkincil Renk' },
      { key: 'theme_color_secondary_light', value: '#1B2D45', type: 'color', group: 'theme', label: 'İkincil Renk (Açık)' },
      { key: 'theme_color_accent', value: '#FF8C38', type: 'color', group: 'theme', label: 'Vurgu Rengi' },
      { key: 'theme_color_background', value: '#FFFFFF', type: 'color', group: 'theme', label: 'Arka Plan Rengi' },
      { key: 'theme_color_surface', value: '#F4F5F7', type: 'color', group: 'theme', label: 'Yüzey Rengi' },
      { key: 'theme_color_card', value: '#FFFFFF', type: 'color', group: 'theme', label: 'Kart Rengi' },
      { key: 'theme_color_text', value: '#0F1B2D', type: 'color', group: 'theme', label: 'Yazı Rengi' },
      { key: 'theme_color_text_secondary', value: '#4A5568', type: 'color', group: 'theme', label: 'İkincil Yazı Rengi' },
      { key: 'theme_color_text_muted', value: '#8C95A6', type: 'color', group: 'theme', label: 'Soluk Yazı Rengi' },
      { key: 'theme_color_border', value: '#E2E5EA', type: 'color', group: 'theme', label: 'Border Rengi' },
      { key: 'theme_color_success', value: '#10B981', type: 'color', group: 'theme', label: 'Başarı Rengi' },
      { key: 'theme_color_warning', value: '#F59E0B', type: 'color', group: 'theme', label: 'Uyarı Rengi' },
      { key: 'theme_color_danger', value: '#EF4444', type: 'color', group: 'theme', label: 'Hata Rengi' },
      { key: 'theme_color_info', value: '#3B82F6', type: 'color', group: 'theme', label: 'Bilgi Rengi' },
    ]

    let created = 0
    let skipped = 0

    for (const setting of brandSettings) {
      const existing = await db.siteSetting.findUnique({ where: { key: setting.key } })
      if (!existing) {
        await db.siteSetting.create({ data: setting })
        created++
      } else {
        skipped++
      }
    }

    return NextResponse.json({ success: true, created, skipped, total: brandSettings.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
