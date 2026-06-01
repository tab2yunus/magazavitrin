'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

/* ─── Theme Token Interface ─── */
export interface BrandTheme {
  // Brand Identity
  brandName: string
  brandShortName: string
  brandSlogan: string
  brandDescription: string
  brandLogo: string
  brandLogoDark: string
  brandMobileLogo: string
  brandFooterLogo: string
  brandFavicon: string
  defaultProductImage: string
  defaultCategoryImage: string
  defaultStoreImage: string

  // Theme Colors
  colorPrimary: string
  colorPrimaryDark: string
  colorPrimaryLight: string
  colorSecondary: string
  colorSecondaryLight: string
  colorAccent: string
  colorBackground: string
  colorSurface: string
  colorCard: string
  colorText: string
  colorTextSecondary: string
  colorTextMuted: string
  colorBorder: string
  colorSuccess: string
  colorWarning: string
  colorDanger: string
  colorInfo: string

  // Theme name
  themeName: string
}

/* ─── Default Theme (Classic) ─── */
export const DEFAULT_THEME: BrandTheme = {
  brandName: 'MağazaVitrin',
  brandShortName: 'MV',
  brandSlogan: "Türkiye'nin Motosiklet Yedek Parça Pazaryeri",
  brandDescription: "Türkiye'nin en büyük motosiklet yedek parça pazaryeri. Orijinal ve kaliteli motosiklet parçalarını en uygun fiyatlarla sizlere sunuyoruz.",
  brandLogo: '',
  brandLogoDark: '',
  brandMobileLogo: '',
  brandFooterLogo: '',
  brandFavicon: '/logo.svg',
  defaultProductImage: '',
  defaultCategoryImage: '',
  defaultStoreImage: '',

  colorPrimary: '#F27A1A',
  colorPrimaryDark: '#D4630E',
  colorPrimaryLight: '#FFF3E8',
  colorSecondary: '#0F1B2D',
  colorSecondaryLight: '#1B2D45',
  colorAccent: '#FF8C38',
  colorBackground: '#FFFFFF',
  colorSurface: '#F4F5F7',
  colorCard: '#FFFFFF',
  colorText: '#0F1B2D',
  colorTextSecondary: '#4A5568',
  colorTextMuted: '#8C95A6',
  colorBorder: '#E2E5EA',
  colorSuccess: '#10B981',
  colorWarning: '#F59E0B',
  colorDanger: '#EF4444',
  colorInfo: '#3B82F6',

  themeName: 'classic',
}

/* ─── Preset Themes ─── */
export const THEME_PRESETS: Record<string, Partial<BrandTheme>> = {
  classic: {
    colorPrimary: '#F27A1A',
    colorPrimaryDark: '#D4630E',
    colorPrimaryLight: '#FFF3E8',
    colorSecondary: '#0F1B2D',
    colorSecondaryLight: '#1B2D45',
    colorAccent: '#FF8C38',
    colorBackground: '#FFFFFF',
    colorSurface: '#F4F5F7',
    colorCard: '#FFFFFF',
    colorText: '#0F1B2D',
    colorTextSecondary: '#4A5568',
    colorTextMuted: '#8C95A6',
    colorBorder: '#E2E5EA',
  },
  midnight: {
    colorPrimary: '#6366F1',
    colorPrimaryDark: '#4F46E5',
    colorPrimaryLight: '#EEF2FF',
    colorSecondary: '#0F172A',
    colorSecondaryLight: '#1E293B',
    colorAccent: '#818CF8',
    colorBackground: '#F8FAFC',
    colorSurface: '#F1F5F9',
    colorCard: '#FFFFFF',
    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    colorTextMuted: '#94A3B8',
    colorBorder: '#E2E8F0',
  },
  carbon: {
    colorPrimary: '#10B981',
    colorPrimaryDark: '#059669',
    colorPrimaryLight: '#ECFDF5',
    colorSecondary: '#111827',
    colorSecondaryLight: '#1F2937',
    colorAccent: '#34D399',
    colorBackground: '#F9FAFB',
    colorSurface: '#F3F4F6',
    colorCard: '#FFFFFF',
    colorText: '#111827',
    colorTextSecondary: '#4B5563',
    colorTextMuted: '#9CA3AF',
    colorBorder: '#E5E7EB',
  },
  titanium: {
    colorPrimary: '#E11D48',
    colorPrimaryDark: '#BE123C',
    colorPrimaryLight: '#FFF1F2',
    colorSecondary: '#1C1917',
    colorSecondaryLight: '#292524',
    colorAccent: '#FB7185',
    colorBackground: '#FAFAF9',
    colorSurface: '#F5F5F4',
    colorCard: '#FFFFFF',
    colorText: '#1C1917',
    colorTextSecondary: '#57534E',
    colorTextMuted: '#A8A29E',
    colorBorder: '#E7E5E4',
  },
}

