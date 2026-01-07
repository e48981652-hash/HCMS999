# أوامر Production - Horizon CMS
## Production Commands Quick Reference

ملف يحتوي على جميع الأوامر السريعة لتشغيل وإدارة المشروع في Production.

---

## ⚡ أوامر التشغيل السريعة (Quick Start)

### Backend - أول مرة (على السيرفر)

```bash
cd /var/www/horizon-cms-production/BE-1.0
bash start-production.sh
```

أو يدوياً:

```bash
cd /var/www/horizon-cms-production/BE-1.0
composer install --no-dev --optimize-autoloader --no-interaction
cp .env.example .env && nano .env
php artisan key:generate
mkdir -p resources/views
rm -f bootstrap/cache/services.php bootstrap/cache/packages.php
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache || true
php artisan optimize
sudo chown -R horizon:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo chmod 600 .env
```

### Frontend - أول مرة (على السيرفر)

```bash
cd /var/www/horizon-cms-production/cms-1.0
bash start-production.sh
```

أو يدوياً:

```bash
cd /var/www/horizon-cms-production/cms-1.0
npm ci
nano .env.production  # VITE_API_URL=http://YOUR_SERVER_IP:4300/api/v1
# أو إذا كنت تستخدم CloudFlare: VITE_API_URL=https://api.horizonx.site/api/v1
npm run build
sudo mkdir -p /var/www/horizon-frontend
sudo cp -r dist/* /var/www/horizon-frontend/
sudo chown -R www-data:www-data /var/www/horizon-frontend
```

---

## 🎯 ملخص سريع - أول مرة

### على السيرفر:

```bash
# 1. Backend
cd /var/www/horizon-cms-production/BE-1.0
bash start-production.sh  # أو الأوامر اليدوية أعلاه

# 2. Frontend
cd /var/www/horizon-cms-production/cms-1.0
bash start-production.sh  # أو الأوامر اليدوية أعلاه

# 3. إعداد Nginx على البورتات (راجع PRODUCTION_DEPLOYMENT_GUIDE.md)

# 4. فتح البورتات
sudo ufw allow 4300/tcp
sudo ufw allow 8080/tcp
```

---

## 🚀 أوامر تشغيل سريعة

### Backend (Laravel) - أول مرة

```bash
# 1. الانتقال إلى مجلد Backend
cd /var/www/horizon-cms-production/BE-1.0

# 2. تثبيت التبعيات
composer install --no-dev --optimize-autoloader --no-interaction

# 3. إعداد ملف .env
cp .env.example .env
nano .env  # تعديل الإعدادات

# 4. توليد APP_KEY
php artisan key:generate

# 5. إنشاء مجلد views (إذا لم يكن موجود)
mkdir -p resources/views

# 6. تنظيف cache القديم (إذا كان موجود)
rm -f bootstrap/cache/services.php bootstrap/cache/packages.php

# 7. تشغيل Migrations
php artisan migrate --force

# 8. تشغيل Seeders
php artisan db:seed --force

# 9. إنشاء Storage Link
php artisan storage:link

# 10. تحسين Laravel
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache || true
php artisan optimize

# 11. إعداد الصلاحيات
sudo chown -R horizon:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo chmod 600 .env
```

### Frontend (React) - أول مرة

```bash
# 1. الانتقال إلى مجلد Frontend
cd /var/www/horizon-cms-production/cms-1.0

# 2. تثبيت التبعيات
npm ci

# 3. إنشاء ملف .env.production
nano .env.production
# VITE_API_URL=http://YOUR_SERVER_IP:4300/api/v1
# أو إذا كنت تستخدم CloudFlare:
# VITE_API_URL=https://api.horizonx.site/api/v1

# 4. بناء المشروع
npm run build

# 5. نسخ الملفات
sudo mkdir -p /var/www/horizon-frontend
sudo cp -r dist/* /var/www/horizon-frontend/
sudo chown -R www-data:www-data /var/www/horizon-frontend
```

