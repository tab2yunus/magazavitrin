---
Task ID: 3-a
Agent: storefront-layout-transformer
Task: Transform header, footer, mobile nav to use dynamic theme system

Work Log:
- Removed hardcoded `const C = { ... }` object from storefront-header.tsx
- Imported `{ useBrand } from '@/lib/brand-context'` in all 4 files
- Added `const { theme } = useBrand()` at the top of each component
- Replaced all `C.primary` → `theme.colorPrimary`, `C.primaryDark` → `theme.colorPrimaryDark`, etc. in header
- Replaced hardcoded "Mağaza" + "Vitrin" with dynamic brand name split at camelCase boundary for two-color display
- Replaced hardcoded "Motosiklet Yedek Parça" subtitle with `theme.brandSlogan`
- Added settings fetch to header for dynamic phone/email in top bar
- Added brand logo support: if `theme.brandLogo` is set, show logo image instead of icon+text
- Updated `getCategoryIcon` to accept `primaryColor` parameter instead of referencing global `C`
- Replaced all hardcoded colors in storefront-footer.tsx with theme variables
- Replaced "Mağaza" + "Vitrin" with dynamic `theme.brandName` (camelCase split)
- Replaced hardcoded brand description with `theme.brandDescription`
- Updated copyright to prefer `theme.brandName`
- Added "Popüler Markalar" (Popular Brands) section as a new column in footer
- Changed footer grid from 4 columns to 5 columns to accommodate brands section
- Created `PopularBrands` component that fetches from `/api/brands`
- Replaced all hardcoded colors in mobile-bottom-nav.tsx with theme variables
- Made center search button use `theme.colorPrimary` with dynamic shadow
- Made active/inactive states use theme colors via inline styles
- Updated storefront layout.tsx to use `theme.colorBackground` and `theme.colorText` instead of `bg-white text-[#0F1B2D]`
- Added `useBrand` import to layout.tsx
- ESLint: 0 errors, 0 warnings
- Dev server: compiles successfully, all pages loading normally

Stage Summary:
- 4 files transformed to use dynamic brand theme system
- storefront-header.tsx: ~1045 lines, fully theme-aware with dynamic brand name, slogan, logo, phone/email
- storefront-footer.tsx: now has 5 columns with new Popular Brands section, all colors from theme
- mobile-bottom-nav.tsx: fully theme-aware with dynamic primary/muted/border colors
- layout.tsx: uses theme.colorBackground and theme.colorText for root wrapper
- All existing functionality preserved (search, suggestions, mega menu, mobile menu, cart, auth, etc.)
- Brand name displayed with two-color treatment: first part in primary, second part in secondary (camelCase split)