/* ─── Context ─── */
interface BrandContextType {
  theme: BrandTheme
  isLoading: boolean
  updateTheme: (updates: Partial<BrandTheme>) => void
  applyPreset: (presetName: string) => void
}

const BrandContext = createContext<BrandContextType>({
  theme: DEFAULT_THEME,
  isLoading: true,
  updateTheme: () => {},
  applyPreset: () => {},
})

export function useBrand() {
  return useContext(BrandContext)
}

/* ─── CSS Variable Injector ─── */
function injectCSSVariables(theme: BrandTheme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Theme color variables
  root.style.setProperty('--color-primary', theme.colorPrimary)
  root.style.setProperty('--color-primary-dark', theme.colorPrimaryDark)
  root.style.setProperty('--color-primary-light', theme.colorPrimaryLight)
  root.style.setProperty('--color-secondary', theme.colorSecondary)
  root.style.setProperty('--color-secondary-light', theme.colorSecondaryLight)
  root.style.setProperty('--color-accent', theme.colorAccent)
  root.style.setProperty('--color-background', theme.colorBackground)
  root.style.setProperty('--color-surface', theme.colorSurface)
  root.style.setProperty('--color-card', theme.colorCard)
  root.style.setProperty('--color-text', theme.colorText)
  root.style.setProperty('--color-text-secondary', theme.colorTextSecondary)
  root.style.setProperty('--color-text-muted', theme.colorTextMuted)
  root.style.setProperty('--color-border', theme.colorBorder)
  root.style.setProperty('--color-success', theme.colorSuccess)
  root.style.setProperty('--color-warning', theme.colorWarning)
  root.style.setProperty('--color-danger', theme.colorDanger)
  root.style.setProperty('--color-info', theme.colorInfo)

  // Brand tokens (for backward compatibility)
  root.style.setProperty('--color-brand-primary', theme.colorPrimary)
  root.style.setProperty('--color-brand-primary-dark', theme.colorPrimaryDark)
  root.style.setProperty('--color-brand-primary-light', theme.colorPrimaryLight)
  root.style.setProperty('--color-brand-secondary', theme.colorSecondary)
  root.style.setProperty('--color-brand-secondary-light', theme.colorSecondaryLight)
  root.style.setProperty('--color-brand-accent', theme.colorAccent)
  root.style.setProperty('--color-brand-surface', theme.colorSurface)
  root.style.setProperty('--color-brand-text', theme.colorText)
  root.style.setProperty('--color-brand-text-secondary', theme.colorTextSecondary)
  root.style.setProperty('--color-brand-text-muted', theme.colorTextMuted)
  root.style.setProperty('--color-brand-border', theme.colorBorder)
  root.style.setProperty('--color-brand-success', theme.colorSuccess)
  root.style.setProperty('--color-brand-danger', theme.colorDanger)

  // Meta
  if (theme.brandName) {
    document.title = document.title.replace(/MağazaVitrin/g, theme.brandName)
  }
}