---

## ⚙️ أوامر التشغيل اليومية

### Backend - إعادة تشغيل

```bash
cd /var/www/horizon-cms-production/BE-1.0

# إعادة بناء Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache || true
php artisan optimize

# إعادة تشغيل Queue Worker
sudo supervisorctl restart horizon-queue-worker:*

# إعادة تحميل Nginx
sudo systemctl reload nginx
sudo systemctl reload php8.2-fpm
```

### Frontend - إعادة بناء

```bash
cd /var/www/horizon-cms-production/cms-1.0

# إعادة بناء
npm run build

# نسخ الملفات
sudo cp -r dist/* /var/www/horizon-frontend/
sudo chown -R www-data:www-data /var/www/horizon-frontend
```

---

## 🔄 أوامر التحديث (Update)

### تحديث Backend

```bash
cd /var/www/horizon-cms-production/BE-1.0

# 1. نسخ احتياطي (اختياري)
php artisan backup:run  # إذا كان موجود

# 2. سحب التحديثات
git pull origin main

# 3. تحديث التبعيات
composer install --no-dev --optimize-autoloader --no-interaction

# 4. تشغيل Migrations
php artisan migrate --force

# 5. إعادة بناء Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache || true
php artisan optimize

# 6. إعادة تشغيل الخدمات
sudo supervisorctl restart horizon-queue-worker:*
sudo systemctl reload nginx
sudo systemctl reload php8.2-fpm
```

### تحديث Frontend

```bash
cd /var/www/horizon-cms-production/cms-1.0

# 1. سحب التحديثات
git pull origin main

# 2. تحديث التبعيات
npm ci

# 3. إعادة بناء
npm run build

# 4. نسخ الملفات
sudo cp -r dist/* /var/www/horizon-frontend/
sudo chown -R www-data:www-data /var/www/horizon-frontend
```

---

## 🔍 أوامر الفحص والاختبار

### فحص حالة الخدمات

```bash
# حالة Nginx
sudo systemctl status nginx

# حالة PHP-FPM
sudo systemctl status php8.2-fpm

# حالة PostgreSQL
sudo systemctl status postgresql

# حالة Redis
sudo systemctl status redis-server

# حالة Queue Worker
sudo supervisorctl status

# حالة CloudFlare Tunnel (إذا كنت تستخدمه)
sudo systemctl status cloudflared
```

### فحص البورتات

```bash
# التحقق من البورتات المفتوحة
sudo ss -tulpn | grep -E ':(3000|8000)'

# اختبار Backend محلياً
curl -I http://localhost:4300

# اختبار Frontend محلياً
curl -I http://localhost:8080

# اختبار API endpoint
curl http://localhost:4300/api/v1/health
```

### فحص Logs

```bash
# Laravel logs
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/laravel.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log

# Queue Worker logs
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/queue-worker.log
```

---

## 🛠️ أوامر الصيانة

### تنظيف Cache

```bash
cd /var/www/horizon-cms-production/BE-1.0

# تنظيف جميع Cache
php artisan optimize:clear

# إعادة بناء Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache || true
php artisan optimize
```

### إعادة تشغيل جميع الخدمات

```bash
# إعادة تشغيل Nginx
sudo systemctl restart nginx

# إعادة تشغيل PHP-FPM
sudo systemctl restart php8.2-fpm

# إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql

# إعادة تشغيل Queue Worker
sudo supervisorctl restart horizon-queue-worker:*

# إعادة تشغيل Redis
sudo systemctl restart redis-server
```

---

## 📦 أوامر النسخ الاحتياطي

### نسخ احتياطي يدوي

```bash
# نسخ احتياطي لقاعدة البيانات
/usr/local/bin/horizon-backup-db.sh

# نسخ احتياطي للملفات
/usr/local/bin/horizon-backup-files.sh

# نسخ احتياطي للـ Storage
/usr/local/bin/horizon-backup-storage.sh
```

