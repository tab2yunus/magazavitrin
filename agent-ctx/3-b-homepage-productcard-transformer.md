# Task 3-b: Homepage & Product Card Theme Transformation

## Summary
Transformed homepage and product card components from hardcoded color constants to the dynamic `useBrand()` theme system.

## Files Modified
1. `/home/z/my-project/src/components/storefront/home-page.tsx`
2. `/home/z/my-project/src/components/storefront/product-card.tsx`

## Key Changes

### home-page.tsx
- Removed `const C = { ... }` hardcoded color object
- Added `import { useBrand } from '@/lib/brand-context'` + `const { theme } = useBrand()`
- All 13 color tokens now use `theme.colorXxx` instead of `C.xxx`
- Hero heading uses `theme.brandName` dynamically
- Hero stats computed from actual data via `useMemo` (brands product counts, brand count, category count)
- MarqueeStrip uses its own `useBrand()` call
- CTA section uses `brand-gradient-primary` CSS class + `theme.brandName`
- Section backgrounds use `theme.colorCard` instead of `#FFFFFF`
- Banner overlays use `theme.colorSecondary` based dynamic values

### product-card.tsx
- Added `import { useBrand } from '@/lib/brand-context'` + `const { theme } = useBrand()`
- All hardcoded hex colors replaced with theme properties
- "İKİZ MOTOR" → `{theme.brandShortName}`
- "ORİJİNAL YEDEK PARÇA" → "YEDEK PARÇA"
- Box shadows use dynamic theme colors with alpha suffixes
- All hover effects preserved

## Verification
- `bun run lint` — 0 errors
- Dev server compiling successfully
- All functionality preserved
