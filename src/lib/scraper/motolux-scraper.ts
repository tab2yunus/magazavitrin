import * as cheerio from 'cheerio'
import { db } from '@/lib/db'

// ─── TYPES ─────────────────────────────────────────────────
interface ScraperConfig {
  maxProducts?: number
  categoryFilter?: string[]
  delayMs?: number
}

interface ScrapedProduct {
  sourceProductId: string
  productName: string
  description: string | null
  category: string
  brand: string | null
  model: string | null
  sku: string | null
  barcode: string | null
  stock: number
  supplierPrice: number
  imageUrls: string[]
  sourceUrl: string
}

interface ScraperResult {
  totalScraped: number
  totalSaved: number
  totalDuplicates: number
  totalErrors: number
  zeroPriceSkipped: number
  autoPublished: number
  categories: number
  errors: string[]
}

// ─── CONSTANTS ─────────────────────────────────────────────
const BASE_URL = 'https://simmoto.com/bayi'
const LOGIN_URL = `${BASE_URL}/check`
const PRODUCTS_URL = `${BASE_URL}/yp_ord`
const DEFAULT_DELAY = 1500 // ms between requests

// ─── SESSION STATE ─────────────────────────────────────────
let sessionCookies = ''
let csrfToken = ''

// Helper to extract cookies from response
function extractCookies(setCookieHeaders: string[]): string {
  return setCookieHeaders.map(c => c.split(';')[0].trim()).join('; ')
}

function mergeCookies(existing: string, incoming: string): string {
  const all = [existing, incoming].filter(Boolean).join('; ')
  const map: Record<string, string> = {}
  all.split('; ').forEach(c => {
    const idx = c.indexOf('=')
    if (idx > 0) {
      map[c.substring(0, idx)] = c.substring(idx + 1)
    }
  })
  return Object.entries(map).map(([k, v]) => `${k}=${v}`).join('; ')
}

// ─── HELPERS ───────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function parseTurkishPrice(raw: string): number {
  // "Fiyat: 1.007,98 TL" → 1007.98
  const cleaned = raw.replace(/Fiyat:\s*/i, '').replace(/\s*TL/i, '').trim()
  if (!cleaned) return 0
  // Turkish format: dot=thousands, comma=decimal
  const noThousands = cleaned.replace(/\./g, '')
  const withDot = noThousands.replace(',', '.')
  const num = parseFloat(withDot)
  return isNaN(num) ? 0 : Math.round(num * 100) / 100
}

function toUpperCaseTurkish(str: string): string {
  // Preserve Turkish character uppercasing
  return str
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .replace(/ş/g, 'Ş')
    .replace(/ç/g, 'Ç')
    .replace(/ü/g, 'Ü')
    .replace(/ö/g, 'Ö')
    .replace(/ğ/g, 'Ğ')
    .toUpperCase()
}

function slugify(str: string): string {
  // Convert TR chars to ASCII, lowercase, replace non-alnum with dash
  return str
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Alias for backwards compatibility
const slugifyNoTR = slugify

// Helper: generate unique slug for Product
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  return slug
}

function extractModelFromCategory(category: string): string | null {
  // Category like "AFRİKA KING (49 CC)" → extract model name
  const match = category.match(/^(.+?)(?:\s*\((\d+)\s*(?:CC|cc)\))?$/)
  if (match) {
    return match[1].trim() || null
  }
  return null
}

function extractBrandFromPartCode(partCode: string): string | null {
  // Part code like "AFRİKA-K50093" → brand prefix before "-"
  const match = partCode.match(/^([A-ZÇĞİÖŞÜİ]+)/i)
  return match ? toUpperCaseTurkish(match[1]) : null
}

