#!/bin/bash

# Horizon CMS - Backend Production Startup Script
# سكريبت تشغيل Backend في Production

echo "🚀 بدء تشغيل Horizon CMS Backend..."

cd "$(dirname "$0")"

# الألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# فحص ملف .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ ملف .env غير موجود!${NC}"
    echo "📝 نسخ .env.example إلى .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  يرجى تعديل ملف .env وإضافة الإعدادات المطلوبة${NC}"
    exit 1
fi

# إنشاء مجلد resources/views إذا لم يكن موجود
if [ ! -d "resources/views" ]; then
    echo "📁 إنشاء مجلد resources/views..."
    mkdir -p resources/views
fi

# تنظيف cache القديم (إذا كان يحتوي على حزم dev)
if [ -f "bootstrap/cache/services.php" ] || [ -f "bootstrap/cache/packages.php" ]; then
    echo "🧹 تنظيف cache القديم..."
    rm -f bootstrap/cache/services.php bootstrap/cache/packages.php
fi

# تحديث Composer dependencies
echo "📦 تحديث Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# تشغيل Migrations
echo "🗄️  تشغيل Migrations..."
php artisan migrate --force

# إنشاء Storage Link
if [ ! -L "public/storage" ]; then
    echo "🔗 إنشاء Storage Link..."
    php artisan storage:link
fi

# تحسين Laravel
echo "⚡ تحسين Laravel..."
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache || true
php artisan optimize

# إعداد الصلاحيات
echo "🔐 إعداد الصلاحيات..."
if [ -w storage ] && [ -w bootstrap/cache ]; then
    chmod -R 775 storage bootstrap/cache 2>/dev/null || true
fi
chmod 600 .env 2>/dev/null || true

echo -e "${GREEN}✅ Backend جاهز للتشغيل!${NC}"
echo ""
echo "📝 الخطوات التالية:"
echo "   1. تأكد من أن Nginx يعمل على Port 4300"
echo "   2. تأكد من أن Queue Worker يعمل"
echo "   3. اختبر: curl http://localhost:4300/api/v1/health"
echo "   4. Backend URL: https://api.horizonx.site"



