# ملف Environment Variables - مثال

أنشئ ملف `.env` في مجلد `BE-1.0` وانسخ المحتوى التالي:

```env
APP_NAME="HorizonX CMS"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

LOG_CHANNEL=stack
LOG_LEVEL=debug
LOG_DEPRECATIONS_CHANNEL=null
LOG_STACK=single

# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=horizonx
DB_USERNAME=postgres
DB_PASSWORD=

# Database Connection String (optional, overrides above)
# DB_URL=postgresql://user:password@127.0.0.1:5432/horizonx

# Redis Configuration (optional)
REDIS_CLIENT=phpredis
REDIS_CLUSTER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
# REDIS_URL=redis://127.0.0.1:6379/0

# Cache Configuration
CACHE_STORE=database
CACHE_PREFIX=
CACHE_DB_TABLE=cache
CACHE_DB_CONNECTION=

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_CONNECTION=
SESSION_STORE=
SESSION_COOKIE=
SESSION_PATH=/
SESSION_DOMAIN=
SESSION_SECURE_COOKIE=

# Queue Configuration
QUEUE_CONNECTION=database
QUEUE_FAILED_DRIVER=database-uuids

# Filesystem Configuration
FILESYSTEM_DISK=local

# Mail Configuration
MAIL_MAILER=log
MAIL_LOG_CHANNEL=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173,http://localhost:3000

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:5173,localhost:8080,127.0.0.1,127.0.0.1:8000,::1
SANCTUM_TOKEN_PREFIX=

# N8N Webhook Integration (optional)
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=your-secret-key

# Authentication Configuration
AUTH_GUARD=web
AUTH_PASSWORD_BROKER=users
AUTH_MODEL=App\Models\User
AUTH_PASSWORD_RESET_TOKEN_TABLE=password_reset_tokens
AUTH_PASSWORD_TIMEOUT=10800
```

## خطوات الإعداد:

1. أنشئ ملف `.env` في مجلد `BE-1.0`
2. انسخ المحتوى أعلاه إلى الملف
3. عدّل القيم حسب بيئتك:
   - `DB_DATABASE`: اسم قاعدة البيانات
   - `DB_USERNAME`: اسم مستخدم قاعدة البيانات
   - `DB_PASSWORD`: كلمة مرور قاعدة البيانات
   - `APP_KEY`: سيتم توليده تلقائياً عند تشغيل `php artisan key:generate`
4. شغّل `php artisan key:generate` لتوليد `APP_KEY`

## ملاحظات مهمة:

- **CORS_ALLOWED_ORIGINS**: يجب أن يحتوي على عنوان الفرونت إند (عادة `http://localhost:8080`)
- **SANCTUM_STATEFUL_DOMAINS**: يجب أن يحتوي على جميع العناوين التي ستعمل منها الفرونت إند
- **N8N_WEBHOOK_URL**: اختياري - أضفه فقط إذا كنت تستخدم n8n
- **N8N_WEBHOOK_SECRET**: اختياري - يجب تغييره لقيمة آمنة إذا كنت تستخدم n8n

