# Task 6-7: Fix MOTOLUX Scraper

**Agent**: Code Agent
**Status**: ✅ Completed

## Changes Made

### 1. `src/lib/scraper/motolux-scraper.ts`

- **ScraperResult interface**: Added `zeroPriceSkipped` and `autoPublished` counters
- **`slugify` function**: Renamed from `slugifyNoTR` (kept alias for backward compatibility)
- **`generateUniqueSlug` helper**: Added to generate unique slugs for auto-published products
- **`saveProducts` function**: Major enhancements:
  - **Price=0 skip**: Products with `supplierPrice <= 0` are now skipped with a console log and counter
  - **Auto-activate published products**: When an existing ImportedProduct is updated and is already published, the corresponding Product is automatically updated with new stock, recalculated price (30% markup), and `isActive = stock > 0`
  - **Auto-publish new products with stock>0**: New products with stock > 0 are automatically:
    1. Saved to ImportedProduct
    2. Published to Product (with auto-created Category, Brand, Store as needed)
    3. Marked as `isActive: true`
    4. ProductImages created from scraped URLs
    5. ImportedProduct marked as published
- **`runScraper` function**: Updated to track and display `zeroPriceSkipped` and `autoPublished` in the result and completion log

### 2. `src/components/admin/scraper-tab.tsx`

- Updated scrape result display grid from 5 columns to 7 columns
- Added "Fiyatsız Atla" (zero-price skipped) counter with gray color
- Added "Oto-Yayınla" (auto-published) counter with emerald color
- Both new counters use `?? 0` fallback for backward compatibility with old results

## Verification

- `bun run lint` passes with zero errors
- Dev server running and compiling successfully