// ─── HTTP CLIENT ───────────────────────────────────────────
async function fetchPage(url: string, method: string = 'GET', body?: Record<string, string>): Promise<string> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
  }

  if (sessionCookies) {
    headers['Cookie'] = sessionCookies
  }

  if (method === 'POST' && body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    headers['Referer'] = url
  }

  const response = await fetch(url, {
    method,
    headers,
    body: method === 'POST' && body ? new URLSearchParams(body).toString() : undefined,
    redirect: 'manual',
  })

  // Capture cookies from response
  const setCookies = response.headers.getSetCookie?.() || []
  if (setCookies.length > 0) {
    const incoming = extractCookies(setCookies)
    sessionCookies = mergeCookies(sessionCookies, incoming)
  }

  // Handle redirects manually to preserve cookies
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location')
    if (location) {
      const redirectUrl = location.startsWith('http') ? location : `${BASE_URL}/${location.replace(/^\//, '')}`
      return fetchPage(redirectUrl)
    }
  }

  return response.text()
}

// ─── LOGIN ─────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<boolean> {
  try {
    // First, get the login page to obtain CSRF token and session cookie
    const loginPageHtml = await fetchPage(`${BASE_URL}/login`)
    const $ = cheerio.load(loginPageHtml)

    // Extract CSRF token from hidden form field
    csrfToken = $('input[name="_token"]').attr('value') || $('meta[name="csrf-token"]').attr('content') || ''
    console.log('[MOTOLUX] CSRF token:', csrfToken ? csrfToken.substring(0, 20) + '...' : 'NOT FOUND')

    // Login with correct field names (user_code + password)
    const dashboardHtml = await fetchPage(LOGIN_URL, 'POST', {
      user_code: username,
      password: password,
      _token: csrfToken,
    })

    // Check if login was successful
    const hasDashboard = dashboardHtml.includes('YP Sipariş') || dashboardHtml.includes('yp_ord') || dashboardHtml.includes('Garanti') || dashboardHtml.includes('Oturumu Kapat')

    if (!hasDashboard) {
      console.error('[MOTOLUX] Login failed - dashboard not detected')
      console.error('[MOTOLUX] Response preview:', dashboardHtml.substring(0, 200))
      return false
    }

    // Update CSRF token from dashboard
    const $$ = cheerio.load(dashboardHtml)
    const newToken = $$('meta[name="csrf-token"]').attr('content') || $$('input[name="_token"]').attr('value')
    if (newToken) csrfToken = newToken

    console.log('[MOTOLUX] Login successful, cookies:', sessionCookies ? 'present' : 'none')
    return true
  } catch (error) {
    console.error('[MOTOLUX] Login error:', error)
    return false
  }
}

// ─── FETCH CATEGORIES ──────────────────────────────────────
export async function fetchCategories(): Promise<string[]> {
  try {
    const html = await fetchPage(PRODUCTS_URL)
    const $ = cheerio.load(html)

    // Update CSRF token
    const newToken = $('meta[name="csrf-token"]').attr('content')
    if (newToken) csrfToken = newToken

    const categories: string[] = []
    $('#secim option').each((_, el) => {
      const value = $(el).attr('value')
      if (value && value.trim()) {
        categories.push(value.trim())
      }
    })

    console.log(`[MOTOLUX] Found ${categories.length} categories`)
    return categories
  } catch (error) {
    console.error('[MOTOLUX] Fetch categories error:', error)
    return []
  }
}

