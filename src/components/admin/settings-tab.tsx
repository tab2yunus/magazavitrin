'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  Globe,
  Image as ImageIcon,
  Phone,
  Share2,
  Search,
  FileText,
  Map,
  Bot,
  Code,
  BarChart3,
  Construction,
  Scale,
  Save,
  Loader2,
  RotateCcw,
  Eye,
  ExternalLink,
  Info,
  Palette,
  Sparkles,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────
interface SettingItem {
  id: string
  key: string
  value: string | null
  type: string
  group: string
  label: string | null
}

interface SeoSettingItem {
  id: string
  pageType: string
  titleTemplate: string | null
  descriptionTemplate: string | null
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  canonicalUrl: string | null
  robotsDirective: string | null
}

interface LegalPageItem {
  id: string
  slug: string
  title: string
  content: string | null
  type: string
  isActive: boolean
  sortOrder: number
}

// ─── Default Settings Definitions ───────────────────────────
const DEFAULT_SETTINGS: Omit<SettingItem, 'id'>[] = [
  // General
  { key: 'site_name', value: 'MağazaVitrin', type: 'text', group: 'general', label: 'Site Adı' },
  { key: 'site_short_name', value: 'MV', type: 'text', group: 'general', label: 'Kısa Ad' },
  { key: 'site_description', value: 'Türkiye\'nin en büyük online alışveriş platformu', type: 'textarea', group: 'general', label: 'Site Açıklaması' },
  { key: 'site_language', value: 'tr', type: 'text', group: 'general', label: 'Dil' },
  { key: 'site_currency', value: 'TRY', type: 'text', group: 'general', label: 'Para Birimi' },
  { key: 'site_timezone', value: 'Europe/Istanbul', type: 'text', group: 'general', label: 'Zaman Dilimi' },
  { key: 'site_country', value: 'Türkiye', type: 'text', group: 'general', label: 'Ülke' },
  { key: 'site_city', value: 'İstanbul', type: 'text', group: 'general', label: 'Şehir' },
  { key: 'order_email', value: '', type: 'text', group: 'general', label: 'Sipariş E-posta' },
  { key: 'support_email', value: '', type: 'text', group: 'general', label: 'Destek E-posta' },
  { key: 'system_email', value: '', type: 'text', group: 'general', label: 'Sistem E-posta' },

  // Identity
  { key: 'logo', value: '', type: 'image', group: 'identity', label: 'Logo' },
  { key: 'mobile_logo', value: '', type: 'image', group: 'identity', label: 'Mobil Logo' },
  { key: 'footer_logo', value: '', type: 'image', group: 'identity', label: 'Footer Logo' },
  { key: 'favicon', value: '', type: 'image', group: 'identity', label: 'Favicon' },
  { key: 'default_product_image', value: '', type: 'image', group: 'identity', label: 'Varsayılan Ürün Görseli' },
  { key: 'default_store_image', value: '', type: 'image', group: 'identity', label: 'Varsayılan Mağaza Görseli' },
  { key: 'default_category_image', value: '', type: 'image', group: 'identity', label: 'Varsayılan Kategori Görseli' },

  // Contact
  { key: 'contact_phone', value: '', type: 'text', group: 'contact', label: 'Telefon' },
  { key: 'contact_whatsapp', value: '', type: 'text', group: 'contact', label: 'WhatsApp Numarası' },
  { key: 'contact_email', value: '', type: 'text', group: 'contact', label: 'E-posta' },
  { key: 'contact_address', value: '', type: 'textarea', group: 'contact', label: 'Adres' },
  { key: 'contact_city', value: '', type: 'text', group: 'contact', label: 'Şehir' },
  { key: 'contact_district', value: '', type: 'text', group: 'contact', label: 'İlçe' },
  { key: 'contact_google_maps', value: '', type: 'text', group: 'contact', label: 'Google Maps Linki' },
  { key: 'contact_work_hours', value: '', type: 'textarea', group: 'contact', label: 'Çalışma Saatleri' },
  { key: 'contact_live_support', value: '', type: 'text', group: 'contact', label: 'Canlı Destek Linki' },

  // Social
  { key: 'social_instagram', value: '', type: 'text', group: 'social', label: 'Instagram' },
  { key: 'social_facebook', value: '', type: 'text', group: 'social', label: 'Facebook' },
  { key: 'social_youtube', value: '', type: 'text', group: 'social', label: 'YouTube' },
  { key: 'social_tiktok', value: '', type: 'text', group: 'social', label: 'TikTok' },
  { key: 'social_twitter', value: '', type: 'text', group: 'social', label: 'X / Twitter' },
  { key: 'social_linkedin', value: '', type: 'text', group: 'social', label: 'LinkedIn' },
  { key: 'social_pinterest', value: '', type: 'text', group: 'social', label: 'Pinterest' },

  // SEO
  { key: 'seo_default_title', value: '', type: 'text', group: 'seo', label: 'Varsayılan SEO Başlığı' },
  { key: 'seo_default_description', value: '', type: 'textarea', group: 'seo', label: 'Varsayılan Meta Açıklama' },
  { key: 'seo_default_keywords', value: '', type: 'textarea', group: 'seo', label: 'Varsayılan Anahtar Kelimeler' },
  { key: 'seo_google_search_console', value: '', type: 'text', group: 'seo', label: 'Google Search Console Doğrulama' },
  { key: 'seo_google_analytics_id', value: '', type: 'text', group: 'seo', label: 'Google Analytics ID' },
  { key: 'seo_google_tag_manager_id', value: '', type: 'text', group: 'seo', label: 'Google Tag Manager ID' },
  { key: 'seo_bing_webmaster', value: '', type: 'text', group: 'seo', label: 'Bing Webmaster Kodu' },
  { key: 'seo_yandex_webmaster', value: '', type: 'text', group: 'seo', label: 'Yandex Webmaster Kodu' },

  // Sitemap
  { key: 'sitemap_enabled', value: 'true', type: 'boolean', group: 'sitemap', label: 'Sitemap Aktif' },
  { key: 'sitemap_include_products', value: 'true', type: 'boolean', group: 'sitemap', label: 'Ürünleri Dahil Et' },
  { key: 'sitemap_include_categories', value: 'true', type: 'boolean', group: 'sitemap', label: 'Kategorileri Dahil Et' },
  { key: 'sitemap_include_brands', value: 'true', type: 'boolean', group: 'sitemap', label: 'Markaları Dahil Et' },
  { key: 'sitemap_include_stores', value: 'true', type: 'boolean', group: 'sitemap', label: 'Mağazaları Dahil Et' },
  { key: 'sitemap_include_pages', value: 'true', type: 'boolean', group: 'sitemap', label: 'Sayfaları Dahil Et' },

  // Robots
  { key: 'robots_enabled', value: 'true', type: 'boolean', group: 'robots', label: 'Robots.txt Aktif' },
  { key: 'robots_content', value: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://example.com/sitemap.xml', type: 'textarea', group: 'robots', label: 'Robots.txt İçeriği' },

  // Schema
  { key: 'schema_organization_enabled', value: 'true', type: 'boolean', group: 'schema', label: 'Organization Schema Aktif' },
  { key: 'schema_website_enabled', value: 'true', type: 'boolean', group: 'schema', label: 'WebSite Schema Aktif' },
  { key: 'schema_search_action_enabled', value: 'true', type: 'boolean', group: 'schema', label: 'SearchAction Schema Aktif' },
  { key: 'schema_breadcrumb_enabled', value: 'true', type: 'boolean', group: 'schema', label: 'BreadcrumbList Schema Aktif' },
  { key: 'schema_product_enabled', value: 'true', type: 'boolean', group: 'schema', label: 'Product Schema Aktif' },
  { key: 'schema_store_enabled', value: 'true', type: 'boolean', group: 'schema', label: 'Store Schema Aktif' },
  { key: 'schema_faq_enabled', value: 'false', type: 'boolean', group: 'schema', label: 'FAQPage Schema Aktif' },
  { key: 'schema_org_name', value: '', type: 'text', group: 'schema', label: 'Organizasyon Adı' },
  { key: 'schema_org_logo', value: '', type: 'image', group: 'schema', label: 'Organizasyon Logo' },
  { key: 'schema_org_url', value: '', type: 'text', group: 'schema', label: 'Organizasyon URL' },
  { key: 'schema_org_phone', value: '', type: 'text', group: 'schema', label: 'Organizasyon Telefon' },
  { key: 'schema_org_email', value: '', type: 'text', group: 'schema', label: 'Organizasyon E-posta' },
  { key: 'schema_org_address', value: '', type: 'textarea', group: 'schema', label: 'Organizasyon Adres' },
  { key: 'schema_org_social_links', value: '', type: 'textarea', group: 'schema', label: 'Sosyal Medya Linkleri (satır satır)' },

  // Open Graph
  { key: 'og_default_title', value: '', type: 'text', group: 'og', label: 'Varsayılan OG Başlık' },
  { key: 'og_default_description', value: '', type: 'textarea', group: 'og', label: 'Varsayılan OG Açıklama' },
  { key: 'og_default_image', value: '', type: 'image', group: 'og', label: 'Varsayılan OG Görsel' },
  { key: 'og_twitter_card_type', value: 'summary_large_image', type: 'text', group: 'og', label: 'Twitter Card Tipi' },
  { key: 'og_twitter_title', value: '', type: 'text', group: 'og', label: 'Twitter Başlık' },
  { key: 'og_twitter_description', value: '', type: 'textarea', group: 'og', label: 'Twitter Açıklama' },
  { key: 'og_twitter_image', value: '', type: 'image', group: 'og', label: 'Twitter Görsel' },

  // Maintenance
  { key: 'maintenance_enabled', value: 'false', type: 'boolean', group: 'maintenance', label: 'Bakım Modu Aktif' },
  { key: 'maintenance_title', value: 'Yakında Geri Döneceğiz', type: 'text', group: 'maintenance', label: 'Bakım Başlığı' },
  { key: 'maintenance_description', value: 'Sitemiz şu anda bakımdadır. Kısa sürede tekrar hizmetinizde olacağız.', type: 'textarea', group: 'maintenance', label: 'Bakım Açıklaması' },
  { key: 'maintenance_reopen_date', value: '', type: 'text', group: 'maintenance', label: 'Tahmini Açılış Tarihi' },
  { key: 'maintenance_admin_can_see', value: 'true', type: 'boolean', group: 'maintenance', label: 'Admin Siteyi Görebilir' },

  // Legal
  { key: 'legal_privacy_page', value: '', type: 'text', group: 'legal', label: 'Gizlilik Politikası Sayfası' },
  { key: 'legal_terms_page', value: '', type: 'text', group: 'legal', label: 'Kullanım Koşulları Sayfası' },
  { key: 'legal_distance_sales_page', value: '', type: 'text', group: 'legal', label: 'Mesafeli Satış Sözleşmesi Sayfası' },
  { key: 'legal_kvkk_page', value: '', type: 'text', group: 'legal', label: 'KVKK Aydınlatma Sayfası' },
  { key: 'legal_return_page', value: '', type: 'text', group: 'legal', label: 'İade/Değişim Sayfası' },
  { key: 'legal_contact_page', value: '', type: 'text', group: 'legal', label: 'İletişim Sayfası' },

  // Brand Identity
  { key: 'brand_name', value: 'MağazaVitrin', type: 'text', group: 'brand_identity', label: 'Marka Adı' },
  { key: 'brand_short_name', value: 'MV', type: 'text', group: 'brand_identity', label: 'Kısa Marka Adı' },
  { key: 'brand_slogan', value: "Türkiye'nin Motosiklet Yedek Parça Pazaryeri", type: 'text', group: 'brand_identity', label: 'Marka Sloganı' },
  { key: 'brand_description', value: "Türkiye'nin en büyük motosiklet yedek parça pazaryeri. Orijinal ve kaliteli motosiklet parçalarını en uygun fiyatlarla sizlere sunuyoruz.", type: 'textarea', group: 'brand_identity', label: 'Marka Açıklaması' },
  { key: 'brand_logo', value: '', type: 'image', group: 'brand_identity', label: 'Logo' },
  { key: 'brand_logo_dark', value: '', type: 'image', group: 'brand_identity', label: 'Koyu Tema Logo' },
  { key: 'brand_mobile_logo', value: '', type: 'image', group: 'brand_identity', label: 'Mobil Logo' },
  { key: 'brand_footer_logo', value: '', type: 'image', group: 'brand_identity', label: 'Footer Logo' },
  { key: 'brand_favicon', value: '', type: 'image', group: 'brand_identity', label: 'Favicon' },
  { key: 'default_product_image', value: '', type: 'image', group: 'brand_identity', label: 'Varsayılan Ürün Görseli' },
  { key: 'default_category_image', value: '', type: 'image', group: 'brand_identity', label: 'Varsayılan Kategori Görseli' },
  { key: 'default_store_image', value: '', type: 'image', group: 'brand_identity', label: 'Varsayılan Mağaza Görseli' },

  // Theme
  { key: 'theme_color_primary', value: '#F27A1A', type: 'color', group: 'theme', label: 'Ana Renk' },
  { key: 'theme_color_primary_dark', value: '#D4630E', type: 'color', group: 'theme', label: 'Ana Renk Koyu' },
  { key: 'theme_color_primary_light', value: '#FFF3E8', type: 'color', group: 'theme', label: 'Ana Renk Açık' },
  { key: 'theme_color_secondary', value: '#0F1B2D', type: 'color', group: 'theme', label: 'İkincil Renk' },
  { key: 'theme_color_secondary_light', value: '#1B2D45', type: 'color', group: 'theme', label: 'İkincil Renk Açık' },
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
  { key: 'theme_name', value: 'classic', type: 'text', group: 'theme', label: 'Tema Adı' },
]

// ─── Default SEO Settings ───────────────────────────────────
const DEFAULT_SEO_SETTINGS: Omit<SeoSettingItem, 'id'>[] = [
  { pageType: 'product', titleTemplate: '{PRODUCT_NAME} | {SITE_NAME}', descriptionTemplate: '{PRODUCT_NAME} - {PRICE} TL | {DESCRIPTION}', title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null, twitterTitle: null, twitterDescription: null, twitterImage: null, canonicalUrl: null, robotsDirective: null },
  { pageType: 'category', titleTemplate: '{CATEGORY_NAME} | {SITE_NAME}', descriptionTemplate: '{CATEGORY_NAME} kategorisindeki ürünleri keşfedin', title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null, twitterTitle: null, twitterDescription: null, twitterImage: null, canonicalUrl: null, robotsDirective: null },
  { pageType: 'brand', titleTemplate: '{BRAND_NAME} | {SITE_NAME}', descriptionTemplate: '{BRAND_NAME} marka ürünleri keşfedin', title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null, twitterTitle: null, twitterDescription: null, twitterImage: null, canonicalUrl: null, robotsDirective: null },
  { pageType: 'store', titleTemplate: '{STORE_NAME} | {SITE_NAME}', descriptionTemplate: '{STORE_NAME} mağazasının ürünlerini keşfedin', title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null, twitterTitle: null, twitterDescription: null, twitterImage: null, canonicalUrl: null, robotsDirective: null },
  { pageType: 'home', titleTemplate: '{SITE_NAME}', descriptionTemplate: null, title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null, twitterTitle: null, twitterDescription: null, twitterImage: null, canonicalUrl: null, robotsDirective: null },
]

// ─── Tab Definitions ────────────────────────────────────────
const TAB_CONFIG = [
  { value: 'general', label: 'Genel Ayarlar', icon: Settings },
  { value: 'brand_identity', label: 'Marka Kimliği', icon: Sparkles },
  { value: 'theme', label: 'Tema', icon: Palette },
  { value: 'identity', label: 'Site Kimliği', icon: ImageIcon },
  { value: 'contact', label: 'İletişim', icon: Phone },
  { value: 'social', label: 'Sosyal Medya', icon: Share2 },
  { value: 'seo', label: 'SEO Ayarları', icon: Search },
  { value: 'meta', label: 'Meta Şablonları', icon: FileText },
  { value: 'sitemap', label: 'Sitemap', icon: Map },
  { value: 'robots', label: 'Robots.txt', icon: Bot },
  { value: 'schema', label: 'Schema', icon: Code },
  { value: 'og', label: 'Open Graph', icon: BarChart3 },
  { value: 'maintenance', label: 'Bakım Modu', icon: Construction },
  { value: 'legal', label: 'Yasal Sayfalar', icon: Scale },
]

// ─── Template Variables ─────────────────────────────────────
const TEMPLATE_VARIABLES: Record<string, string[]> = {
  product: ['{SITE_NAME}', '{PRODUCT_NAME}', '{PRICE}', '{DESCRIPTION}', '{BRAND_NAME}', '{CATEGORY_NAME}'],
  category: ['{SITE_NAME}', '{CATEGORY_NAME}', '{DESCRIPTION}'],
  brand: ['{SITE_NAME}', '{BRAND_NAME}', '{DESCRIPTION}'],
  store: ['{SITE_NAME}', '{STORE_NAME}', '{CITY}', '{DESCRIPTION}'],
  home: ['{SITE_NAME}'],
}

const SAMPLE_DATA: Record<string, Record<string, string>> = {
  product: { '{SITE_NAME}': 'MağazaVitrin', '{PRODUCT_NAME}': 'Honda CBR 1000 Fren Balatası', '{PRICE}': '1.250', '{DESCRIPTION}': 'Yüksek performans fren balatası', '{BRAND_NAME}': 'Honda', '{CATEGORY_NAME}': 'Motosiklet Fren' },
  category: { '{SITE_NAME}': 'MağazaVitrin', '{CATEGORY_NAME}': 'Motosiklet Fren Sistemleri', '{DESCRIPTION}': 'En kaliteli motosiklet fren parçaları' },
  brand: { '{SITE_NAME}': 'MağazaVitrin', '{BRAND_NAME}': 'Honda', '{DESCRIPTION}': 'Honda yedek parça ve aksesuarları' },
  store: { '{SITE_NAME}': 'MağazaVitrin', '{STORE_NAME}': 'MOTOLUX', '{CITY}': 'İstanbul', '{DESCRIPTION}': 'Motosiklet yedek parça uzmanı' },
  home: { '{SITE_NAME}': 'MağazaVitrin' },
}

// ─── Meta Template Labels ───────────────────────────────────
const META_PAGE_LABELS: Record<string, string> = {
  home: 'Ana Sayfa',
  product: 'Ürün',
  category: 'Kategori',
  brand: 'Marka',
  store: 'Mağaza',
}

// ─── Legal Page Type Labels ─────────────────────────────────
const LEGAL_TYPE_LABELS: Record<string, string> = {
  legal_privacy_page: 'Gizlilik Politikası',
  legal_terms_page: 'Kullanım Koşulları',
  legal_distance_sales_page: 'Mesafeli Satış Sözleşmesi',
  legal_kvkk_page: 'KVKK Aydınlatma Metni',
  legal_return_page: 'İade & Değişim',
  legal_contact_page: 'İletişim',
}

// ─── Main Component ─────────────────────────────────────────
export default function SettingsTab({ initialTab }: { initialTab?: string } = {}) {
  const [settings, setSettings] = useState<SettingItem[]>([])
  const [seoSettings, setSeoSettings] = useState<SeoSettingItem[]>([])
  const [legalPages, setLegalPages] = useState<LegalPageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingGroup, setSavingGroup] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(initialTab || 'general')
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [editedSeoSettings, setEditedSeoSettings] = useState<Record<string, { titleTemplate: string; descriptionTemplate: string }>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [robotsPreview, setRobotsPreview] = useState(false)

  // Fetch all data
  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const [settingsRes, seoRes, legalRes] = await Promise.all([
        fetch('/api/settings?flat=true'),
        fetch('/api/admin/seo-settings'),
        fetch('/api/admin/legal-pages'),
      ])

      const settingsData = await settingsRes.json()
      const seoData = await seoRes.json()
      const legalData = await legalRes.json()

      const arr = Array.isArray(settingsData) ? settingsData : []
      setSettings(arr)
      setLegalPages(Array.isArray(legalData) ? legalData : [])

      const seoArr = Array.isArray(seoData) ? seoData : []
      setSeoSettings(seoArr)

      // Build edited values
      const vals: Record<string, string> = {}
      arr.forEach((s: SettingItem) => {
        vals[s.id] = s.value || ''
      })
      setEditedValues(vals)

      // Build edited seo settings
      const seoVals: Record<string, { titleTemplate: string; descriptionTemplate: string }> = {}
      seoArr.forEach((s: SeoSettingItem) => {
        seoVals[s.pageType] = {
          titleTemplate: s.titleTemplate || '',
          descriptionTemplate: s.descriptionTemplate || '',
        }
      })
      // Include defaults for missing page types
      DEFAULT_SEO_SETTINGS.forEach((d) => {
        if (!seoVals[d.pageType]) {
          seoVals[d.pageType] = {
            titleTemplate: d.titleTemplate || '',
            descriptionTemplate: d.descriptionTemplate || '',
          }
        }
      })
      setEditedSeoSettings(seoVals)
    } catch {
      toast.error('Ayarlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Seed default settings if none exist
  const seedSettings = async () => {
    try {
      const existingKeys = new Set(settings.map(s => s.key))
      const newSettings = DEFAULT_SETTINGS.filter(d => !existingKeys.has(d.key))

      if (newSettings.length === 0) return

      for (const s of newSettings) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s),
        })
      }

      // Also seed SEO settings if needed
      const existingPageTypes = new Set(seoSettings.map(s => s.pageType))
      const newSeo = DEFAULT_SEO_SETTINGS.filter(d => !existingPageTypes.has(d.pageType))
      if (newSeo.length > 0) {
        await fetch('/api/admin/seo-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSeo),
        })
      }

      toast.success(`${newSettings.length} varsayılan ayar oluşturuldu`)
      fetchSettings()
    } catch {
      toast.error('Varsayılan ayarlar oluşturulamadı')
    }
  }

  // Auto-seed on first load if no settings
  useEffect(() => {
    if (!loading && settings.length === 0) {
      seedSettings()
    }
  }, [loading, settings.length])

  // Save settings for a specific group
  const saveGroup = async (group: string) => {
    setSavingGroup(group)
    try {
      const groupSettings = settings.filter(s => s.group === group)
      const updates = groupSettings.map(s => ({
        id: s.id,
        key: s.key,
        value: editedValues[s.id] ?? s.value ?? '',
        type: s.type,
        group: s.group,
      }))

      // Also check for new keys not yet in DB
      const defaultGroupSettings = DEFAULT_SETTINGS.filter(d => d.group === group)
      const existingKeys = new Set(groupSettings.map(s => s.key))
      const newKeys = defaultGroupSettings.filter(d => !existingKeys.has(d.key))

      if (newKeys.length > 0) {
        for (const s of newKeys) {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(s),
          })
        }
      }

      if (updates.length > 0) {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
      }

      toast.success('Ayarlar kaydedildi')
      fetchSettings()
    } catch {
      toast.error('Kaydetme başarısız')
    } finally {
      setSavingGroup(null)
    }
  }

  // Save SEO meta templates
  const saveSeoSettings = async () => {
    setSavingGroup('meta')
    try {
      const updates = Object.entries(editedSeoSettings).map(([pageType, data]) => ({
        pageType,
        titleTemplate: data.titleTemplate,
        descriptionTemplate: data.descriptionTemplate,
      }))
      await fetch('/api/admin/seo-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      toast.success('Meta şablonları kaydedildi')
      fetchSettings()
    } catch {
      toast.error('Meta şablonları kaydedilemedi')
    } finally {
      setSavingGroup(null)
    }
  }

  // Get setting value helper
  const getValue = (key: string): string => {
    const setting = settings.find(s => s.key === key)
    if (!setting) return ''
    return editedValues[setting.id] ?? setting.value ?? ''
  }

  // Set setting value helper
  const setValue = (key: string, value: string) => {
    const setting = settings.find(s => s.key === key)
    if (setting) {
      setEditedValues(v => ({ ...v, [setting.id]: value }))
    }
  }

  // Get boolean setting value
  const getBoolValue = (key: string): boolean => {
    return getValue(key) === 'true'
  }

  // Set boolean setting value
  const setBoolValue = (key: string, checked: boolean) => {
    setValue(key, checked ? 'true' : 'false')
  }

  // Generate WhatsApp link
  const getWhatsAppLink = (): string => {
    const phone = getValue('contact_whatsapp').replace(/\D/g, '')
    if (!phone) return ''
    if (!phone.startsWith('90') && phone.length === 10) {
      return `https://wa.me/90${phone}`
    }
    return `https://wa.me/${phone}`
  }

  // Render template preview
  const renderTemplatePreview = (template: string, pageType: string): string => {
    const sample = SAMPLE_DATA[pageType] || {}
    let result = template
    Object.entries(sample).forEach(([key, val]) => {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), val)
    })
    return result
  }

  // Default robots.txt content
  const DEFAULT_ROBOTS = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://example.com/sitemap.xml`

  // ─── Field Renderer ───────────────────────────────────────
  const renderField = (key: string, type: 'text' | 'textarea' | 'number' | 'image' | 'boolean' | 'color' = 'text', placeholder?: string) => {
    const setting = settings.find(s => s.key === key)
    const label = setting?.label || DEFAULT_SETTINGS.find(d => d.key === key)?.label || key

    if (type === 'boolean' || setting?.type === 'boolean') {
      return (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{label}</Label>
          </div>
          <Switch
            checked={getBoolValue(key)}
            onCheckedChange={(checked) => setBoolValue(key, checked)}
          />
        </div>
      )
    }

    if (type === 'color' || setting?.type === 'color') {
      const color = getValue(key)
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={color || '#000000'}
                onChange={(e) => setValue(key, e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5"
              />
            </div>
            <Input
              value={color}
              onChange={(e) => setValue(key, e.target.value)}
              placeholder="#000000"
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      )
    }

    if (type === 'textarea' || setting?.type === 'textarea') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Textarea
            value={getValue(key)}
            onChange={(e) => setValue(key, e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px]"
          />
        </div>
      )
    }

    if (type === 'image' || setting?.type === 'image') {
      const url = getValue(key)
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Input
            value={url}
            onChange={(e) => setValue(key, e.target.value)}
            placeholder="Görsel URL girin..."
          />
          {url && (
            <div className="mt-2 rounded-lg border bg-gray-50 p-2">
              <img
                src={url}
                alt={label}
                className="max-h-24 max-w-full object-contain rounded"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Input
          type={type === 'number' ? 'number' : 'text'}
          value={getValue(key)}
          onChange={(e) => setValue(key, e.target.value)}
          placeholder={placeholder}
        />
      </div>
    )
  }

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Tab Content Renderers ────────────────────────────────
  const renderGeneralTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Genel Site Ayarları</CardTitle>
          <CardDescription>Temel site bilgilerinizi yapılandırın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('site_name', 'text', 'Site adınız')}
            {renderField('site_short_name', 'text', 'Kısa ad')}
          </div>
          {renderField('site_description', 'textarea', 'Sitenizin kısa açıklaması')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('site_language', 'text', 'tr')}
            {renderField('site_currency', 'text', 'TRY')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('site_timezone', 'text', 'Europe/Istanbul')}
            {renderField('site_country', 'text', 'Türkiye')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('site_city', 'text', 'Şehir')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">E-posta Ayarları</CardTitle>
          <CardDescription>Sistem e-posta adreslerini yapılandırın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('order_email', 'text', 'siparis@example.com')}
            {renderField('support_email', 'text', 'destek@example.com')}
            {renderField('system_email', 'text', 'sistem@example.com')}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('general')}
          disabled={savingGroup === 'general'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'general' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderIdentityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Site Logoları</CardTitle>
          <CardDescription>Logo ve favicon görsellerini URL olarak girin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('logo', 'image')}
            {renderField('mobile_logo', 'image')}
            {renderField('footer_logo', 'image')}
            {renderField('favicon', 'image')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Varsayılan Görseller</CardTitle>
          <CardDescription>Ürün, mağaza ve kategori için varsayılan görseller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('default_product_image', 'image')}
            {renderField('default_store_image', 'image')}
            {renderField('default_category_image', 'image')}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('identity')}
          disabled={savingGroup === 'identity'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'identity' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderContactTab = () => {
    const whatsappLink = getWhatsAppLink()
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">İletişim Bilgileri</CardTitle>
            <CardDescription>Müşterilerinizin size ulaşabilmesi için iletişim bilgilerinizi girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('contact_phone', 'text', '+90 212 000 00 00')}
              {renderField('contact_email', 'text', 'info@example.com')}
            </div>
            <div className="space-y-2">
              {renderField('contact_whatsapp', 'text', '902120000000')}
              {whatsappLink && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">WhatsApp Linki:</span>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 underline flex items-center gap-1">
                    {whatsappLink}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
            {renderField('contact_address', 'textarea', 'Adres bilgilerinizi girin')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('contact_city', 'text', 'Şehir')}
              {renderField('contact_district', 'text', 'İlçe')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Harita & Çalışma Saatleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderField('contact_google_maps', 'text', 'https://maps.google.com/...')}
            {renderField('contact_work_hours', 'textarea', 'Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 09:00 - 14:00\nPazar: Kapalı')}
            {renderField('contact_live_support', 'text', 'Canlı destek linki')}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => saveGroup('contact')}
            disabled={savingGroup === 'contact'}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {savingGroup === 'contact' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>
    )
  }

  const renderSocialTab = () => {
    const socialFields = [
      { key: 'social_instagram', placeholder: 'https://instagram.com/...', color: 'bg-pink-500' },
      { key: 'social_facebook', placeholder: 'https://facebook.com/...', color: 'bg-blue-600' },
      { key: 'social_youtube', placeholder: 'https://youtube.com/...', color: 'bg-red-600' },
      { key: 'social_tiktok', placeholder: 'https://tiktok.com/...', color: 'bg-gray-900' },
      { key: 'social_twitter', placeholder: 'https://x.com/...', color: 'bg-gray-800' },
      { key: 'social_linkedin', placeholder: 'https://linkedin.com/...', color: 'bg-blue-700' },
      { key: 'social_pinterest', placeholder: 'https://pinterest.com/...', color: 'bg-red-500' },
    ]

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sosyal Medya Hesapları</CardTitle>
            <CardDescription>Sosyal medya profil linklerinizi girin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialFields.map(field => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${field.color}`} />
                    {DEFAULT_SETTINGS.find(d => d.key === field.key)?.label || field.key}
                  </Label>
                  <Input
                    value={getValue(field.key)}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => saveGroup('social')}
            disabled={savingGroup === 'social'}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {savingGroup === 'social' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>
    )
  }

  const renderSeoTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Varsayılan SEO Ayarları</CardTitle>
          <CardDescription>Sayfalara özel SEO bilgisi girilmediğinde kullanılacak varsayılan değerler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderField('seo_default_title', 'text', 'Site SEO başlığı')}
          {renderField('seo_default_description', 'textarea', 'Site meta açıklaması')}
          {renderField('seo_default_keywords', 'textarea', 'anahtar, kelime, listesi')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Google Entegrasyonları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('seo_google_search_console', 'text', 'Doğrulama kodu')}
            {renderField('seo_google_analytics_id', 'text', 'G-XXXXXXXXXX')}
            {renderField('seo_google_tag_manager_id', 'text', 'GTM-XXXXXXX')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Diğer Arama Motorları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('seo_bing_webmaster', 'text', 'Bing doğrulama kodu')}
            {renderField('seo_yandex_webmaster', 'text', 'Yandex doğrulama kodu')}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('seo')}
          disabled={savingGroup === 'seo'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'seo' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderMetaTab = () => {
    const pageTypes = ['home', 'product', 'category', 'brand', 'store']

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Meta Şablonları</CardTitle>
            <CardDescription>
              Sayfa türleri için başlık ve açıklama şablonları tanımlayın. Değişkenler otomatik olarak yerine konulur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pageTypes.map(pageType => {
              const variables = TEMPLATE_VARIABLES[pageType] || []
              const edited = editedSeoSettings[pageType] || { titleTemplate: '', descriptionTemplate: '' }

              return (
                <div key={pageType} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {META_PAGE_LABELS[pageType] || pageType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Başlık Şablonu</Label>
                      <Input
                        value={edited.titleTemplate}
                        onChange={(e) =>
                          setEditedSeoSettings(prev => ({
                            ...prev,
                            [pageType]: { ...prev[pageType], titleTemplate: e.target.value },
                          }))
                        }
                        placeholder={`${META_PAGE_LABELS[pageType]} başlık şablonu`}
                      />
                      <div className="flex flex-wrap gap-1">
                        {variables.map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] cursor-pointer hover:bg-gray-100" onClick={() => {
                            setEditedSeoSettings(prev => ({
                              ...prev,
                              [pageType]: { ...prev[pageType], titleTemplate: (prev[pageType]?.titleTemplate || '') + v },
                            }))
                          }}>
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Açıklama Şablonu</Label>
                      <Input
                        value={edited.descriptionTemplate}
                        onChange={(e) =>
                          setEditedSeoSettings(prev => ({
                            ...prev,
                            [pageType]: { ...prev[pageType], descriptionTemplate: e.target.value },
                          }))
                        }
                        placeholder={`${META_PAGE_LABELS[pageType]} açıklama şablonu`}
                      />
                      <div className="flex flex-wrap gap-1">
                        {variables.map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] cursor-pointer hover:bg-gray-100" onClick={() => {
                            setEditedSeoSettings(prev => ({
                              ...prev,
                              [pageType]: { ...prev[pageType], descriptionTemplate: (prev[pageType]?.descriptionTemplate || '') + v },
                            }))
                          }}>
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  {(edited.titleTemplate || edited.descriptionTemplate) && (
                    <div className="bg-gray-50 rounded-lg border p-4 space-y-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3.5 h-3.5" />
                        Canlı Önizleme
                      </div>
                      {edited.titleTemplate && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Başlık:</p>
                          <p className="text-sm font-medium text-[var(--color-text)]">{renderTemplatePreview(edited.titleTemplate, pageType)}</p>
                        </div>
                      )}
                      {edited.descriptionTemplate && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Açıklama:</p>
                          <p className="text-sm text-gray-600">{renderTemplatePreview(edited.descriptionTemplate, pageType)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {pageType !== 'store' && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={saveSeoSettings}
            disabled={savingGroup === 'meta'}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {savingGroup === 'meta' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>
    )
  }

  const renderSitemapTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Sitemap Ayarları</CardTitle>
          <CardDescription>Arama motorları için sitemap yapılandırması</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {renderField('sitemap_enabled', 'boolean')}
          <Separator />
          <div>
            <Label className="text-sm font-medium mb-3 block">Sitemap&apos;e Dahil Edilecekler</Label>
            <div className="space-y-3">
              {renderField('sitemap_include_products', 'boolean')}
              {renderField('sitemap_include_categories', 'boolean')}
              {renderField('sitemap_include_brands', 'boolean')}
              {renderField('sitemap_include_stores', 'boolean')}
              {renderField('sitemap_include_pages', 'boolean')}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('sitemap')}
          disabled={savingGroup === 'sitemap'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'sitemap' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderRobotsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Robots.txt Ayarları</CardTitle>
          <CardDescription>Arama motoru botları için yönergeler belirleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderField('robots_enabled', 'boolean')}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Robots.txt İçeriği</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setValue('robots_content', DEFAULT_ROBOTS)
                    toast.info('Varsayılan içerik yüklendi')
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Varsayılana Sıfırla
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRobotsPreview(!robotsPreview)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {robotsPreview ? 'Düzenle' : 'Önizle'}
                </Button>
              </div>
            </div>
            {robotsPreview ? (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap">
                {getValue('robots_content')}
              </pre>
            ) : (
              <Textarea
                value={getValue('robots_content')}
                onChange={(e) => setValue('robots_content', e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('robots')}
          disabled={savingGroup === 'robots'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'robots' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderSchemaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Schema.org Yapılandırma</CardTitle>
          <CardDescription>Yapılandırılmış veri şemalarını etkinleştirin veya devre dışı bırakın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {renderField('schema_organization_enabled', 'boolean')}
          {renderField('schema_website_enabled', 'boolean')}
          {renderField('schema_search_action_enabled', 'boolean')}
          {renderField('schema_breadcrumb_enabled', 'boolean')}
          {renderField('schema_product_enabled', 'boolean')}
          {renderField('schema_store_enabled', 'boolean')}
          {renderField('schema_faq_enabled', 'boolean')}
        </CardContent>
      </Card>

      {getBoolValue('schema_organization_enabled') && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Organization Schema Detayları</CardTitle>
            <CardDescription>Organizasyon bilgilerinizi doldurun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('schema_org_name', 'text', 'Organizasyon adı')}
              {renderField('schema_org_logo', 'image')}
              {renderField('schema_org_url', 'text', 'https://example.com')}
              {renderField('schema_org_phone', 'text', '+90 212 000 00 00')}
              {renderField('schema_org_email', 'text', 'info@example.com')}
            </div>
            {renderField('schema_org_address', 'textarea', 'Adres bilgileri')}
            {renderField('schema_org_social_links', 'textarea', 'Her satıra bir sosyal medya linki')}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('schema')}
          disabled={savingGroup === 'schema'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'schema' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderOgTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Open Graph (OG) Ayarları</CardTitle>
          <CardDescription>Sosyal medya paylaşımlarında görünen varsayılan OG bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderField('og_default_title', 'text', 'Paylaşım başlığı')}
          {renderField('og_default_description', 'textarea', 'Paylaşım açıklaması')}
          {renderField('og_default_image', 'image')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Twitter Card Ayarları</CardTitle>
          <CardDescription>Twitter/X üzerinde paylaşıldığında görünen kart bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Twitter Card Tipi</Label>
            <Select
              value={getValue('og_twitter_card_type') || 'summary_large_image'}
              onValueChange={(val) => setValue('og_twitter_card_type', val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                <SelectItem value="app">App</SelectItem>
                <SelectItem value="player">Player</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('og_twitter_title', 'text', 'Twitter başlık')}
            {renderField('og_twitter_description', 'textarea', 'Twitter açıklama')}
          </div>
          {renderField('og_twitter_image', 'image')}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('og')}
          disabled={savingGroup === 'og'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'og' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Bakım Modu</CardTitle>
          <CardDescription>Site bakım modundayken ziyaretçilere bakım sayfası gösterilir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderField('maintenance_enabled', 'boolean')}
          {renderField('maintenance_title', 'text', 'Yakında Geri Döneceğiz')}
          {renderField('maintenance_description', 'textarea', 'Sitemiz şu anda bakımdadır...')}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tahmini Açılış Tarihi</Label>
            <Input
              type="datetime-local"
              value={getValue('maintenance_reopen_date')}
              onChange={(e) => setValue('maintenance_reopen_date', e.target.value)}
            />
          </div>
          {renderField('maintenance_admin_can_see', 'boolean')}
        </CardContent>
      </Card>

      {/* Maintenance Preview */}
      {getBoolValue('maintenance_enabled') && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Bakım Sayfası Önizleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 text-center">
              <Construction className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                {getValue('maintenance_title') || 'Yakında Geri Döneceğiz'}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                {getValue('maintenance_description') || 'Sitemiz şu anda bakımdadır. Kısa sürede tekrar hizmetinizde olacağız.'}
              </p>
              {getValue('maintenance_reopen_date') && (
                <p className="text-sm text-gray-500">
                  Tahmini açılış: {new Date(getValue('maintenance_reopen_date')).toLocaleString('tr-TR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Gizle' : 'Tam Önizle'}
        </Button>
        <Button
          onClick={() => saveGroup('maintenance')}
          disabled={savingGroup === 'maintenance'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'maintenance' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderLegalTab = () => {
    const legalKeys = Object.keys(LEGAL_TYPE_LABELS)

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Yasal Sayfa Atamaları</CardTitle>
            <CardDescription>
              Her yasal tür için kullanılacak sayfayı seçin. Sayfalar &quot;Yasal Sayfalar&quot; bölümünden yönetilebilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {legalKeys.map(key => {
              const currentValue = getValue(key)
              return (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium">{LEGAL_TYPE_LABELS[key]}</Label>
                  <Select
                    value={currentValue}
                    onValueChange={(val) => setValue(key, val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sayfa seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Sayfa Seçilmedi --</SelectItem>
                      {legalPages
                        .filter(p => p.isActive)
                        .map(page => (
                          <SelectItem key={page.id} value={page.slug}>
                            {page.title}
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              /{page.slug}
                            </Badge>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Quick view of legal pages */}
        {legalPages.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Mevcut Yasal Sayfalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {legalPages.map(page => (
                  <div key={page.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{page.title}</span>
                      <Badge variant="outline" className="text-[10px]">/{page.slug}</Badge>
                      <Badge variant={page.type === 'custom' ? 'secondary' : 'default'} className="text-[10px]">
                        {page.type}
                      </Badge>
                    </div>
                    <Badge variant={page.isActive ? 'default' : 'secondary'} className="text-[10px]">
                      {page.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {legalPages.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Henüz yasal sayfa bulunmuyor. Önce yasal sayfaları oluşturun.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => saveGroup('legal')}
            disabled={savingGroup === 'legal'}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {savingGroup === 'legal' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>
    )
  }

  // ─── Theme Presets ────────────────────────────────────────
  const THEME_PRESETS_ADMIN: Record<string, { label: string; colors: Record<string, string> }> = {
    classic: {
      label: 'Classic',
      colors: {
        theme_color_primary: '#F27A1A', theme_color_primary_dark: '#D4630E', theme_color_primary_light: '#FFF3E8',
        theme_color_secondary: '#0F1B2D', theme_color_secondary_light: '#1B2D45', theme_color_accent: '#FF8C38',
        theme_color_background: '#FFFFFF', theme_color_surface: '#F4F5F7', theme_color_card: '#FFFFFF',
        theme_color_text: '#0F1B2D', theme_color_text_secondary: '#4A5568', theme_color_text_muted: '#8C95A6',
        theme_color_border: '#E2E5EA', theme_color_success: '#10B981', theme_color_warning: '#F59E0B',
        theme_color_danger: '#EF4444', theme_color_info: '#3B82F6',
      },
    },
    midnight: {
      label: 'Midnight',
      colors: {
        theme_color_primary: '#6366F1', theme_color_primary_dark: '#4F46E5', theme_color_primary_light: '#EEF2FF',
        theme_color_secondary: '#0F172A', theme_color_secondary_light: '#1E293B', theme_color_accent: '#818CF8',
        theme_color_background: '#FFFFFF', theme_color_surface: '#F1F5F9', theme_color_card: '#FFFFFF',
        theme_color_text: '#0F172A', theme_color_text_secondary: '#475569', theme_color_text_muted: '#94A3B8',
        theme_color_border: '#E2E8F0', theme_color_success: '#10B981', theme_color_warning: '#F59E0B',
        theme_color_danger: '#EF4444', theme_color_info: '#3B82F6',
      },
    },
    carbon: {
      label: 'Carbon',
      colors: {
        theme_color_primary: '#10B981', theme_color_primary_dark: '#059669', theme_color_primary_light: '#ECFDF5',
        theme_color_secondary: '#111827', theme_color_secondary_light: '#1F2937', theme_color_accent: '#34D399',
        theme_color_background: '#FFFFFF', theme_color_surface: '#F3F4F6', theme_color_card: '#FFFFFF',
        theme_color_text: '#111827', theme_color_text_secondary: '#4B5563', theme_color_text_muted: '#9CA3AF',
        theme_color_border: '#E5E7EB', theme_color_success: '#10B981', theme_color_warning: '#F59E0B',
        theme_color_danger: '#EF4444', theme_color_info: '#3B82F6',
      },
    },
    titanium: {
      label: 'Titanium',
      colors: {
        theme_color_primary: '#E11D48', theme_color_primary_dark: '#BE123C', theme_color_primary_light: '#FFF1F2',
        theme_color_secondary: '#1C1917', theme_color_secondary_light: '#292524', theme_color_accent: '#FB7185',
        theme_color_background: '#FFFFFF', theme_color_surface: '#F5F5F4', theme_color_card: '#FFFFFF',
        theme_color_text: '#1C1917', theme_color_text_secondary: '#57534E', theme_color_text_muted: '#A8A29E',
        theme_color_border: '#E7E5E4', theme_color_success: '#10B981', theme_color_warning: '#F59E0B',
        theme_color_danger: '#EF4444', theme_color_info: '#3B82F6',
      },
    },
  }

  // Apply theme preset
  const applyThemePreset = (presetName: string) => {
    const preset = THEME_PRESETS_ADMIN[presetName]
    if (!preset) return

    // Set all theme color values
    Object.entries(preset.colors).forEach(([key, value]) => {
      setValue(key, value)
    })
    // Set theme name
    setValue('theme_name', presetName)
    toast.success(`${preset.label} teması uygulandı. Kaydetmeyi unutmayın!`)
  }

  const renderBrandIdentityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
            Marka Bilgileri
          </CardTitle>
          <CardDescription>Markanızın temel kimlik bilgilerini yapılandırın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('brand_name', 'text', 'Marka adınız')}
            {renderField('brand_short_name', 'text', 'Kısa ad')}
          </div>
          {renderField('brand_slogan', 'text', 'Marka sloganınız')}
          {renderField('brand_description', 'textarea', 'Markanızın kısa açıklaması')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[var(--color-primary)]" />
            Marka Logoları
          </CardTitle>
          <CardDescription>Farklı kullanım alanları için logo görsellerini URL olarak girin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('brand_logo', 'image')}
            {renderField('brand_logo_dark', 'image')}
            {renderField('brand_mobile_logo', 'image')}
            {renderField('brand_footer_logo', 'image')}
            {renderField('brand_favicon', 'image')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[var(--color-primary)]" />
            Varsayılan Görseller
          </CardTitle>
          <CardDescription>Ürün, kategori ve mağaza için varsayılan görseller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('default_product_image', 'image')}
            {renderField('default_category_image', 'image')}
            {renderField('default_store_image', 'image')}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveGroup('brand_identity')}
          disabled={savingGroup === 'brand_identity'}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {savingGroup === 'brand_identity' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Kaydet
        </Button>
      </div>
    </div>
  )

  const renderThemeTab = () => {
    const currentPreset = getValue('theme_name') || 'classic'

    // Live preview colors (fall back to defaults if empty)
    const previewPrimary = getValue('theme_color_primary') || '#F27A1A'
    const previewPrimaryLight = getValue('theme_color_primary_light') || '#FFF3E8'
    const previewSecondary = getValue('theme_color_secondary') || '#0F1B2D'
    const previewSecondaryLight = getValue('theme_color_secondary_light') || '#1B2D45'
    const previewAccent = getValue('theme_color_accent') || '#FF8C38'
    const previewSurface = getValue('theme_color_surface') || '#F4F5F7'
    const previewCard = getValue('theme_color_card') || '#FFFFFF'
    const previewText = getValue('theme_color_text') || '#0F1B2D'
    const previewTextSecondary = getValue('theme_color_text_secondary') || '#4A5568'
    const previewTextMuted = getValue('theme_color_text_muted') || '#8C95A6'
    const previewBorder = getValue('theme_color_border') || '#E2E5EA'

    return (
      <div className="space-y-6">
        {/* Theme Presets */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--color-primary)]" />
              Tema Ön Ayarları
            </CardTitle>
            <CardDescription>Bir ön ayar seçerek tüm renkleri otomatik olarak yapılandırın</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(THEME_PRESETS_ADMIN).map(([key, preset]) => {
                const isActive = currentPreset === key
                return (
                  <button
                    key={key}
                    onClick={() => applyThemePreset(key)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      isActive
                        ? 'border-[var(--color-primary)] shadow-md bg-[var(--color-primary-light)]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {/* Color Swatch Preview */}
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: preset.colors.theme_color_primary }} />
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: preset.colors.theme_color_secondary }} />
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: preset.colors.theme_color_accent }} />
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: preset.colors.theme_color_surface }} />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text)]">{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--color-primary)]" />
              Canlı Önizleme
            </CardTitle>
            <CardDescription>Seçtiğiniz temanın nasıl görüneceğini önizleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: previewBorder }}>
              {/* Header bar */}
              <div className="px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: previewSecondary }}>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: previewPrimary }} />
                <span className="text-white font-semibold text-sm">MağazaVitrin</span>
                <div className="ml-auto flex gap-2">
                  <div className="w-12 h-5 rounded text-[8px] flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Menü</div>
                </div>
              </div>
              {/* Hero section */}
              <div className="px-4 py-5 text-center" style={{ backgroundColor: previewPrimaryLight }}>
                <div className="text-lg font-bold mb-1" style={{ color: previewText }}>Yedek Parça Pazaryeri</div>
                <div className="text-xs mb-3" style={{ color: previewTextSecondary }}>Binlerce motosiklet parçası burada</div>
                <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: previewPrimary }}>
                  Ürünleri Keşfet
                </div>
              </div>
              {/* Card grid */}
              <div className="p-3 grid grid-cols-3 gap-2" style={{ backgroundColor: previewSurface }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-lg overflow-hidden" style={{ backgroundColor: previewCard, border: `1px solid ${previewBorder}` }}>
                    <div className="h-12" style={{ backgroundColor: previewPrimaryLight }} />
                    <div className="p-2">
                      <div className="h-1.5 rounded mb-1.5 w-3/4" style={{ backgroundColor: previewText }} />
                      <div className="h-1 rounded mb-1 w-1/2" style={{ backgroundColor: previewTextMuted }} />
                      <div className="h-1.5 rounded w-2/3" style={{ backgroundColor: previewPrimary }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: previewSecondary }}>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: previewAccent }} />
                <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.5)' }}>© 2024 MağazaVitrin</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Colors */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Ana Renkler</CardTitle>
            <CardDescription>Sitenizin ana renk paletini yapılandırın</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('theme_color_primary', 'color')}
              {renderField('theme_color_primary_dark', 'color')}
              {renderField('theme_color_primary_light', 'color')}
              {renderField('theme_color_secondary', 'color')}
              {renderField('theme_color_secondary_light', 'color')}
              {renderField('theme_color_accent', 'color')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Arka Plan & Yüzey</CardTitle>
            <CardDescription>Sayfa arka planı ve kart/yüzey renkleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('theme_color_background', 'color')}
              {renderField('theme_color_surface', 'color')}
              {renderField('theme_color_card', 'color')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Yazı Renkleri</CardTitle>
            <CardDescription>Başlıklar, gövde metni ve soluk yazılar için renkler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('theme_color_text', 'color')}
              {renderField('theme_color_text_secondary', 'color')}
              {renderField('theme_color_text_muted', 'color')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Border & Durum Renkleri</CardTitle>
            <CardDescription>Kenarlıklar ve sistem durumu renkleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('theme_color_border', 'color')}
              {renderField('theme_color_success', 'color')}
              {renderField('theme_color_warning', 'color')}
              {renderField('theme_color_danger', 'color')}
              {renderField('theme_color_info', 'color')}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => saveGroup('theme')}
            disabled={savingGroup === 'theme'}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {savingGroup === 'theme' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>
    )
  }

  // ─── Tab Content Map ──────────────────────────────────────
  const tabContentMap: Record<string, () => React.ReactNode> = {
    general: renderGeneralTab,
    brand_identity: renderBrandIdentityTab,
    theme: renderThemeTab,
    identity: renderIdentityTab,
    contact: renderContactTab,
    social: renderSocialTab,
    seo: renderSeoTab,
    meta: renderMetaTab,
    sitemap: renderSitemapTab,
    robots: renderRobotsTab,
    schema: renderSchemaTab,
    og: renderOgTab,
    maintenance: renderMaintenanceTab,
    legal: renderLegalTab,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Site Ayarları</h3>
          <p className="text-sm text-gray-500">Sitenizin tüm ayarlarını bu panelden yönetin</p>
        </div>
        {settings.length === 0 && (
          <Button onClick={seedSettings} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Varsayılan Ayarları Oluştur
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <TabsList className="inline-flex h-auto gap-1 bg-white p-1 rounded-lg border flex-nowrap min-w-max">
            {TAB_CONFIG.map(tab => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs px-3 py-2 data-[state=active]:bg-[var(--color-secondary)] data-[state=active]:text-white"
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {TAB_CONFIG.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            {tabContentMap[tab.value]?.()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
