---
Task ID: 1
Agent: Main
Task: Clear all old database data and rebuild from scratch

Work Log:
- Deleted db/custom.db
- Ran `bun run db:push` to recreate schema
- Verified empty database ready for fresh scraping

Stage Summary:
- Database fully reset, all tables recreated clean
---
Task ID: 2
Agent: Main + Sub-agents
Task: Fix all critical bugs (images, search, SEO, new tabs, scraper improvements)

Work Log:
- Created /api/image-proxy endpoint for external image URLs (bypasses hotlink protection)
- Added proxyImageUrl() utility in storefront-utils.ts
- Updated product-card.tsx and product-detail-page.tsx to use image proxy
- Updated next.config.ts with image remotePatterns
- Rewrote /api/search with Turkish character support, case-insensitive search, category/brand cross-search
- Added live search suggestions dropdown in storefront-header.tsx
- Changed search placeholder to "Parça, model veya marka ara..."
- Added target="_blank" to product card links
- Improved product name generation in scraper (partCode + description for SEO)
- Added price=0 skip in scraper's saveProducts()
- Added auto-publish for products with stock>0 during scraping
- Added auto-update for published products on re-scrape (price/stock/isActive)
- Added zeroPriceSkipped and autoPublished counters
- Created /api/scraper/scheduler endpoint for nightly updates
- Optimized product/category/brand pages: replaced API calls with direct DB queries
- Fixed empty image URL filtering in scraper
- Removed seed blocking from storefront layout (always show site)

Stage Summary:
- MOTOLUX scraper: 10,393 products scraped, 0 errors, 6,346 auto-published (stock>0)
- Total products: 10,385 (6,346 active, 4,039 inactive/no stock)
- 104 categories, 43 brands, 1 store (MOTOLUX)
- Product page speed: 30s → 0.38s (80x faster)
- Image proxy working: 200 OK, images loading correctly
- Search: case-insensitive, Turkish chars, live suggestions
- All pages loading in under 1 second