// ─── FETCH PRODUCTS FOR CATEGORY ───────────────────────────
export async function fetchProductsByCategory(category: string): Promise<ScrapedProduct[]> {
  try {
    const encodedCategory = encodeURIComponent(category)
    const url = `${PRODUCTS_URL}?kategori=${encodedCategory}`
    const html = await fetchPage(url)
    const $ = cheerio.load(html)

    // Update CSRF token
    const newToken = $('meta[name="csrf-token"]').attr('content')
    if (newToken) csrfToken = newToken

    const products: ScrapedProduct[] = []
    const cards = $('.card.atadiv')

    cards.each((_, card) => {
      try {
        const $card = $(card)

        // Image
        const imgEl = $card.find('img')
        let imgUrl = imgEl.attr('src') || ''
        const isPlaceholder = imgUrl.includes('motoluxofficial')
        if (imgUrl && !imgUrl.startsWith('http')) {
          imgUrl = `${BASE_URL}/${imgUrl.replace(/^\.\//, '')}`
        }

        // Part code (product code)
        const partCode = $card.find('.aramadivi10').text().trim()

        // Description
        const description = $card.find('.aramadivi20').text().trim() || null

        // Price - find the card-text that contains "Fiyat:"
        let priceText = ''
        $card.find('.card-text').each((_, el) => {
          const txt = $(el).text().trim()
          if (txt.includes('Fiyat:')) {
            priceText = txt
          }
        })
        const price = parseTurkishPrice(priceText)

        // Stock status
        const inStockBtn = $card.find('button').filter((_, el) => $(el).text().includes('Sepete Ekle'))
        const outOfStockBtn = $card.find('button').filter((_, el) => $(el).text().includes('Gelince Haber Et'))
        const inStock = inStockBtn.length > 0

        // System IDs
        const parcano = inStockBtn.attr('data-parcano') || outOfStockBtn.attr('data-logical') || ''
        const carino = inStockBtn.attr('data-carino') || outOfStockBtn.attr('data-bayi') || ''

        // Use parcano as sourceProductId (it's the system internal ID)
        const sourceProductId = parcano || partCode

        // Extract brand and model
        const brand = extractBrandFromPartCode(partCode)
        const model = extractModelFromCategory(category)

        // SKU is the part code itself (e.g., AFRİKA-K50093)
        const sku = partCode || null

        if (partCode) {
          // Build a more descriptive product name for SEO
          let productName = partCode
          if (description) {
            // Combine part code with description for SEO
            productName = `${partCode} ${description}`
          } else if (model) {
            // If no description but we have model info, prepend it
            productName = `${model} ${partCode}`
          }
          productName = toUpperCaseTurkish(productName)

          products.push({
            sourceProductId,
            productName,
            description: description ? toUpperCaseTurkish(description) : null,
            category: toUpperCaseTurkish(category),
            brand,
            model: model ? toUpperCaseTurkish(model) : null,
            sku: toUpperCaseTurkish(sku || ''),
            barcode: null, // MOTOLUX doesn't show barcode
            stock: inStock ? 1 : 0,
            supplierPrice: price,
            imageUrls: isPlaceholder ? [] : [imgUrl],
            sourceUrl: url,
          })
        }
      } catch (err) {
        console.error('[MOTOLUX] Card parse error:', err)
      }
    })

    console.log(`[MOTOLUX] Category "${category}": ${products.length} products`)
    return products
  } catch (error) {
    console.error(`[MOTOLUX] Fetch products error for "${category}":`, error)
    return []
  }
}

