#!/bin/bash
# MağazaVitrin VPS Deploy Script
# Bu script VPS'te çalıştırılmalıdır
# Kullanım: bash deploy-vps.sh

set -e

echo "🚀 MağazaVitrin VPS Deploy Başlıyor..."
echo "========================================"

# 1. Proje dizinine git
cd /opt/magazavitrin
echo "📁 Dizin: $(pwd)"

# 2. GitHub'dan son kodu çek
echo ""
echo "📥 GitHub'dan son kod çekiliyor..."
git fetch origin
git reset --hard origin/main
echo "✅ Kod güncellendi: $(git log --oneline -1)"

# 3. .next build klasörünü temizle
echo ""
echo "🧹 Eski build temizleniyor..."
rm -rf .next
echo "✅ .next klasörü silindi"

# 4. Bağımlılıkları yükle
echo ""
echo "📦 Bağımlılıklar yükleniyor..."
bun install
echo "✅ Bağımlılıklar yüklendi"

# 5. Prisma client oluştur
echo ""
echo "🔧 Prisma client oluşturuluyor..."
npx prisma generate
echo "✅ Prisma client oluşturuldu"

# 6. Database şemasını güncelle
echo ""
echo "🗄️ Database şeması güncelleniyor..."
npx prisma db push
echo "✅ Database şeması güncellendi"

# 7. Database dosya izinlerini düzelt
echo ""
echo "🔐 Database izinleri düzeltiliyor..."
chmod 666 db/custom.db 2>/dev/null || true
chmod 777 db/ 2>/dev/null || true
echo "✅ Database izinleri düzeltildi"

# 8. Production build
echo ""
echo "🏗️ Production build oluşturuluyor..."
bun run build
echo "✅ Build tamamlandı"

# 9. Build dosyalarını kontrol et
echo ""
echo "🔍 Build kontrol ediliyor..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ standalone/server.js mevcut"
else
    echo "❌ standalone/server.js bulunamadı!"
    exit 1
fi

if [ -d ".next/standalone/.next/static" ]; then
    echo "✅ static dosyalar kopyalanmış"
else
    echo "⚠️ static dosyalar kopyalanıyor..."
    mkdir -p .next/standalone/.next
    cp -r .next/static .next/standalone/.next/
fi

if [ -d ".next/standalone/public" ]; then
    echo "✅ public dosyalar kopyalanmış"
else
    echo "⚠️ public dosyalar kopyalanıyor..."
    cp -r public .next/standalone/
fi

# 10. PM2'yi yeniden başlat
echo ""
echo "🔄 PM2 yeniden başlatılıyor..."
pm2 restart all
sleep 3
pm2 list

echo ""
echo "========================================"
echo "🎉 Deploy Tamamlandı!"
echo ""
echo "Kontrol komutları:"
echo "  curl -s http://localhost:3000/api/products?limit=1"
echo "  curl -s http://localhost:3000/api/scraper/providers"
echo "  curl -s http://localhost:3000/api/settings"