### عرض النسخ الاحتياطية

```bash
# عرض نسخ قاعدة البيانات
ls -lh /var/backups/horizon-cms/db_backup_*

# عرض نسخ الملفات
ls -lh /var/backups/horizon-cms/files_backup_*

# عرض نسخ Storage
ls -lh /var/backups/horizon-cms/storage_backup_*
```

---

## 🐛 أوامر استكشاف الأخطاء

### فحص قاعدة البيانات

```bash
# الاتصال بقاعدة البيانات
psql -U horizon_user -d horizon_cms_production

# في psql shell:
\l          # عرض قواعد البيانات
\dt         # عرض الجداول
\d users    # عرض هيكل جدول محدد
\q          # الخروج
```

### فحص Laravel

```bash
cd /var/www/horizon-cms-production/BE-1.0

# عرض Routes
php artisan route:list

# عرض Config
php artisan config:show

# اختبار الاتصال بقاعدة البيانات
php artisan tinker
# في Tinker:
DB::connection()->getPdo();
```

### فحص الصلاحيات

```bash
cd /var/www/horizon-cms-production/BE-1.0

# فحص صلاحيات storage
ls -la storage/
ls -la storage/logs/

# فحص صلاحيات bootstrap/cache
ls -la bootstrap/cache/

# إصلاح الصلاحيات
sudo chown -R horizon:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## 🔐 أوامر الأمان

### فحص Firewall

```bash
# عرض حالة Firewall
sudo ufw status verbose

# فتح/إغلاق بورتات
sudo ufw allow 4300/tcp
sudo ufw allow 8080/tcp
sudo ufw delete allow 4300/tcp
```

### فحص العمليات الجارية

```bash
# عرض عمليات PHP
ps aux | grep php

# عرض عمليات Nginx
ps aux | grep nginx

# عرض استخدام الذاكرة
free -h

# عرض استخدام القرص
df -h
```

---

## 📝 سكريبتات سريعة

### سكريبت تشغيل كامل (Backend)

احفظ كـ `/usr/local/bin/horizon-backend-start.sh`:

```bash
#!/bin/bash
cd /var/www/horizon-cms-production/BE-1.0

echo "🔄 تحديث Cache..."
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache || true
php artisan optimize

echo "🔄 إعادة تشغيل Queue Worker..."
sudo supervisorctl restart horizon-queue-worker:*

echo "🔄 إعادة تحميل Nginx..."
sudo systemctl reload nginx
sudo systemctl reload php8.2-fpm

echo "✅ Backend جاهز!"
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/horizon-backend-start.sh
```

### سكريبت تشغيل كامل (Frontend)

احفظ كـ `/usr/local/bin/horizon-frontend-build.sh`:

```bash
#!/bin/bash
cd /var/www/horizon-cms-production/cms-1.0

echo "📦 تثبيت التبعيات..."
npm ci

echo "🏗️ بناء المشروع..."
npm run build