// ─── SAVE PRODUCTS ─────────────────────────────────────────
async function saveProducts(products: ScrapedProduct[]): Promise<{ saved: number; duplicates: number; errors: number; zeroPriceSkipped: number; autoPublished: number }> {
  let saved = 0
  let duplicates = 0
  let errors = 0
  let zeroPriceSkipped = 0
  let autoPublished = 0

  // Default markup for auto-publish (30%)
  const markupMultiplier = 1.3

  for (const product of products) {
    try {
      // Skip products with zero or negative price
      if (product.supplierPrice <= 0) {
        console.log(`[MOTOLUX] Skipping zero-price product: ${product.sourceProductId}`)
        zeroPriceSkipped++
        continue
      }

      // Check for duplicates by sourceProductId
      const existing = await db.importedProduct.findUnique({
        where: { sourceProductId: product.sourceProductId },
      })

      if (existing) {
        // Update existing product
        await db.importedProduct.update({
          where: { sourceProductId: product.sourceProductId },
          data: {
            productName: product.productName,
            description: product.description,
            category: product.category,
            brand: product.brand,
            model: product.model,
            sku: product.sku,
            barcode: product.barcode,
            stock: product.stock,
            supplierPrice: product.supplierPrice,
            imageUrls: JSON.stringify(product.imageUrls),
            sourceUrl: product.sourceUrl,
          },
        })
        duplicates++

        // Auto-update the published product's stock, price, and active status
        if (existing.isPublished && existing.publishedProductId) {
          try {
            const normalPrice = Math.round(product.supplierPrice * markupMultiplier * 100) / 100

            await db.product.update({
              where: { id: existing.publishedProductId },
              data: {
                stock: product.stock,
                normalPrice,
                isActive: product.stock > 0, // Auto-activate if in stock, deactivate if not
              },
            })

            console.log(`[MOTOLUX] Auto-updated published product ${existing.publishedProductId}: stock=${product.stock}, price=${normalPrice}, isActive=${product.stock > 0}`)
          } catch (updateErr) {
            console.error(`[MOTOLUX] Auto-update error for published product ${existing.publishedProductId}:`, updateErr)
          }
        }
      } else {
        // Create new product
        const savedProduct = await db.importedProduct.create({
          data: {
            sourceSupplier: 'MOTOLUX',
            sourceProductId: product.sourceProductId,
            productName: product.productName,
            description: product.description,
            category: product.category,
            brand: product.brand,
            model: product.model,
            sku: product.sku,
            barcode: product.barcode,
            stock: product.stock,
            supplierPrice: product.supplierPrice,
            imageUrls: JSON.stringify(product.imageUrls),
            sourceUrl: product.sourceUrl,
          },
        })
        saved++

        // Auto-publish products with stock > 0
        if (product.stock > 0) {
          try {
            // Find or create Category
            let categoryId: string | null = null
            if (product.category) {
              const categorySlug = slugify(product.category)
              const existingCat = await db.category.findFirst({ where: { slug: categorySlug } })
              if (existingCat) {
                categoryId = existingCat.id
              } else {
                const newCat = await db.category.create({
                  data: { name: product.category, slug: categorySlug, isActive: true },
                })
                categoryId = newCat.id
              }
            }

            // Find or create Brand
            let brandId: string | null = null
            if (product.brand) {
              const brandSlug = slugify(product.brand)
              const existingBrand = await db.brand.findFirst({ where: { slug: brandSlug } })
              if (existingBrand) {
                brandId = existingBrand.id
              } else {
                const newBrand = await db.brand.create({
                  data: { name: product.brand, slug: brandSlug, isActive: true },
                })
                brandId = newBrand.id
              }
            }

            // Ensure MOTOLUX store exists
            let storeId: string | null = null
            const existingStore = await db.store.findFirst({ where: { slug: 'motolux' } })
            if (existingStore) {
              storeId = existingStore.id
            } else {
              const newStore = await db.store.create({
                data: {
                  name: 'MOTOLUX',
                  slug: 'motolux',
                  description: 'MOTOLUX motosiklet ve yedek parça',
                  city: 'İstanbul',
                  category: 'Otomotiv',
                  isActive: true,
                },
              })
              storeId = newStore.id
            }

            // Calculate retail price with markup
            const normalPrice = Math.round(product.supplierPrice * markupMultiplier * 100) / 100

            // Generate unique slug
            const baseSlug = slugify(product.productName)
            const productSlug = await generateUniqueSlug(baseSlug || `urun-${product.sourceProductId}`)

            // Create Product
            const newProduct = await db.product.create({
              data: {
                name: product.productName,
                slug: productSlug,
                sku: product.sku || product.sourceProductId,
                barcode: product.barcode,
                description: product.description || product.productName,
                shortDescription: product.description
                  ? (product.description.length > 120 ? product.description.substring(0, 120) + '...' : product.description)
                  : null,
                normalPrice,
                stock: product.stock,
                shippingTime: '1-3 İş Günü',
                isActive: true, // Auto-activate since stock > 0
                isFeatured: false,
                isBestSeller: false,
                isNew: true,
                brandId,
                categoryId,
                storeId,
              },
            })

            // Create ProductImages
            if (product.imageUrls && product.imageUrls.length > 0) {
              for (let i = 0; i < product.imageUrls.length; i++) {
                await db.productImage.create({
                  data: {
                    url: product.imageUrls[i],
                    alt: product.productName,
                    sortOrder: i,
                    productId: newProduct.id,
                  },
                })
              }
            }

            // Mark imported product as published
            await db.importedProduct.update({
              where: { id: savedProduct.id },
              data: {
                isPublished: true,
                publishedProductId: newProduct.id,
                publishedAt: new Date(),
              },
            })

            autoPublished++
            console.log(`[MOTOLUX] Auto-published ${product.sourceProductId} → Product ${newProduct.id}`)
          } catch (publishErr) {
            console.error(`[MOTOLUX] Auto-publish error for ${product.sourceProductId}:`, publishErr)
          }
        }
      }
    } catch (err) {
      console.error(`[MOTOLUX] Save error for ${product.sourceProductId}:`, err)
      errors++
    }
  }

  return { saved, duplicates, errors, zeroPriceSkipped, autoPublished }
}

