# دليل نقل مشروع Horizon CMS إلى Production
## Production Deployment Guide

هذا الدليل الشامل يحتوي على جميع الخطوات المطلوبة لنقل مشروع Horizon CMS من بيئة التطوير إلى بيئة Production.

## ⚠️ ملاحظة مهمة - إعدادات البورتات فقط

هذا الدليل مُعد ليعمل الخادم على **بورتات محلية فقط**:

| الخدمة | البورت | الوصف |
|--------|--------|-------|
| **Backend API** | **4300** | Laravel API |
| **Frontend** | **8080** | React Frontend |

**SSL والـ Domains** ستتم إدارتها من خلال:
- **CloudFlare** (موصى به) - راجع القسم 8.1
- **CloudFlare Tunnel** (الأكثر أماناً) - راجع القسم 8.2
- **Reverse Proxy خارجي** - راجع القسم 8.3

**مزايا هذا الأسلوب:**
- ✅ أمان أكبر (لا حاجة لفتح بورتات عامة مباشرة)
- ✅ SSL مجاني من CloudFlare
- ✅ DDoS protection تلقائي
- ✅ CDN للتحسين
- ✅ سهولة الإدارة والصيانة

**ملخص سريع:**
1. الخادم يعمل على Port 4300 (Backend) و Port 8080 (Frontend)
2. CloudFlare أو Reverse Proxy يتصل بهذه البورتات
3. SSL يتم إدارته من CloudFlare
4. لا حاجة لإعداد SSL مباشرة على الخادم
5. Frontend URL: **horizonx.site**
6. Backend URL: **api.horizonx.site**

---

## 📋 جدول المحتويات