/* ─── Settings API -> Theme Mapper ─── */
function mapSettingsToTheme(settings: Record<string, string>): BrandTheme {
  const theme = { ...DEFAULT_THEME }

  // Brand identity fields
  if (settings.brand_name) theme.brandName = settings.brand_name
  if (settings.brand_short_name) theme.brandShortName = settings.brand_short_name
  if (settings.brand_slogan) theme.brandSlogan = settings.brand_slogan
  if (settings.brand_description) theme.brandDescription = settings.brand_description
  if (settings.brand_logo) theme.brandLogo = settings.brand_logo
  if (settings.brand_logo_dark) theme.brandLogoDark = settings.brand_logo_dark
  if (settings.brand_mobile_logo) theme.brandMobileLogo = settings.brand_mobile_logo
  if (settings.brand_footer_logo) theme.brandFooterLogo = settings.brand_footer_logo
  if (settings.brand_favicon) theme.brandFavicon = settings.brand_favicon
  if (settings.default_product_image) theme.defaultProductImage = settings.default_product_image
  if (settings.default_category_image) theme.defaultCategoryImage = settings.default_category_image
  if (settings.default_store_image) theme.defaultStoreImage = settings.default_store_image

  // Theme color fields
  if (settings.theme_color_primary) theme.colorPrimary = settings.theme_color_primary
  if (settings.theme_color_primary_dark) theme.colorPrimaryDark = settings.theme_color_primary_dark
  if (settings.theme_color_primary_light) theme.colorPrimaryLight = settings.theme_color_primary_light
  if (settings.theme_color_secondary) theme.colorSecondary = settings.theme_color_secondary
  if (settings.theme_color_secondary_light) theme.colorSecondaryLight = settings.theme_color_secondary_light
  if (settings.theme_color_accent) theme.colorAccent = settings.theme_color_accent
  if (settings.theme_color_background) theme.colorBackground = settings.theme_color_background
  if (settings.theme_color_surface) theme.colorSurface = settings.theme_color_surface
  if (settings.theme_color_card) theme.colorCard = settings.theme_color_card
  if (settings.theme_color_text) theme.colorText = settings.theme_color_text
  if (settings.theme_color_text_secondary) theme.colorTextSecondary = settings.theme_color_text_secondary
  if (settings.theme_color_text_muted) theme.colorTextMuted = settings.theme_color_text_muted
  if (settings.theme_color_border) theme.colorBorder = settings.theme_color_border
  if (settings.theme_color_success) theme.colorSuccess = settings.theme_color_success
  if (settings.theme_color_warning) theme.colorWarning = settings.theme_color_warning
  if (settings.theme_color_danger) theme.colorDanger = settings.theme_color_danger
  if (settings.theme_color_info) theme.colorInfo = settings.theme_color_info
  if (settings.theme_name) theme.themeName = settings.theme_name

  // Apply preset if set and no custom colors
  if (settings.theme_preset && THEME_PRESETS[settings.theme_preset]) {
    const preset = THEME_PRESETS[settings.theme_preset]
    // Only apply preset colors if no custom colors are set
    if (!settings.theme_color_primary && preset.colorPrimary) {
      Object.assign(theme, preset)
    }
    theme.themeName = settings.theme_preset
  }

  return theme
}

/* ─── Provider Component ─── */
export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<BrandTheme>(DEFAULT_THEME)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          const flat: Record<string, string> = {}
          if (data && typeof data === 'object') {
            for (const [, items] of Object.entries(data)) {
              if (typeof items === 'object' && items !== null) {
                Object.assign(flat, items as Record<string, string>)
              }
            }
          }
          const mapped = mapSettingsToTheme(flat)
          setTheme(mapped)
          injectCSSVariables(mapped)
        }
      } catch {
        // Use default theme on error
        injectCSSVariables(DEFAULT_THEME)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  // Inject CSS variables whenever theme changes
  useEffect(() => {
    if (!isLoading) {
      injectCSSVariables(theme)
    }
  }, [theme, isLoading])

  const updateTheme = useCallback((updates: Partial<BrandTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }))
  }, [])

  const applyPreset = useCallback((presetName: string) => {
    const preset = THEME_PRESETS[presetName]
    if (preset) {
      setTheme(prev => ({
        ...prev,
        ...preset,
        themeName: presetName,
      }))
    }
  }, [])

  return (
    <BrandContext.Provider value={{ theme, isLoading, updateTheme, applyPreset }}>
      {children}
    </BrandContext.Provider>
  )
}