// ─── MAIN SCRAPER RUNNER ───────────────────────────────────
export async function runScraper(config: ScraperConfig = {}): Promise<ScraperResult> {
  const { maxProducts = 0, categoryFilter, delayMs = DEFAULT_DELAY } = config
  const result: ScraperResult = {
    totalScraped: 0,
    totalSaved: 0,
    totalDuplicates: 0,
    totalErrors: 0,
    zeroPriceSkipped: 0,
    autoPublished: 0,
    categories: 0,
    errors: [],
  }

  // Create log entry
  const log = await db.scraperLog.create({
    data: {
      jobType: maxProducts > 0 ? 'test' : 'full',
      status: 'running',
    },
  })

  try {
    // 1. Login
    console.log('[MOTOLUX] Step 1: Logging in...')
    const loginSuccess = await login('25773', 'AY.3614')
    if (!loginSuccess) {
      throw new Error('Login failed')
    }

    // 2. Fetch categories
    console.log('[MOTOLUX] Step 2: Fetching categories...')
    await sleep(delayMs)
    let categories = await fetchCategories()
    if (!categories.length) {
      throw new Error('No categories found')
    }

    // Apply category filter
    if (categoryFilter && categoryFilter.length > 0) {
      categories = categories.filter(c => categoryFilter.includes(c))
    }

    result.categories = categories.length

    // 3. Fetch products for each category
    console.log(`[MOTOLUX] Step 3: Scraping ${categories.length} categories...`)

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]
      console.log(`[MOTOLUX] [${i + 1}/${categories.length}] Scraping: ${category}`)

      try {
        await sleep(delayMs)
        const products = await fetchProductsByCategory(category)

        if (products.length > 0) {
          result.totalScraped += products.length

          const saveResult = await saveProducts(products)
          result.totalSaved += saveResult.saved
          result.totalDuplicates += saveResult.duplicates
          result.totalErrors += saveResult.errors
          result.zeroPriceSkipped += saveResult.zeroPriceSkipped
          result.autoPublished += saveResult.autoPublished

          // Update log progress
          await db.scraperLog.update({
            where: { id: log.id },
            data: {
              totalScraped: result.totalScraped,
              totalSaved: result.totalSaved,
              totalDuplicates: result.totalDuplicates,
              totalErrors: result.totalErrors,
              categories: i + 1,
            },
          })
        }

        // Check max products limit
        if (maxProducts > 0 && result.totalScraped >= maxProducts) {
          console.log(`[MOTOLUX] Reached max product limit: ${maxProducts}`)
          break
        }
      } catch (err) {
        const errMsg = `Category "${category}" error: ${err}`
        result.errors.push(errMsg)
        result.totalErrors++
        console.error(`[MOTOLUX] ${errMsg}`)
      }
    }

    // Mark as completed
    await db.scraperLog.update({
      where: { id: log.id },
      data: {
        status: 'completed',
        totalScraped: result.totalScraped,
        totalSaved: result.totalSaved,
        totalDuplicates: result.totalDuplicates,
        totalErrors: result.totalErrors,
        categories: result.categories,
        completedAt: new Date(),
      },
    })

    console.log(`[MOTOLUX] Scraping completed: ${result.totalScraped} scraped, ${result.totalSaved} saved, ${result.totalDuplicates} duplicates, ${result.totalErrors} errors, ${result.zeroPriceSkipped} zero-price skipped, ${result.autoPublished} auto-published`)
  } catch (error) {
    const errMsg = `Fatal error: ${error}`
    result.errors.push(errMsg)

    await db.scraperLog.update({
      where: { id: log.id },
      data: {
        status: 'failed',
        errorMessage: errMsg,
        totalScraped: result.totalScraped,
        totalSaved: result.totalSaved,
        totalDuplicates: result.totalDuplicates,
        totalErrors: result.totalErrors,
        categories: result.categories,
        completedAt: new Date(),
      },
    })

    console.error(`[MOTOLUX] ${errMsg}`)
  }

  return result
}