echo "📋 نسخ الملفات..."
sudo cp -r dist/* /var/www/horizon-frontend/
sudo chown -R www-data:www-data /var/www/horizon-frontend

echo "✅ Frontend جاهز!"
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/horizon-frontend-build.sh
```

### سكريبت تحديث كامل

احفظ كـ `/usr/local/bin/horizon-update.sh`:

```bash
#!/bin/bash

echo "🔄 بدء عملية التحديث..."

# نسخ احتياطي
echo "💾 إنشاء نسخة احتياطية..."
/usr/local/bin/horizon-backup-db.sh
/usr/local/bin/horizon-backup-files.sh

# تحديث Backend
cd /var/www/horizon-cms-production/BE-1.0
echo "⬇️ سحب التحديثات من Git..."
git pull origin main

echo "📦 تحديث Backend..."
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache || true
php artisan optimize
sudo supervisorctl restart horizon-queue-worker:*
sudo systemctl reload nginx

# تحديث Frontend
cd /var/www/horizon-cms-production/cms-1.0
echo "📦 تحديث Frontend..."
npm ci
npm run build
sudo cp -r dist/* /var/www/horizon-frontend/
sudo chown -R www-data:www-data /var/www/horizon-frontend

echo "✅ التحديث مكتمل!"

# اختبار
echo "🧪 اختبار الخدمات..."
curl -I http://localhost:4300
curl -I http://localhost:8080
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/horizon-update.sh
```

---

## 🚨 أوامر الطوارئ

### إيقاف جميع الخدمات

```bash
sudo systemctl stop nginx
sudo systemctl stop php8.2-fpm
sudo supervisorctl stop horizon-queue-worker:*
```

### تشغيل جميع الخدمات

```bash
sudo systemctl start nginx
sudo systemctl start php8.2-fpm
sudo supervisorctl start horizon-queue-worker:*
```

### إعادة تشغيل كامل

```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart postgresql
sudo systemctl restart redis-server
sudo supervisorctl restart horizon-queue-worker:*
```

---

## 📊 مراقبة الأداء

### استخدام الموارد

```bash
# مراقبة في الوقت الفعلي
htop

# استخدام الذاكرة
free -h

# استخدام القرص
df -h
du -sh /var/www/horizon-cms-production/*

# استخدام CPU
top
```

### مراقبة Laravel

```bash
# عرض عدد Requests
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/laravel.log | grep -i "GET\|POST"

# عرض Errors فقط
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/laravel.log | grep -i "error"
```

---

## 🔗 روابط سريعة

### اختبار الوصول

```bash
# محلياً
http://localhost:4300       # Backend API
http://localhost:8080       # Frontend

# من الخارج (إذا كان Firewall يسمح)
http://YOUR_SERVER_IP:4300  # Backend API
http://YOUR_SERVER_IP:8080  # Frontend

# عبر CloudFlare (إذا كان مُعد)
https://api.horizonx.site  # Backend API
https://horizonx.site      # Frontend
```

---

## 📌 ملاحظات مهمة

1. **قبل أي تحديث**: قم بعمل نسخ احتياطي
2. **بعد أي تغيير في .env**: شغّل `php artisan config:cache`
3. **بعد أي تغيير في Routes**: شغّل `php artisan route:cache`
4. **بعد تحديث Frontend**: لا تنسَ إعادة بناء (`npm run build`)
5. **Queue Worker**: تأكد من أنه يعمل دائماً (`sudo supervisorctl status`)

---

## 🎯 أوامر سريعة للاستخدام اليومي

### Backend

```bash
# تحديث سريع
cd /var/www/horizon-cms-production/BE-1.0 && php artisan optimize && sudo supervisorctl restart horizon-queue-worker:* && sudo systemctl reload nginx
```

### Frontend

```bash
# بناء سريع
cd /var/www/horizon-cms-production/cms-1.0 && npm run build && sudo cp -r dist/* /var/www/horizon-frontend/ && sudo chown -R www-data:www-data /var/www/horizon-frontend
```

### فحص سريع

```bash
# فحص جميع الخدمات
echo "Nginx:" && sudo systemctl is-active nginx && \
echo "PHP-FPM:" && sudo systemctl is-active php8.2-fpm && \
echo "Queue:" && sudo supervisorctl status | grep RUNNING && \
echo "Ports:" && sudo ss -tulpn | grep -E ':(4300|8080)' && \
echo "Backend:" && curl -s -o /dev/null -w "%{http_code}" http://localhost:4300 && echo && \
echo "Frontend:" && curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 && echo
```

---

**تم إنشاء هذا الملف بتاريخ**: 2024  
**الإصدار**: 1.0  
**المشروع**: Horizon CMS