1. [التحضيرات الأولية](#التحضيرات-الأولية)
2. [متطلبات النظام](#متطلبات-النظام)
3. [إعداد الخادم](#إعداد-الخادم)
4. [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
5. [إعداد Backend (Laravel)](#إعداد-backend-laravel)
6. [إعداد Frontend (React)](#إعداد-frontend-react)
7. [إعداد Web Server (Nginx) - على البورتات فقط](#إعداد-web-server-nginx---على-البورتات-فقط)
8. [إعداد CloudFlare أو Reverse Proxy (اختياري)](#إعداد-cloudflare-أو-reverse-proxy-اختياري)
9. [تحسينات الأداء](#تحسينات-الأداء)
10. [الأمان](#الأمان)
11. [النسخ الاحتياطي](#النسخ-الاحتياطي)
12. [المراقبة والصيانة](#المراقبة-والصيانة)
13. [اختبار النشر](#اختبار-النشر)
14. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 1. التحضيرات الأولية

### 1.1 مراجعة الكود

قبل النشر، تأكد من:

```bash
# في مجلد المشروع الرئيسي
cd horizon-cms1.0

# التحقق من حالة Git
git status

# التأكد من رفع جميع التغييرات
git add .
git commit -m "Final changes before production deployment"
git push origin main
```

### 1.2 إنشاء قائمة مرجعية (Checklist)

- [ ] مراجعة جميع ملفات `.env` وإزالة أي معلومات حساسة من Git
- [ ] التأكد من أن جميع الميزات تعمل بشكل صحيح
- [ ] تشغيل جميع الاختبارات
- [ ] مراجعة الأمان والصلاحيات
- [ ] تحسين الكود وتحسين الأداء
- [ ] إعداد الخادم Production
- [ ] إعداد قاعدة البيانات Production
- [ ] فتح البورتات (4300, 8080) في Firewall
- [ ] (اختياري) إعداد CloudFlare أو Reverse Proxy
- [ ] اختبار شامل بعد النشر

---

## 2. متطلبات النظام

### 2.1 متطلبات الخادم

**الحد الأدنى:**
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS أو أحدث (مُوصى به)

**موصى به:**
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 100 GB SSD
- **Bandwidth**: 100 Mbps

### 2.2 البرمجيات المطلوبة

```bash
# على الخادم
# PHP 8.2+
# Composer
# Node.js 18+ و npm
# PostgreSQL 14+
# Nginx (لإعداد Reverse Proxy على البورتات)
# Supervisor (لإدارة Laravel Queue)
# Redis (اختياري - للتحسين)

# ملاحظة: SSL/Domains ستتم إدارتها من خلال CloudFlare أو Reverse Proxy خارجي
```

---

## 3. إعداد الخادم

### 3.1 الاتصال بالخادم

```bash
# الاتصال بالخادم
ssh root@your-server-ip
# أو
ssh your-user@your-server-ip
```

### 3.2 تحديث النظام

```bash
# تحديث النظام
sudo apt update
sudo apt upgrade -y

# تثبيت أدوات أساسية
sudo apt install -y curl wget git unzip software-properties-common
```

### 3.3 إنشاء مستخدم جديد (اختياري - للأمان)

```bash
# إنشاء مستخدم جديد
sudo adduser horizon
sudo usermod -aG sudo horizon

# تسجيل الدخول بالمستخدم الجديد
su - horizon
```

### 3.4 تثبيت PHP 8.2+

```bash
# إضافة PPA لـ PHP
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# تثبيت PHP والمكتبات المطلوبة
sudo apt install -y php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip \
    php8.2-bcmath php8.2-pgsql php8.2-redis php8.2-gd

# التحقق من الإصدار
php -v
```

### 3.5 تثبيت Composer

```bash
# تحميل Composer
cd ~
curl -sS https://getcomposer.org/installer | php

# نقل Composer إلى PATH
sudo mv composer.phar /usr/local/bin/composer

# التحقق من التثبيت
composer --version
```

### 3.6 تثبيت Node.js و npm

```bash
# استخدام NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# التحقق من الإصدار
node -v
npm -v

# تثبيت pnpm (اختياري - أسرع)
sudo npm install -g pnpm
```

### 3.7 تثبيت PostgreSQL

```bash
# تثبيت PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# التحقق من الحالة
sudo systemctl status postgresql
sudo systemctl enable postgresql

# الدخول إلى PostgreSQL
sudo -u postgres psql

# في shell PostgreSQL، إنشاء قاعدة بيانات ومستخدم:
CREATE DATABASE horizon_cms;
CREATE USER horizon_user WITH PASSWORD 'strong_password_here';
ALTER ROLE horizon_user SET client_encoding TO 'utf8';
ALTER ROLE horizon_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE horizon_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE horizon_cms TO horizon_user;
\q
```

### 3.8 تثبيت Redis (اختياري - للتحسين)

```bash
# تثبيت Redis
sudo apt install -y redis-server

# تشغيل Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# التحقق من الحالة
redis-cli ping
# يجب أن يعيد: PONG
```

### 3.9 تثبيت Nginx (لإعداد Reverse Proxy على البورتات)

```bash
# تثبيت Nginx
sudo apt install -y nginx

# تشغيل Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# التحقق من الحالة
sudo systemctl status nginx
```

**ملاحظة مهمة**: Nginx هنا سيستخدم كـ Reverse Proxy للتعامل مع البورتات فقط. SSL والـ Domains ستتم إدارتها من خلال CloudFlare أو خدمة خارجية.

---

## 4. إعداد قاعدة البيانات

### 4.1 إعدادات قاعدة البيانات

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# إنشاء قاعدة بيانات (إذا لم تكن موجودة)
CREATE DATABASE horizon_cms_production;

# إعداد UTF-8 encoding
\c horizon_cms_production
ALTER DATABASE horizon_cms_production SET timezone TO 'UTC';
\q
```

### 4.2 النسخ الاحتياطي لقاعدة البيانات

```bash
# إنشاء مجلد للنسخ الاحتياطي
sudo mkdir -p /var/backups/horizon-cms
sudo chown -R horizon:horizon /var/backups/horizon-cms

# إنشاء سكريبت النسخ الاحتياطي
sudo nano /usr/local/bin/horizon-backup-db.sh
```

محتوى السكريبت:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/horizon-cms"
DB_NAME="horizon_cms_production"
DB_USER="horizon_user"
DATE=$(date +%Y%m%d_%H%M%S)

# إنشاء نسخة احتياطية
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# حذف النسخ القديمة (أقدم من 30 يوم)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/horizon-backup-db.sh

# إضافة إلى Crontab (نسخ احتياطي يومي الساعة 2 صباحاً)
sudo crontab -e
# أضف السطر التالي:
0 2 * * * /usr/local/bin/horizon-backup-db.sh
```

---

## 5. إعداد Backend (Laravel)

### 5.1 رفع ملفات المشروع

```bash
# الانتقال إلى مجلد الويب
cd /var/www

# استنساخ المشروع من Git (إذا كان على GitHub/GitLab)
sudo git clone https://github.com/your-username/horizon-cms.git
sudo mv horizon-cms horizon-cms-production

# أو رفع الملفات يدوياً باستخدام SCP/SFTP
# scp -r horizon-cms1.0/BE-1.0 user@server:/var/www/horizon-cms-production

# تغيير الملكية
sudo chown -R horizon:www-data /var/www/horizon-cms-production
cd /var/www/horizon-cms-production/BE-1.0
```

### 5.2 تثبيت التبعيات

```bash
# الانتقال إلى مجلد Backend
cd /var/www/horizon-cms-production/BE-1.0

# تثبيت Composer dependencies (بدون dev dependencies)
composer install --optimize-autoloader --no-dev

# أو إذا كنت تستخدم production flag
composer install --no-dev --optimize-autoloader --no-interaction
```

### 5.3 إعداد ملف `.env` للإنتاج

```bash
# نسخ ملف .env.example
cp .env.example .env

# تحرير ملف .env
nano .env
```

محتوى ملف `.env` للإنتاج:

```env
APP_NAME="Horizon CMS"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=http://YOUR_SERVER_IP:4300
# مثال: APP_URL=http://192.168.1.100:4300
# أو إذا كان لديك domain من CloudFlare: APP_URL=https://api.horizonx.site

LOG_CHANNEL=stack
LOG_LEVEL=error
LOG_DEPRECATIONS_CHANNEL=null
LOG_STACK=single

# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=horizon_cms_production
DB_USERNAME=horizon_user
DB_PASSWORD=your_strong_password_here

# Cache Configuration (استخدم Redis في Production)
CACHE_STORE=redis
CACHE_PREFIX=horizon_cms

# Session Configuration
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=true

# Queue Configuration
QUEUE_CONNECTION=redis
QUEUE_FAILED_DRIVER=database-uuids

# Filesystem Configuration
FILESYSTEM_DISK=public

# Mail Configuration (استخدم SMTP حقيقي)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"

# CORS Configuration
# إذا كنت تستخدم CloudFlare، استخدم الدومينات هنا:
CORS_ALLOWED_ORIGINS=https://horizonx.site,https://www.horizonx.site
# أو إذا كنت تستخدم IP فقط:
# CORS_ALLOWED_ORIGINS=http://YOUR_SERVER_IP:8080

# Sanctum Configuration
# إذا كنت تستخدم CloudFlare:
SANCTUM_STATEFUL_DOMAINS=horizonx.site,www.horizonx.site
# أو إذا كنت تستخدم IP:
# SANCTUM_STATEFUL_DOMAINS=YOUR_SERVER_IP

# Redis Configuration (إذا كنت تستخدم Redis)
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0

# N8N Webhook (إذا كنت تستخدمه)
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=your-secret-key

# Security
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

```bash
# توليد APP_KEY
php artisan key:generate

# تأكد من أن ملف .env محمي
chmod 600 .env
```

### 5.4 إعداد قاعدة البيانات

```bash
# تشغيل Migrations
php artisan migrate --force

# تشغيل Seeders (إذا لزم الأمر)
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=SettingsSeeder

# أو تشغيل جميع Seeders
php artisan db:seed --force
```

### 5.5 إعداد Storage

```bash
# إنشاء symbolic link للـ storage
php artisan storage:link

# التأكد من الصلاحيات
sudo chown -R horizon:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 5.6 تحسين Laravel للإنتاج

```bash
# تحسين Autoloader
composer install --optimize-autoloader --no-dev

# إنشاء مجلد resources/views إذا لم يكن موجود (لأن المشروع API-only)
mkdir -p resources/views

# Cache Configuration
php artisan config:cache

# Cache Routes
php artisan route:cache

# Cache Events
php artisan event:cache

# Cache Views (لن يسبب مشكلة حتى لو كان فارغ)
php artisan view:cache || true

# Cache Bootstrap
php artisan optimize
```

**ملاحظة**: `php artisan view:cache || true` - إذا فشل الأمر لن يوقف السكريبت

### 5.7 إعداد Laravel Queue Worker

```bash
# إنشاء ملف Supervisor configuration
sudo nano /etc/supervisor/conf.d/horizon-queue-worker.conf
```

محتوى الملف:

```ini
[program:horizon-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/horizon-cms-production/BE-1.0/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=horizon
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/horizon-cms-production/BE-1.0/storage/logs/queue-worker.log
stopwaitsecs=3600
```

```bash
# تحديث Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start horizon-queue-worker:*

# التحقق من الحالة
sudo supervisorctl status
```

---

## 6. إعداد Frontend (React)

### 6.1 بناء المشروع للإنتاج

```bash
# الانتقال إلى مجلد Frontend
cd /var/www/horizon-cms-production/cms-1.0

# تثبيت dependencies
npm ci --production=false

# إنشاء ملف .env.production
nano .env.production
```

محتوى `.env.production`:

```env
# إذا كنت تستخدم CloudFlare:
VITE_API_URL=https://api.horizonx.site/api/v1
# أو إذا كان Backend على نفس النطاق:
# VITE_API_URL=https://horizonx.site/api/v1
# أو إذا كنت تستخدم IP فقط:
# VITE_API_URL=http://YOUR_SERVER_IP:4300/api/v1
```

```bash
# بناء المشروع للإنتاج
npm run build

# سيتم إنشاء مجلد dist/ يحتوي على الملفات الجاهزة
```

### 6.2 نسخ الملفات إلى مجلد الويب

```bash
# نسخ ملفات dist إلى مجلد Nginx
sudo cp -r dist/* /var/www/horizon-frontend/

# أو إذا كنت تريد ربطها مباشرة:
# sudo ln -s /var/www/horizon-cms-production/cms-1.0/dist /var/www/horizon-frontend

# تغيير الملكية
sudo chown -R www-data:www-data /var/www/horizon-frontend
```

---

## 7. إعداد Web Server (Nginx) - على البورتات فقط

هذا القسم يوضح كيفية إعداد Nginx كـ Reverse Proxy على بورتات محلية فقط. SSL والـ Domains ستتم إدارتها من خلال CloudFlare أو Reverse Proxy خارجي.

### 7.1 إعداد Nginx للـ Backend (API) - على Port 4300

```bash
# إنشاء ملف إعداد Nginx للـ Backend
sudo nano /etc/nginx/sites-available/horizon-api
```

محتوى الملف:

```nginx
server {
    listen 4300;
    server_name _;  # _ يعني أي hostname
    
    root /var/www/horizon-cms-production/BE-1.0/public;
    index index.php index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase upload size
    client_max_body_size 100M;
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/horizon-api /etc/nginx/sites-enabled/

# التحقق من إعدادات Nginx
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

### 7.2 إعداد Nginx للـ Frontend - على Port 8080

```bash
# إنشاء ملف إعداد Nginx للـ Frontend
sudo nano /etc/nginx/sites-available/horizon-frontend
```

محتوى الملف:

```nginx
server {
    listen 8080;
    server_name _;  # _ يعني أي hostname

    root /var/www/horizon-frontend;
    index index.html;

    charset utf-8;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Hide nginx version
    server_tokens off;
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/horizon-frontend /etc/nginx/sites-enabled/

# إزالة الـ default site (اختياري)
sudo rm /etc/nginx/sites-enabled/default

# التحقق من إعدادات Nginx
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

### 7.3 فتح البورتات في Firewall

```bash
# التأكد من أن Firewall يسمح بالبورتات
sudo ufw allow 4300/tcp   # Backend API
sudo ufw allow 8080/tcp   # Frontend

# التحقق من الحالة
sudo ufw status
```

---

## 8. إعداد CloudFlare أو Reverse Proxy (اختياري)

إذا كنت تريد استخدام CloudFlare أو Reverse Proxy خارجي للتعامل مع SSL والـ Domains، اتبع الخطوات التالية:

### 8.1 إعداد CloudFlare

#### الخطوة 1: إضافة الدومينات في CloudFlare

1. سجل دخول إلى CloudFlare
2. أضف الدومين الجديد
3. اتبع خطوات الإعداد (DNS records)

#### الخطوة 2: إعداد DNS Records

في CloudFlare، أضف DNS records:

- **Type**: A  
  **Name**: api  
  **IPv4 address**: YOUR_SERVER_IP  
  **Proxy**: Proxied (برتقالي) - هذا مهم للـ SSL المجاني
  **النتيجة**: api.horizonx.site

- **Type**: A  
  **Name**: @ (أو www)  
  **IPv4 address**: YOUR_SERVER_IP  
  **Proxy**: Proxied (برتقالي)
  **النتيجة**: horizonx.site و www.horizonx.site

#### الخطوة 3: إعداد SSL في CloudFlare

1. اذهب إلى **SSL/TLS** في CloudFlare
2. اختر **Full** أو **Full (strict)** mode:
   - **Full**: CloudFlare يتصل بالخادم عبر HTTP (Port 80 أو البورتات التي حددتها)
   - **Full (strict)**: يتطلب شهادة SSL صالحة على الخادم (غير مطلوب في حالتنا)

#### الخطوة 4: إعداد Page Rules (اختياري)

يمكنك إضافة Page Rules لـ:
- Force HTTPS
- Cache static assets
- Redirects

### 8.2 إعداد CloudFlare Tunnel (موصى به - أكثر أماناً)

CloudFlare Tunnel يتيح الاتصال بالخادم بدون فتح بورتات عامة:

```bash
# تثبيت cloudflared على الخادم
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# إنشاء Tunnel
cloudflared tunnel login
cloudflared tunnel create horizon-cms

# إعداد Tunnel
cloudflared tunnel route dns horizon-cms api.horizonx.site
cloudflared tunnel route dns horizon-cms horizonx.site

# إعداد config file
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

محتوى `~/.cloudflared/config.yml`:

```yaml
tunnel: TUNNEL_ID_HERE
credentials-file: /home/horizon/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: api.horizonx.site
    service: http://localhost:4300
  - hostname: horizonx.site
    service: http://localhost:8080
  - hostname: www.horizonx.site
    service: http://localhost:8080
  - service: http_status:404
```

```bash
# تشغيل Tunnel كخدمة
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# التحقق من الحالة
sudo systemctl status cloudflared
```

**مزايا CloudFlare Tunnel**:
- لا حاجة لفتح بورتات عامة
- SSL مجاني تلقائياً
- DDoS protection
- CDN للتحسين

### 8.3 إعداد Reverse Proxy آخر (Nginx على خادم آخر)

إذا كان لديك Reverse Proxy على خادم آخر:

```nginx
# على Reverse Proxy Server
server {
    listen 80;
    listen 443 ssl http2;
    server_name api.horizonx.site;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://YOUR_SERVER_IP:4300;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name horizonx.site www.horizonx.site;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://YOUR_SERVER_IP:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.4 تحديث إعدادات Laravel بعد إعداد CloudFlare

```bash
# في ملف .env
APP_URL=https://api.horizonx.site

CORS_ALLOWED_ORIGINS=https://horizonx.site,https://www.horizonx.site
SANCTUM_STATEFUL_DOMAINS=horizonx.site,www.horizonx.site

# تحديث Config
php artisan config:cache
```

### 8.5 تحديث Frontend بعد إعداد CloudFlare

```bash
# في ملف .env.production
VITE_API_URL=https://api.horizonx.site/api/v1

# إعادة بناء
npm run build
```

---

## 9. ملاحظات مهمة حول الأمان

عند استخدام CloudFlare أو Reverse Proxy:

1. **Trust Proxy**: تأكد من أن Laravel يثق في Proxy
   ```bash
   # في .env
   TRUSTED_PROXIES=*
   ```

2. **Real IP**: تأكد من أن Laravel يحصل على IP الحقيقي للعميل
   - CloudFlare يقوم بذلك تلقائياً
   - في Nginx Proxy، استخدم `X-Real-IP` header

3. **Security Headers**: يمكن إضافة headers في CloudFlare
   - اذهب إلى **Rules** → **Transform Rules** → **Modify Response Header**

---

## 9. تحسينات الأداء

### 9.1 تحسين PHP-FPM

```bash
# تحرير إعدادات PHP-FPM
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

تعديلات مُوصى بها:

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500
```

```bash
# إعادة تشغيل PHP-FPM
sudo systemctl restart php8.2-fpm
```

### 9.2 تحسين Nginx

```bash
# تحرير إعدادات Nginx الرئيسية
sudo nano /etc/nginx/nginx.conf
```

تعديلات مُوصى بها:

```nginx
# في قسم http
worker_processes auto;
worker_connections 1024;

# Enable gzip
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript application/xml+rss 
           application/rss+xml font/truetype font/opentype 
           application/vnd.ms-fontobject image/svg+xml;
```

### 9.3 تحسين Laravel

```bash
# في مجلد Backend
cd /var/www/horizon-cms-production/BE-1.0

# استخدام Redis للـ Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# تحسين Autoloader
composer dump-autoload --optimize --classmap-authoritative
```

### 9.4 تحسين PostgreSQL

```bash
# تحرير إعدادات PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
```

تعديلات مُوصى بها:

```ini
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

```bash
# إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql
```

---

## 10. الأمان

### 10.1 إعدادات الأمان في Laravel

```bash
# في ملف .env
SESSION_SECURE_COOKIE=true  # true إذا كنت تستخدم HTTPS من CloudFlare
SESSION_SAME_SITE=lax
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

# إذا كنت تستخدم CloudFlare أو Reverse Proxy، تأكد من:
TRUSTED_PROXIES=*  # أو IP محدد للـ Proxy

# تحديث Config
php artisan config:cache
```

**ملاحظة**: `SESSION_SECURE_COOKIE=true` يتطلب HTTPS. إذا كنت تستخدم CloudFlare، تأكد من أن SSL مفعل.

### 10.2 إعدادات Firewall

```bash
# تثبيت UFW (إذا لم يكن مثبتاً)
sudo apt install -y ufw

# السماح بالمنافذ الأساسية
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 4300/tcp  # Backend API
sudo ufw allow 8080/tcp  # Frontend

# إذا كنت لا تستخدم CloudFlare Tunnel وتريد فتح HTTP/HTTPS مباشرة:
# sudo ufw allow 80/tcp    # HTTP
# sudo ufw allow 443/tcp   # HTTPS

# تفعيل Firewall
sudo ufw enable

# التحقق من الحالة
sudo ufw status
```

### 10.3 Fail2Ban (حماية من الهجمات)

```bash
# تثبيت Fail2Ban
sudo apt install -y fail2ban

# إنشاء ملف إعداد مخصص
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

### 10.4 تحديثات الأمان التلقائية

```bash
# تثبيت unattended-upgrades
sudo apt install -y unattended-upgrades

# تفعيل التحديثات التلقائية
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 10.5 صلاحيات الملفات

```bash
# في مجلد Backend
cd /var/www/horizon-cms-production/BE-1.0

# التأكد من الصلاحيات الصحيحة
sudo chown -R horizon:www-data .
sudo find . -type f -exec chmod 644 {} \;
sudo find . -type d -exec chmod 755 {} \;
sudo chmod -R 775 storage bootstrap/cache
sudo chmod 600 .env
```

---

## 11. النسخ الاحتياطي

### 11.1 نسخ احتياطي لقاعدة البيانات (تم إعداده سابقاً)

راجع القسم 4.2

### 11.2 نسخ احتياطي للملفات

```bash
# إنشاء سكريبت النسخ الاحتياطي
sudo nano /usr/local/bin/horizon-backup-files.sh
```

محتوى السكريبت:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/horizon-cms"
PROJECT_DIR="/var/www/horizon-cms-production"
DATE=$(date +%Y%m%d_%H%M%S)

# إنشاء نسخة احتياطية
tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" \
    --exclude="$PROJECT_DIR/cms-1.0/node_modules" \
    --exclude="$PROJECT_DIR/BE-1.0/vendor" \
    --exclude="$PROJECT_DIR/.git" \
    "$PROJECT_DIR"

# حذف النسخ القديمة (أقدم من 30 يوم)
find $BACKUP_DIR -name "files_backup_*.tar.gz" -mtime +30 -delete

echo "Files backup completed: files_backup_$DATE.tar.gz"
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/horizon-backup-files.sh

# إضافة إلى Crontab (نسخ احتياطي يومي الساعة 3 صباحاً)
sudo crontab -e
# أضف السطر التالي:
0 3 * * * /usr/local/bin/horizon-backup-files.sh
```

### 11.3 النسخ الاحتياطي للـ Storage

```bash
# إنشاء سكريبت نسخ احتياطي للـ Storage
sudo nano /usr/local/bin/horizon-backup-storage.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/horizon-cms"
STORAGE_DIR="/var/www/horizon-cms-production/BE-1.0/storage/app/public"
DATE=$(date +%Y%m%d_%H%M%S)

# إنشاء نسخة احتياطية
tar -czf "$BACKUP_DIR/storage_backup_$DATE.tar.gz" "$STORAGE_DIR"

# حذف النسخ القديمة (أقدم من 14 يوم)
find $BACKUP_DIR -name "storage_backup_*.tar.gz" -mtime +14 -delete

echo "Storage backup completed: storage_backup_$DATE.tar.gz"
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/horizon-backup-storage.sh

# إضافة إلى Crontab (نسخ احتياطي يومي الساعة 4 صباحاً)
sudo crontab -e
# أضف السطر التالي:
0 4 * * * /usr/local/bin/horizon-backup-storage.sh
```

---

## 12. المراقبة والصيانة

### 12.1 تثبيت أدوات المراقبة

```bash
# تثبيت htop للمراقبة
sudo apt install -y htop iotop nethogs

# مراقبة استخدام الموارد
htop
```

### 12.2 إعداد Log Rotation

```bash
# إنشاء ملف logrotate للـ Laravel
sudo nano /etc/logrotate.d/horizon-cms
```

محتوى الملف:

```
/var/www/horizon-cms-production/BE-1.0/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 horizon www-data
    sharedscripts
}
```

### 12.3 مراقبة Laravel Logs

```bash
# عرض Laravel logs
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/laravel.log

# أو باستخدام less
less /var/www/horizon-cms-production/BE-1.0/storage/logs/laravel.log
```

### 12.4 مراقبة Queue Worker

```bash
# التحقق من حالة Queue Worker
sudo supervisorctl status

# عرض logs
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/queue-worker.log
```

### 12.5 تنظيف دوري

```bash
# إنشاء سكريبت تنظيف
sudo nano /usr/local/bin/horizon-cleanup.sh
```

```bash
#!/bin/bash
cd /var/www/horizon-cms-production/BE-1.0

# تنظيف Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# إعادة تحميل Cache (للإنتاج)
php artisan config:cache
php artisan route:cache
php artisan view:cache || true  # لن يفشل إذا كان فارغ

# تنظيف Old Logs
find storage/logs -name "*.log" -mtime +30 -delete

echo "Cleanup completed"
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/horizon-cleanup.sh

# إضافة إلى Crontab (أسبوعياً)
sudo crontab -e
# أضف السطر التالي:
0 5 * * 0 /usr/local/bin/horizon-cleanup.sh
```

---

## 13. اختبار النشر

### 13.1 اختبارات أساسية

```bash
# 1. التحقق من وصول Nginx على البورتات المحلية
curl -I http://localhost:4300
curl -I http://localhost:8080

# 2. التحقق من Laravel
curl http://localhost:4300/api/v1/health

# 3. إذا كنت تستخدم CloudFlare، اختبر من الخارج:
curl -I https://horizonx.site
curl -I https://api.horizonx.site
curl https://api.horizonx.site/api/v1/health

# 3. التحقق من قاعدة البيانات
cd /var/www/horizon-cms-production/BE-1.0
php artisan tinker
# في Tinker:
DB::connection()->getPdo();
```

### 13.2 اختبارات الوظائف

1. **اختبار تسجيل الدخول**:
   - فتح `https://horizonx.site`
   - تسجيل الدخول بحساب Admin
   - التحقق من Dashboard

2. **اختبار API**:
   - اختبار إنشاء Request
   - اختبار MCP
   - اختبار جميع Endpoints

3. **اختبار الأداء**:
   - استخدام أدوات مثل Google PageSpeed Insights
   - استخدام GTmetrix
   - اختبار سرعة API

### 13.3 اختبارات الأمان

```bash
# التحقق من Headers (إذا كنت تستخدم CloudFlare)
curl -I https://horizonx.site
curl -I https://api.horizonx.site

# التحقق من CORS
curl -H "Origin: https://otherdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.horizonx.site/api/v1/auth/login

# إذا كنت تستخدم CloudFlare:
# - استخدم SSL Labs للتحقق من SSL: https://www.ssllabs.com/ssltest/
# - تأكد من أن SSL mode = Full أو Full (strict)
```

---

## 14. استكشاف الأخطاء

### 14.1 مشاكل شائعة وحلولها

#### مشكلة: 500 Internal Server Error

```bash
# التحقق من Laravel logs
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/laravel.log

# التحقق من Nginx error logs
sudo tail -f /var/log/nginx/error.log

# التحقق من PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log

# التحقق من الصلاحيات
ls -la /var/www/horizon-cms-production/BE-1.0/storage
ls -la /var/www/horizon-cms-production/BE-1.0/bootstrap/cache
```

#### مشكلة: Cannot connect to database

```bash
# التحقق من اتصال PostgreSQL
sudo -u postgres psql -c "\l"

# التحقق من إعدادات .env
cd /var/www/horizon-cms-production/BE-1.0
cat .env | grep DB_

# اختبار الاتصال
php artisan tinker
DB::connection()->getPdo();
```

#### مشكلة: Queue Worker لا يعمل

```bash
# التحقق من حالة Supervisor
sudo supervisorctl status

# إعادة تشغيل Queue Worker
sudo supervisorctl restart horizon-queue-worker:*

# عرض logs
tail -f /var/www/horizon-cms-production/BE-1.0/storage/logs/queue-worker.log
```

#### مشكلة: Frontend لا يتصل بـ API

```bash
# التحقق من CORS settings في Backend
cat /var/www/horizon-cms-production/BE-1.0/.env | grep CORS

# التحقق من VITE_API_URL في Frontend
cat /var/www/horizon-cms-production/cms-1.0/.env.production

# إعادة بناء Frontend
cd /var/www/horizon-cms-production/cms-1.0
npm run build
```

#### مشكلة: CloudFlare Tunnel لا يعمل

```bash
# التحقق من حالة CloudFlared
sudo systemctl status cloudflared

# عرض logs
sudo journalctl -u cloudflared -f

# إعادة تشغيل Tunnel
sudo systemctl restart cloudflared

# التحقق من الاتصال
curl http://localhost:8000
curl http://localhost:3000
```

#### مشكلة: CORS errors مع CloudFlare

```bash
# تأكد من أن CORS_ALLOWED_ORIGINS يحتوي على الدومينات الصحيحة
cat /var/www/horizon-cms-production/BE-1.0/.env | grep CORS

# تحديث Config
php artisan config:cache
```

### 14.2 أوامر مفيدة للاستكشاف

```bash
# عرض استخدام القرص
df -h

# عرض استخدام الذاكرة
free -h

# عرض العمليات الجارية
ps aux | grep php
ps aux | grep nginx

# عرض الاتصالات النشطة
netstat -tulpn

# التحقق من البورتات المفتوحة
sudo ss -tulpn | grep -E ':(4300|8080)'

# عرض Laravel routes
cd /var/www/horizon-cms-production/BE-1.0
php artisan route:list

# اختبار إعدادات Laravel
php artisan config:show
php artisan env

# اختبار الوصول على البورتات محلياً
curl http://localhost:4300/api/v1/health
curl http://localhost:8080
```

---

## 15. تحديثات لاحقة

### 15.1 عملية التحديث

```bash
# 1. نسخ احتياطي
/usr/local/bin/horizon-backup-db.sh
/usr/local/bin/horizon-backup-files.sh

# 2. الانتقال إلى مجلد المشروع
cd /var/www/horizon-cms-production

# 3. سحب التحديثات من Git
git pull origin main

# 4. تحديث Backend
cd BE-1.0
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache || true  # لن يفشل إذا كان فارغ
php artisan optimize

# 5. تحديث Frontend
cd ../cms-1.0
npm ci
npm run build
sudo cp -r dist/* /var/www/horizon-frontend/

# 6. إعادة تشغيل الخدمات
sudo supervisorctl restart horizon-queue-worker:*
sudo systemctl reload nginx
sudo systemctl reload php8.2-fpm

# 7. اختبار
# اختبار محلي:
curl -I http://localhost:4300
curl -I http://localhost:8080
# إذا كنت تستخدم CloudFlare، اختبر من الخارج:
curl -I https://horizonx.site
curl -I https://api.horizonx.site
```

### 15.2 Rollback (التراجع)

```bash
# إذا حدثت مشكلة، يمكنك التراجع:

# 1. استعادة قاعدة البيانات
cd /var/backups/horizon-cms
gunzip db_backup_YYYYMMDD_HHMMSS.sql.gz
psql -U horizon_user -d horizon_cms_production < db_backup_YYYYMMDD_HHMMSS.sql

# 2. استعادة الملفات
tar -xzf files_backup_YYYYMMDD_HHMMSS.tar.gz -C /

# 3. استعادة Git commit سابق
cd /var/www/horizon-cms-production
git checkout <previous-commit-hash>

# 4. إعادة بناء وإعادة تشغيل
cd BE-1.0
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo supervisorctl restart horizon-queue-worker:*
sudo systemctl reload nginx
```

---

## 16. قائمة التحقق النهائية

قبل الإعلان عن النشر، تأكد من:

- [ ] جميع ملفات `.env` محمية ولا تحتوي على معلومات حساسة في Git
- [ ] قاعدة البيانات محمية بكلمة مرور قوية
- [ ] Firewall مفعل والبورتات المطلوبة فقط مفتوحة (4300, 8080)
- [ ] Laravel في وضع Production (`APP_ENV=production`, `APP_DEBUG=false`)
- [ ] جميع Cache مفعلة (`config:cache`, `route:cache`, `view:cache`)
- [ ] Queue Worker يعمل
- [ ] النسخ الاحتياطي مُعد ويعمل
- [ ] Logs يتم تدويرها بشكل صحيح
- [ ] جميع الاختبارات تمر بنجاح
- [ ] الأداء مقبول (API response time)
- [ ] الأمان مُختبر (Headers, CORS)
- [ ] المراقبة والصيانة مُعدة
- [ ] (إذا كنت تستخدم CloudFlare) SSL مفعل في CloudFlare
- [ ] (إذا كنت تستخدم CloudFlare) DNS records صحيحة
- [ ] البورتات تعمل محلياً (4300 للـ API، 8080 للـ Frontend)
- [ ] Frontend URL: horizonx.site
- [ ] Backend URL: api.horizonx.site

---

## 17. دعم إضافي

### 17.1 مفاتيح وأدوات مفيدة

- **SSL Test**: https://www.ssllabs.com/ssltest/
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **Security Headers**: https://securityheaders.com/

### 17.2 أوامر سريعة

```bash
# إعادة تشغيل جميع الخدمات
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart postgresql
sudo supervisorctl restart horizon-queue-worker:*

# عرض حالة جميع الخدمات
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status postgresql
sudo supervisorctl status

# تنظيف Laravel Cache
cd /var/www/horizon-cms-production/BE-1.0
php artisan optimize:clear
php artisan optimize
```

---

## 18. ملاحظات مهمة

### 18.1 أدوات إضافية موصى بها

- **PM2**: لإدارة Node.js processes (إذا كنت تحتاج Node.js server)
- **New Relic / Datadog**: لمراقبة الأداء
- **Sentry**: لمراقبة الأخطاء
- **CloudFlare**: لـ CDN و DDoS protection

### 18.2 نصائح للتحسين المستمر

1. مراقبة Logs بانتظام
2. تحديث التبعيات بشكل دوري
3. مراجعة الأمان بانتظام
4. تحسين الأداء بناءً على البيانات
5. اختبار النسخ الاحتياطي بشكل دوري

---

## 19. الدعم والمساعدة

إذا واجهت مشاكل أثناء النشر:

1. راجع قسم "استكشاف الأخطاء"
2. تحقق من Logs
3. راجع الوثائق الرسمية:
   - Laravel: https://laravel.com/docs
   - Nginx: https://nginx.org/en/docs/
   - PostgreSQL: https://www.postgresql.org/docs/

---

**تم إنشاء هذا الدليل بتاريخ**: 2024  
**الإصدار**: 1.0  
**المشروع**: Horizon CMS

---

## ملخص سريع للخطوات الأساسية

```bash
# 1. إعداد الخادم (Ubuntu)
sudo apt update && sudo apt upgrade -y
sudo apt install -y php8.2-fpm composer nodejs postgresql nginx redis-server

# 2. إعداد قاعدة البيانات
sudo -u postgres psql
CREATE DATABASE horizon_cms_production;
CREATE USER horizon_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE horizon_cms_production TO horizon_user;

# 3. رفع المشروع
cd /var/www
git clone <your-repo> horizon-cms-production
cd horizon-cms-production/BE-1.0

# 4. إعداد Backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
nano .env  # تحديث الإعدادات
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize

# 5. إعداد Frontend
cd ../cms-1.0
npm ci
npm run build
sudo cp -r dist/* /var/www/horizon-frontend/

# 6. إعداد Nginx
sudo nano /etc/nginx/sites-available/horizon-api
sudo nano /etc/nginx/sites-available/horizon-frontend
sudo ln -s /etc/nginx/sites-available/horizon-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/horizon-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. إعداد SSL (إذا كنت لا تستخدم CloudFlare)
# ملاحظة: إذا كنت تستخدم CloudFlare، SSL يتم إدارته تلقائياً
# sudo apt install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d horizonx.site -d api.horizonx.site

# 8. إعداد Queue Worker
sudo nano /etc/supervisor/conf.d/horizon-queue-worker.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start horizon-queue-worker:*

# 10. إعداد النسخ الاحتياطي
sudo nano /usr/local/bin/horizon-backup-db.sh
sudo crontab -e

# 11. اختبار
# اختبار محلي:
curl -I http://localhost:4300
curl -I http://localhost:8080
# إذا كنت تستخدم CloudFlare، اختبر من الخارج:
curl -I https://horizonx.site
curl -I https://api.horizonx.site
```

---

