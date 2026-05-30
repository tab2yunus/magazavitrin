import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Seed endpoint - populates database with demo data
export async function POST() {
  try {
    // Clear existing data
    await db.$transaction([
      db.orderItem.deleteMany(),
      db.order.deleteMany(),
      db.cartItem.deleteMany(),
      db.cart.deleteMany(),
      db.comparison.deleteMany(),
      db.favorite.deleteMany(),
      db.review.deleteMany(),
      db.storeQuestion.deleteMany(),
      db.productImage.deleteMany(),
      db.productVariation.deleteMany(),
      db.productAttribute.deleteMany(),
      db.product.deleteMany(),
      db.store.deleteMany(),
      db.brand.deleteMany(),
      db.category.deleteMany(),
      db.banner.deleteMany(),
      db.campaign.deleteMany(),
      db.coupon.deleteMany(),
      db.siteSetting.deleteMany(),
      db.seoSetting.deleteMany(),
      db.user.deleteMany(),
    ])

    // ─── USERS ─────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const superAdmin = await db.user.create({
      data: { email: 'admin@magazavitrin.com', name: 'Admin Yönetici', password: hashedPassword, role: 'super_admin', phone: '0532 111 2233' }
    })
    const editor = await db.user.create({
      data: { email: 'editor@magazavitrin.com', name: 'Editör Kullanıcı', password: hashedPassword, role: 'editor', phone: '0533 222 3344' }
    })
    
    const customers = []
    const customerNames = ['Ayşe Yılmaz', 'Mehmet Kaya', 'Zeynep Demir', 'Ali Çelik', 'Fatma Şahin']
    for (let i = 0; i < customerNames.length; i++) {
      const c = await db.user.create({
        data: { email: `musteri${i+1}@test.com`, name: customerNames[i], password: hashedPassword, role: 'customer', phone: `053${i+2} 555 66${i+1}7` }
      })
      customers.push(c)
    }

    // ─── CATEGORIES ─────────────────────────────────────
    const catData = [
      { name: 'Elektronik', slug: 'elektronik', icon: '💻', children: [
        { name: 'Cep Telefonu', slug: 'cep-telefonu', icon: '📱' },
        { name: 'Laptop', slug: 'laptop', icon: '💻' },
        { name: 'Tablet', slug: 'tablet', icon: '📲' },
        { name: 'Televizyon', slug: 'televizyon', icon: '📺' },
        { name: 'Kulaklık & Hoparlör', slug: 'kulaklik-hoparlör', icon: '🎧' },
      ]},
      { name: 'Moda', slug: 'moda', icon: '👗', children: [
        { name: 'Kadın Giyim', slug: 'kadin-giyim', icon: '👚' },
        { name: 'Erkek Giyim', slug: 'erkek-giyim', icon: '👔' },
        { name: 'Ayakkabı', slug: 'ayakkabi', icon: '👟' },
        { name: 'Çanta', slug: 'canta', icon: '👜' },
      ]},
      { name: 'Ev & Yaşam', slug: 'ev-yasam', icon: '🏠', children: [
        { name: 'Mobilya', slug: 'mobilya', icon: '🛋️' },
        { name: 'Mutfak', slug: 'mutfak', icon: '🍳' },
        { name: 'Banyo', slug: 'banyo', icon: '🚿' },
      ]},
      { name: 'Spor & Outdoor', slug: 'spor-outdoor', icon: '⚽', children: [
        { name: 'Spor Giyim', slug: 'spor-giyim', icon: '🩳' },
        { name: 'Fitness', slug: 'fitness', icon: '🏋️' },
      ]},
      { name: 'Kozmetik', slug: 'kozmetik', icon: '💄', children: [
        { name: 'Makyaj', slug: 'makyaj', icon: '💋' },
        { name: 'Cilt Bakımı', slug: 'cilt-bakimi', icon: '🧴' },
      ]},
    ]

    const allCategories: any[] = []
    for (const cat of catData) {
      const parent = await db.category.create({
        data: { name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: allCategories.length }
      })
      allCategories.push(parent)
      for (const child of cat.children) {
        const c = await db.category.create({
          data: { name: child.name, slug: child.slug, icon: child.icon, parentId: parent.id, sortOrder: allCategories.length }
        })
        allCategories.push(c)
      }
    }

    // ─── BRANDS ─────────────────────────────────────────
    const brandNames = ['TechPro', 'StyleMax', 'HomeLux', 'FitLife', 'BeautyGlow', 'VoltEdge', 'UrbanWear', 'FreshHome', 'SportX', 'PureCare']
    const brands: any[] = []
    for (const name of brandNames) {
      const b = await db.brand.create({
        data: { name, slug: name.toLowerCase().replace(/\s/g, '-'), description: `${name} - Kaliteli ve güvenilir marka` }
      })
      brands.push(b)
    }

    // ─── STORES ─────────────────────────────────────────
    const storeData = [
      { name: 'TechDünyası', slug: 'techdunyasi', city: 'İstanbul', category: 'Elektronik', rating: 4.8, followerCount: 15420, salesCount: 8930 },
      { name: 'ModaEvreni', slug: 'modaevreni', city: 'İstanbul', category: 'Moda', rating: 4.6, followerCount: 22100, salesCount: 12450 },
      { name: 'EvMerkezi', slug: 'evmerkezi', city: 'Ankara', category: 'Ev & Yaşam', rating: 4.7, followerCount: 8900, salesCount: 5670 },
      { name: 'SporLand', slug: 'sporland', city: 'İzmir', category: 'Spor', rating: 4.5, followerCount: 6700, salesCount: 3200 },
      { name: 'GüzellikRüyası', slug: 'guzellikruyasi', city: 'İstanbul', category: 'Kozmetik', rating: 4.9, followerCount: 31200, salesCount: 18700 },
      { name: 'GadgetPro', slug: 'gadgetpro', city: 'Bursa', category: 'Elektronik', rating: 4.4, followerCount: 5400, salesCount: 2100 },
      { name: 'StilButik', slug: 'stilbutik', city: 'Antalya', category: 'Moda', rating: 4.3, followerCount: 3800, salesCount: 1500 },
      { name: 'YuvaMarket', slug: 'yuvamarket', city: 'İstanbul', category: 'Ev & Yaşam', rating: 4.6, followerCount: 9200, salesCount: 4800 },
    ]
    const stores: any[] = []
    for (const s of storeData) {
      const store = await db.store.create({
        data: {
          name: s.name, slug: s.slug, city: s.city, category: s.category,
          rating: s.rating, followerCount: s.followerCount, salesCount: s.salesCount,
          description: `${s.name}, ${s.city} merkezli ${s.category} sektöründe hizmet veren güvenilir mağaza.`,
          seoTitle: `${s.name} - ${s.category} Mağazası`, seoDescription: `${s.name} mağazasından ${s.category} ürünleri satın alın.`,
        }
      })
      stores.push(store)
    }

    // ─── PRODUCTS ────────────────────────────────────────
    const productTemplates = [
      { name: 'iPhone 15 Pro Max 256GB', cat: 'cep-telefonu', brand: 'TechPro', store: 'techdunyasi', price: 64999, discount: 59999, stock: 45, featured: true, bestSeller: true, isNew: true, ship: '1-2 gün' },
      { name: 'Samsung Galaxy S24 Ultra', cat: 'cep-telefonu', brand: 'VoltEdge', store: 'techdunyasi', price: 54999, discount: 49999, stock: 32, featured: true, bestSeller: true, isNew: true, ship: '1-2 gün' },
      { name: 'MacBook Air M3 15"', cat: 'laptop', brand: 'TechPro', store: 'gadgetpro', price: 52999, discount: 48999, stock: 18, featured: true, bestSeller: false, isNew: true, ship: '2-3 gün' },
      { name: 'Lenovo IdeaPad Gaming 3', cat: 'laptop', brand: 'VoltEdge', store: 'techdunyasi', price: 27999, discount: 24999, stock: 25, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'iPad Air M2 256GB', cat: 'tablet', brand: 'TechPro', store: 'techdunyasi', price: 24999, discount: 22999, stock: 30, featured: true, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Samsung 65" QLED 4K TV', cat: 'televizyon', brand: 'VoltEdge', store: 'evmerkezi', price: 32999, discount: 28999, stock: 12, featured: false, bestSeller: true, isNew: false, ship: '3-5 gün' },
      { name: 'Sony WH-1000XM5 Kulaklık', cat: 'kulaklik-hoparlör', brand: 'VoltEdge', store: 'techdunyasi', price: 9999, discount: 7999, stock: 55, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'JBL Charge 5 Bluetooth Hoparlör', cat: 'kulaklik-hoparlör', brand: 'TechPro', store: 'gadgetpro', price: 4499, discount: 3799, stock: 40, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Kadın Yazlık Elbise', cat: 'kadin-giyim', brand: 'StyleMax', store: 'modaevreni', price: 899, discount: 599, stock: 120, featured: true, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Erkek Slim Fit Gömlek', cat: 'erkek-giyim', brand: 'UrbanWear', store: 'stilbutik', price: 599, discount: 449, stock: 85, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Spor Ayakkabı Air Max', cat: 'ayakkabi', brand: 'SportX', store: 'sporland', price: 2999, discount: 2199, stock: 60, featured: true, bestSeller: true, isNew: false, ship: '2-3 gün' },
      { name: 'Deri Sırt Çantası', cat: 'canta', brand: 'StyleMax', store: 'modaevreni', price: 1499, discount: 1199, stock: 35, featured: false, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Koltuk Takımı 3+2', cat: 'mobilya', brand: 'HomeLux', store: 'evmerkezi', price: 18999, discount: 14999, stock: 5, featured: true, bestSeller: false, isNew: false, ship: '7-10 gün' },
      { name: 'Robot Süpürge Pro', cat: 'mutfak', brand: 'FreshHome', store: 'yuvamarket', price: 8999, discount: 6999, stock: 22, featured: true, bestSeller: true, isNew: true, ship: '2-3 gün' },
      { name: 'Banyo Dolabı Seti', cat: 'banyo', brand: 'HomeLux', store: 'evmerkezi', price: 5999, discount: 4799, stock: 8, featured: false, bestSeller: false, isNew: false, ship: '5-7 gün' },
      { name: 'Yoga Matı Premium', cat: 'fitness', brand: 'FitLife', store: 'sporland', price: 399, discount: 299, stock: 150, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Dambıl Seti 20kg', cat: 'fitness', brand: 'SportX', store: 'sporland', price: 1299, discount: 999, stock: 40, featured: false, bestSeller: true, isNew: false, ship: '2-3 gün' },
      { name: 'Elastik Band Seti', cat: 'spor-giyim', brand: 'FitLife', store: 'sporland', price: 199, discount: 149, stock: 200, featured: false, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Vitamin C Serum', cat: 'cilt-bakimi', brand: 'BeautyGlow', store: 'guzellikruyasi', price: 299, discount: 199, stock: 180, featured: true, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Kore Cilt Bakım Seti', cat: 'cilt-bakimi', brand: 'PureCare', store: 'guzellikruyasi', price: 599, discount: 449, stock: 90, featured: true, bestSeller: true, isNew: true, ship: '1-2 gün' },
      { name: 'Makyaj Paleti 18 Renk', cat: 'makyaj', brand: 'BeautyGlow', store: 'guzellikruyasi', price: 399, discount: 299, stock: 110, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Fondöten Mat Bitiş', cat: 'makyaj', brand: 'PureCare', store: 'guzellikruyasi', price: 249, discount: 189, stock: 140, featured: false, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Air Fryer 5.5L', cat: 'mutfak', brand: 'FreshHome', store: 'yuvamarket', price: 2499, discount: 1899, stock: 35, featured: true, bestSeller: true, isNew: true, ship: '2-3 gün' },
      { name: 'Dijital Tartı Smart', cat: 'mutfak', brand: 'FreshHome', store: 'yuvamarket', price: 499, discount: 379, stock: 50, featured: false, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Xiaomi Redmi Note 13 Pro', cat: 'cep-telefonu', brand: 'VoltEdge', store: 'gadgetpro', price: 12999, discount: 10999, stock: 65, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Kadın Spor Tayt', cat: 'spor-giyim', brand: 'SportX', store: 'sporland', price: 399, discount: 299, stock: 95, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Bluetooth Kulakiçi Kulaklık', cat: 'kulaklik-hoparlör', brand: 'TechPro', store: 'gadgetpro', price: 599, discount: 399, stock: 80, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Akıllı Saat Pro', cat: 'elektronik', brand: 'TechPro', store: 'techdunyasi', price: 3999, discount: 2999, stock: 42, featured: true, bestSeller: true, isNew: true, ship: '1-2 gün' },
      { name: 'Kadın Trençkot', cat: 'kadin-giyim', brand: 'StyleMax', store: 'modaevreni', price: 1999, discount: 1499, stock: 28, featured: true, bestSeller: false, isNew: true, ship: '2-3 gün' },
      { name: 'Erkek Spor Ayakkabı', cat: 'ayakkabi', brand: 'UrbanWear', store: 'stilbutik', price: 1899, discount: 1399, stock: 55, featured: false, bestSeller: true, isNew: false, ship: '2-3 gün' },
      { name: 'Gaming Monitör 27" 144Hz', cat: 'elektronik', brand: 'VoltEdge', store: 'techdunyasi', price: 7999, discount: 6499, stock: 20, featured: true, bestSeller: false, isNew: true, ship: '2-3 gün' },
      { name: 'Mekanik Klavye RGB', cat: 'elektronik', brand: 'VoltEdge', store: 'gadgetpro', price: 1499, discount: 1199, stock: 35, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Kahve Makinesi Espresso', cat: 'mutfak', brand: 'FreshHome', store: 'yuvamarket', price: 5999, discount: 4799, stock: 15, featured: true, bestSeller: false, isNew: true, ship: '2-3 gün' },
      { name: 'Nem Alıcı 10L', cat: 'ev-yasam', brand: 'HomeLux', store: 'evmerkezi', price: 2999, discount: 2399, stock: 18, featured: false, bestSeller: false, isNew: true, ship: '2-3 gün' },
      { name: 'Çocuk Bebek Arabası', cat: 'ev-yasam', brand: 'HomeLux', store: 'yuvamarket', price: 4999, discount: 3999, stock: 10, featured: false, bestSeller: false, isNew: false, ship: '3-5 gün' },
      { name: 'Saç Düzleştirici', cat: 'kozmetik', brand: 'BeautyGlow', store: 'guzellikruyasi', price: 799, discount: 599, stock: 60, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Elektrikli Diş Fırçası', cat: 'kozmetik', brand: 'PureCare', store: 'guzellikruyasi', price: 599, discount: 449, stock: 70, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Dizüstü Stand Laptop', cat: 'laptop', brand: 'TechPro', store: 'gadgetpro', price: 34999, discount: 31999, stock: 8, featured: false, bestSeller: false, isNew: true, ship: '2-3 gün' },
      { name: 'Oyuncu Mouse Wireless', cat: 'elektronik', brand: 'VoltEdge', store: 'gadgetpro', price: 899, discount: 699, stock: 50, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Powerbank 20000mAh', cat: 'elektronik', brand: 'TechPro', store: 'techdunyasi', price: 499, discount: 349, stock: 100, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'USB-C Hub 7in1', cat: 'elektronik', brand: 'TechPro', store: 'gadgetpro', price: 399, discount: 299, stock: 65, featured: false, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Kadın Çanta Crossbody', cat: 'canta', brand: 'UrbanWear', store: 'stilbutik', price: 899, discount: 699, stock: 40, featured: false, bestSeller: false, isNew: true, ship: '1-2 gün' },
      { name: 'Yatak Örtüsü King Size', cat: 'mobilya', brand: 'HomeLux', store: 'evmerkezi', price: 1299, discount: 999, stock: 30, featured: false, bestSeller: false, isNew: false, ship: '2-3 gün' },
      { name: 'Halı Yıldız Desen', cat: 'mobilya', brand: 'FreshHome', store: 'yuvamarket', price: 1999, discount: 1599, stock: 15, featured: false, bestSeller: false, isNew: false, ship: '3-5 gün' },
      { name: 'Termos Bardak 500ml', cat: 'mutfak', brand: 'FreshHome', store: 'yuvamarket', price: 199, discount: 149, stock: 120, featured: false, bestSeller: true, isNew: false, ship: '1-2 gün' },
      { name: 'Erkek Kemer Deri', cat: 'erkek-giyim', brand: 'UrbanWear', store: 'stilbutik', price: 399, discount: 299, stock: 70, featured: false, bestSeller: false, isNew: false, ship: '1-2 gün' },
      { name: 'Kadın Bot Deri', cat: 'ayakkabi', brand: 'StyleMax', store: 'modaevreni', price: 2499, discount: 1899, stock: 25, featured: false, bestSeller: false, isNew: true, ship: '2-3 gün' },
      { name: 'Tablet Kılıfı 10"', cat: 'tablet', brand: 'TechPro', store: 'techdunyasi', price: 149, discount: 99, stock: 200, featured: false, bestSeller: false, isNew: false, ship: '1-2 gün' },
      { name: 'Smart TV 55" Android', cat: 'televizyon', brand: 'VoltEdge', store: 'evmerkezi', price: 16999, discount: 13999, stock: 14, featured: true, bestSeller: false, isNew: true, ship: '3-5 gün' },
    ]

    const products: any[] = []
    const placeholderImages = [
      'https://placehold.co/400x400/F27A1A/FFFFFF?text=',
    ]

    for (const pt of productTemplates) {
      const category = allCategories.find(c => c.slug === pt.cat)
      const brand = brands.find(b => b.name === pt.brand)
      const store = stores.find(s => s.slug === pt.store)
      
      if (!category || !brand || !store) continue

      const product = await db.product.create({
        data: {
          name: pt.name,
          slug: pt.name.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/g, '-').replace(/(^-|-$)/g, ''),
          sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          barcode: `868${Math.floor(Math.random() * 10000000000)}`,
          description: `${pt.name} - Yüksek kaliteli ürün. ${pt.brand} garantili. Hızlı kargo ile kapınıza kadar gelir.`,
          shortDescription: `${pt.name} - ${pt.brand} kalitesi`,
          normalPrice: pt.price,
          discountPrice: pt.discount,
          stock: pt.stock,
          shippingTime: pt.ship,
          isActive: true,
          isFeatured: pt.featured,
          isBestSeller: pt.bestSeller,
          isNew: pt.isNew,
          categoryId: category.id,
          brandId: brand.id,
          storeId: store.id,
          seoTitle: `${pt.name} - MağazaVitrin`,
          seoDescription: `${pt.name} en uygun fiyatla MağazaVitrin'de! Hızlı kargo, güvenli ödeme.`,
          images: {
            create: [
              { url: `https://placehold.co/600x600/F27A1A/FFFFFF?text=${encodeURIComponent(pt.name.slice(0, 15))}`, alt: pt.name, sortOrder: 0 },
              { url: `https://placehold.co/600x600/1A2744/FFFFFF?text=${encodeURIComponent(pt.name.slice(0, 15))}`, alt: pt.name, sortOrder: 1 },
              { url: `https://placehold.co/600x600/3CB371/FFFFFF?text=${encodeURIComponent(pt.name.slice(0, 15))}`, alt: pt.name, sortOrder: 2 },
            ]
          },
        },
        include: { images: true }
      })
      products.push(product)

      // Add some variations for certain products
      if (pt.cat === 'cep-telefonu' || pt.cat === 'tablet') {
        await db.productVariation.createMany({
          data: [
            { name: 'Renk', value: 'Siyah', productId: product.id, stock: Math.floor(pt.stock / 3), price: null },
            { name: 'Renk', value: 'Beyaz', productId: product.id, stock: Math.floor(pt.stock / 3), price: null },
            { name: 'Renk', value: 'Mavi', productId: product.id, stock: Math.floor(pt.stock / 3), price: null },
          ]
        })
      } else if (pt.cat === 'kadin-giyim' || pt.cat === 'erkek-giyim' || pt.cat === 'ayakkabi') {
        await db.productVariation.createMany({
          data: [
            { name: 'Beden', value: 'S', productId: product.id, stock: Math.floor(pt.stock / 4), price: null },
            { name: 'Beden', value: 'M', productId: product.id, stock: Math.floor(pt.stock / 4), price: null },
            { name: 'Beden', value: 'L', productId: product.id, stock: Math.floor(pt.stock / 4), price: null },
            { name: 'Beden', value: 'XL', productId: product.id, stock: Math.floor(pt.stock / 4), price: null },
          ]
        })
      }

      // Add attributes
      const attrs: { name: string; value: string }[] = []
      if (pt.cat === 'cep-telefonu') {
        attrs.push({ name: 'Ekran Boyutu', value: '6.7 inç' }, { name: 'RAM', value: '8 GB' }, { name: 'Depolama', value: '256 GB' }, { name: 'İşlemci', value: 'Son Nesil Chip' })
      } else if (pt.cat === 'laptop') {
        attrs.push({ name: 'Ekran Boyutu', value: '15.6 inç' }, { name: 'RAM', value: '16 GB' }, { name: 'SSD', value: '512 GB' }, { name: 'İşlemci', value: 'Son Nesil' })
      } else if (pt.cat === 'televizyon') {
        attrs.push({ name: 'Ekran Boyutu', value: '65 inç' }, { name: 'Çözünürlük', value: '4K UHD' }, { name: 'Panel Tipi', value: 'QLED' })
      } else if (pt.cat === 'kulaklik-hoparlör') {
        attrs.push({ name: 'Bağlantı', value: 'Bluetooth 5.3' }, { name: 'Pil Ömrü', value: '30 saat' }, { name: 'Gürültü Önleme', value: 'ANC' })
      } else if (pt.cat.includes('giyim') || pt.cat === 'ayakkabi') {
        attrs.push({ name: 'Malzeme', value: 'Premium Kumaş' }, { name: 'Menşei', value: 'Türkiye' })
      } else {
        attrs.push({ name: 'Garanti', value: '2 Yıl' }, { name: 'Menşei', value: 'İthalat' })
      }
      if (attrs.length > 0) {
        await db.productAttribute.createMany({ data: attrs.map(a => ({ ...a, productId: product.id })) })
      }
    }

    // ─── BANNERS ────────────────────────────────────────
    await db.banner.createMany({
      data: [
        { title: 'Yaz İndirimi', image: 'https://placehold.co/1200x400/F27A1A/FFFFFF?text=Yaz+Indirimi+%2530', link: '#', position: 'home_slider', sortOrder: 0, isActive: true },
        { title: 'Teknoloji Fırsatı', image: 'https://placehold.co/1200x400/1A2744/FFFFFF?text=Teknoloji+Firsati', link: '#', position: 'home_slider', sortOrder: 1, isActive: true },
        { title: 'Yeni Sezon', image: 'https://placehold.co/1200x400/3CB371/FFFFFF?text=Yeni+Sezon+Moda', link: '#', position: 'home_slider', sortOrder: 2, isActive: true },
        { title: 'Ev Kampanyası', image: 'https://placehold.co/600x250/1A2744/FFFFFF?text=Ev+Urunleri', link: '#', position: 'home_sidebar', sortOrder: 0, isActive: true },
        { title: 'Spor Ayakkabı', image: 'https://placehold.co/600x250/F27A1A/FFFFFF?text=Spor+Ayakkabi', link: '#', position: 'home_sidebar', sortOrder: 1, isActive: true },
      ]
    })

    // ─── CAMPAIGNS ───────────────────────────────────────
    await db.campaign.createMany({
      data: [
        { title: 'Elektronik Fırsatları', slug: 'elektronik-firsatlari', description: 'Elektronik ürünlerde büyük indirimler!', discountText: '%30\'a varan indirim', link: '#', isActive: true, sortOrder: 0 },
        { title: 'Moda Yeni Sezon', slug: 'moda-yeni-sezon', description: 'Yeni sezon moda ürünleri burada!', discountText: '%40\'a varan indirim', link: '#', isActive: true, sortOrder: 1 },
        { title: 'Ev & Yaşam Kampanyası', slug: 'ev-yasam-kampanyasi', description: 'Ev ürünlerinde cazip fiyatlar!', discountText: '%25\'e varan indirim', link: '#', isActive: true, sortOrder: 2 },
      ]
    })

    // ─── COUPONS ────────────────────────────────────────
    await db.coupon.createMany({
      data: [
        { code: 'HOSGELDIN', type: 'percentage', value: 10, minAmount: 100, maxDiscount: 500, usageLimit: 100, isActive: true },
        { code: 'YAZ2024', type: 'fixed', value: 50, minAmount: 200, usageLimit: 200, isActive: true },
        { code: 'FREEKARGO', type: 'fixed', value: 30, minAmount: 0, usageLimit: 500, isActive: true },
      ]
    })

    // ─── REVIEWS ────────────────────────────────────────
    const reviewComments = [
      { rating: 5, title: 'Harika ürün!', comment: 'Beklediğimden çok daha iyi, kesinlikle tavsiye ederim.' },
      { rating: 4, title: 'Güzel', comment: 'Kaliteli ürün, fiyat/performans oranı çok iyi.' },
      { rating: 5, title: 'Mükemmel', comment: 'Çok memnunum, hızlı kargo ve kaliteli paketleme.' },
      { rating: 3, title: 'İdare eder', comment: 'Fena değil ama beklediğim gibi değil.' },
      { rating: 4, title: 'İyi', comment: 'Genel olarak memnunum, tekrar alabilirim.' },
    ]
    for (let i = 0; i < 30; i++) {
      const rc = reviewComments[i % reviewComments.length]
      const p = products[Math.floor(Math.random() * products.length)]
      const c = customers[Math.floor(Math.random() * customers.length)]
      await db.review.create({
        data: { userId: c.id, productId: p.id, rating: rc.rating, title: rc.title, comment: rc.comment, isActive: true }
      })
    }

    // ─── DEMO ORDERS ────────────────────────────────────
    const statuses = ['pending', 'preparing', 'shipped', 'delivered']
    for (let i = 0; i < 8; i++) {
      const c = customers[Math.floor(Math.random() * customers.length)]
      const numItems = Math.floor(Math.random() * 3) + 1
      const orderProducts = products.slice(Math.floor(Math.random() * (products.length - numItems)), Math.floor(Math.random() * (products.length - numItems)) + numItems)
      const subtotal = orderProducts.reduce((sum, p) => sum + (p.discountPrice || p.normalPrice), 0)
      const shippingCost = subtotal > 200 ? 0 : 29.99
      
      const order = await db.order.create({
        data: {
          orderNumber: `MV${Date.now().toString().slice(-8)}${i}`,
          userId: c.id,
          status: statuses[i % statuses.length],
          paymentMethod: i % 3 === 0 ? 'cod' : i % 3 === 1 ? 'bank_transfer' : 'demo_payment',
          paymentStatus: i % 4 === 0 ? 'pending' : 'paid',
          subtotal,
          discountAmount: 0,
          shippingCost,
          totalAmount: subtotal + shippingCost,
          shippingAddress: `${c.name}, Atatürk Cad. No:${i+1}/5, Kadıköy, İstanbul`,
          notes: '',
          items: {
            create: orderProducts.map(p => ({
              productId: p.id,
              productName: p.name,
              quantity: 1,
              unitPrice: p.discountPrice || p.normalPrice,
              totalPrice: p.discountPrice || p.normalPrice,
            }))
          }
        }
      })
    }

    // ─── SITE SETTINGS ──────────────────────────────────
    await db.siteSetting.createMany({
      data: [
        { key: 'site_name', value: 'MağazaVitrin', type: 'text', group: 'general' },
        { key: 'site_description', value: 'Türkiye\'nin en büyük online alışveriş pazaryeri', type: 'textarea', group: 'general' },
        { key: 'contact_email', value: 'info@magazavitrin.com', type: 'text', group: 'general' },
        { key: 'contact_phone', value: '0850 123 45 67', type: 'text', group: 'general' },
        { key: 'free_shipping_min', value: '200', type: 'number', group: 'shipping' },
        { key: 'shipping_cost', value: '29.99', type: 'number', group: 'shipping' },
        { key: 'robots_txt', value: 'User-agent: *\nAllow: /', type: 'textarea', group: 'seo' },
      ]
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Demo veriler başarıyla oluşturuldu!',
      stats: {
        users: 7,
        stores: 8,
        brands: 10,
        categories: allCategories.length,
        products: products.length,
        banners: 5,
        campaigns: 3,
        coupons: 3,
        reviews: 30,
        orders: 8,
      },
      adminLogin: { email: 'admin@magazavitrin.com', password: 'password123' },
      customerLogin: { email: 'musteri1@test.com', password: 'password123' },
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
