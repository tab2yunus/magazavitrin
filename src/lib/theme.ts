/**
 * Centralized Theme Utility
 * Replaces all `const C = { ... }` objects across components.
 * All components should use `useBrand()` hook from brand-context.
 * For server-side or non-React contexts, use CSS variables directly.
 */

import { useBrand, type BrandTheme } from './brand-context'

/* ─── Hook to get theme colors as the old `C` pattern ─── */
export function useThemeColors() {
  const { theme } = useBrand()
  return {
    primary: theme.colorPrimary,
    primaryDark: theme.colorPrimaryDark,
    primaryLight: theme.colorPrimaryLight,
    secondary: theme.colorSecondary,
    secondaryLight: theme.colorSecondaryLight,
    accent: theme.colorAccent,
    surface: theme.colorSurface,
    background: theme.colorBackground,
    card: theme.colorCard,
    text: theme.colorText,
    textSecondary: theme.colorTextSecondary,
    textMuted: theme.colorTextMuted,
    border: theme.colorBorder,
    success: theme.colorSuccess,
    warning: theme.colorWarning,
    danger: theme.colorDanger,
    info: theme.colorInfo,
  } as const
}

/* ─── Hook to get brand identity ─── */
export function useBrandIdentity() {
  const { theme } = useBrand()
  return {
    brandName: theme.brandName,
    brandShortName: theme.brandShortName,
    brandSlogan: theme.brandSlogan,
    brandDescription: theme.brandDescription,
    brandLogo: theme.brandLogo,
    brandLogoDark: theme.brandLogoDark,
    brandMobileLogo: theme.brandMobileLogo,
    brandFooterLogo: theme.brandFooterLogo,
    brandFavicon: theme.brandFavicon,
    defaultProductImage: theme.defaultProductImage,
    defaultCategoryImage: theme.defaultCategoryImage,
    defaultStoreImage: theme.defaultStoreImage,
  }
}

/* ─── CSS Variable References (for use in style props without hooks) ─── */
export const cv = {
  primary: 'var(--color-primary)',
  primaryDark: 'var(--color-primary-dark)',
  primaryLight: 'var(--color-primary-light)',
  secondary: 'var(--color-secondary)',
  secondaryLight: 'var(--color-secondary-light)',
  accent: 'var(--color-accent)',
  background: 'var(--color-background)',
  surface: 'var(--color-surface)',
  card: 'var(--color-card)',
  text: 'var(--color-text)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted: 'var(--color-text-muted)',
  border: 'var(--color-border)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
} as const

/* ─── Tailwind CSS variable classes (for use in className props) ─── */
export const tc = {
  bgPrimary: 'bg-[var(--color-primary)]',
  bgPrimaryDark: 'bg-[var(--color-primary-dark)]',
  bgPrimaryLight: 'bg-[var(--color-primary-light)]',
  bgSecondary: 'bg-[var(--color-secondary)]',
  bgSecondaryLight: 'bg-[var(--color-secondary-light)]',
  bgAccent: 'bg-[var(--color-accent)]',
  bgSurface: 'bg-[var(--color-surface)]',
  bgCard: 'bg-[var(--color-card)]',
  bgBackground: 'bg-[var(--color-background)]',
  textPrimary: 'text-[var(--color-primary)]',
  textSecondary: 'text-[var(--color-secondary)]',
  textText: 'text-[var(--color-text)]',
  textTextSecondary: 'text-[var(--color-text-secondary)]',
  textTextMuted: 'text-[var(--color-text-muted)]',
  borderBorder: 'border-[var(--color-border)]',
  borderPrimary: 'border-[var(--color-primary)]',
} as const

/* ─── Re-export brand context ─── */
export { useBrand, DEFAULT_THEME, THEME_PRESETS } from './brand-context'
export type { BrandTheme } from './brand-context'
