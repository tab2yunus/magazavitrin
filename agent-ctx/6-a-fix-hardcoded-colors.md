# Task 6-a: Fix Hardcoded Colors

## Summary
Fixed all remaining hardcoded color values (#F27A1A and other hex colors) across the entire project.

## Category 1: Storefront files with `const C` objects
1. **storefront-footer.tsx** - `const C` already removed by prior agent; replaced remaining `C.xxx` references with `theme.colorXxx`
2. **storefront-header.tsx** - Removed `const C` object and replaced all `C.xxx` → `theme.colorXxx` (using replace_all)
3. **command-palette.tsx** - `const C` already removed by prior agent; replaced all `C.xxx` → `theme.colorXxx`

## Category 2: Admin components with hardcoded hex
All 12 admin components fixed:
- questions-tab.tsx
- coupons-tab.tsx
- dashboard-tab.tsx
- stores-tab.tsx
- banners-tab.tsx
- categories-tab.tsx
- orders-tab.tsx
- brands-tab.tsx
- campaigns-tab.tsx
- scraper-tab.tsx
- products-tab.tsx
- settings-tab.tsx (already using CSS vars for UI; hex values are data defaults)

## Color Mapping Applied
- `#F27A1A` → `var(--color-primary)`
- `#D4630E` / `#e06d10` → `var(--color-primary-dark)`
- `#FFF3E8` → `var(--color-primary-light)`
- `#0F1B2D` (as bg) → `var(--color-secondary)`
- `#0F1B2D` (as text) → `var(--color-text)`
- `#1B2D45` → `var(--color-secondary-light)`

## Verification
- `bun run lint` — 0 errors, 0 warnings
- Dev server compiling successfully
- No remaining hardcoded brand hex colors in any component file
