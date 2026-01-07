#!/bin/bash

# Horizon CMS - Frontend Production Build Script
# سكريبت بناء Frontend في Production

echo "🚀 بدء بناء Horizon CMS Frontend..."

cd "$(dirname "$0")"

# الألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# فحص ملف .env.production
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  ملف .env.production غير موجود${NC}"
    echo "📝 إنشاء ملف .env.production..."
    
    # الحصول على IP Server (إذا أمكن)
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    cat > .env.production << EOF
# Horizon CMS Frontend - Production Environment
VITE_API_URL=http://${SERVER_IP}:4300/api/v1
# أو إذا كنت تستخدم CloudFlare:
VITE_API_URL=https://api.horizonx.site/api/v1
EOF
    
    echo -e "${YELLOW}⚠️  يرجى مراجعة وتعديل ملف .env.production${NC}"
    echo "   VITE_API_URL يجب أن يشير إلى Backend API"
fi

# تثبيت التبعيات
echo "📦 تثبيت npm dependencies..."
npm ci

# بناء المشروع
echo "🏗️  بناء المشروع للإنتاج..."
npm run build

# التحقق من نجاح البناء
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo -e "${RED}❌ فشل بناء المشروع!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ البناء مكتمل بنجاح!${NC}"
echo ""
echo "📝 الخطوات التالية:"
echo "   1. انسخ محتويات مجلد dist إلى /var/www/horizon-frontend/"
echo "   2. تأكد من أن Nginx يعمل على Port 8080"
echo "   3. اختبر: curl http://localhost:8080"
echo "   4. Frontend URL: https://horizonx.site"
echo ""
echo "💡 أوامر النسخ:"
echo "   sudo mkdir -p /var/www/horizon-frontend"
echo "   sudo cp -r dist/* /var/www/horizon-frontend/"
echo "   sudo chown -R www-data:www-data /var/www/horizon-frontend"



