# 📋 دليل تشغيل المشروع - Setup Instructions

## ✅ المتطلبات الأساسية

### Backend (Laravel 12):
- ✅ PHP 8.2+
- ✅ Composer
- ✅ PostgreSQL Database
- ✅ Laravel Server

### Frontend (React + Vite):
- ✅ Node.js 18+
- ✅ npm أو yarn

---

## 🚀 خطوات التشغيل

### 1️⃣ إعداد الباك إند (Backend)

```bash
# 1. انتقل إلى مجلد الباك إند
cd d:\horizon_CMS\horizon-cms1.0\BE-1.0

# 2. تأكد من تثبيت Dependencies
composer install

# 3. إعداد Environment File
# تأكد من وجود ملف .env وإعداد Database:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=horizonx
# DB_USERNAME=postgres
# DB_PASSWORD=your_password

# 4. توليد Application Key (إذا لم يكن موجوداً)
php artisan key:generate

# 5. تشغيل Migrations
php artisan migrate

# 6. تشغيل Seeders
php artisan db:seed

# 7. ربط Storage
php artisan storage:link

# 8. تشغيل Laravel Server
php artisan serve
# سيشتغل على: http://127.0.0.1:8000
```

### 2️⃣ إعداد الفرونت إند (Frontend)

```bash
# 1. افتح Terminal جديد وانتقل إلى مجلد الفرونت إند
cd d:\horizon_CMS\horizon-cms1.0\cms-1.0

# 2. تأكد من تثبيت Dependencies
npm install

# 3. تأكد من وجود ملف .env
# VITE_API_URL=http://localhost:8000/api/v1

# 4. تشغيل Development Server
npm run dev
# سيشتغل على: http://localhost:8080
```

---

## 🧪 اختبار التطبيق

### 1. اختبار تسجيل الدخول

**طريقة 1: من الواجهة**
1. افتح http://localhost:8080
2. سجّل حساب جديد من صفحة Signup
3. أو سجّل دخول بحساب موجود

**طريقة 2: من API مباشرة**

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. اختبار الصفحات

**Client Pages:**
- ✅ Login: http://localhost:8080/login
- ✅ Signup: http://localhost:8080/signup
- ✅ Dashboard: http://localhost:8080/app/client/home
- ✅ Onboarding: http://localhost:8080/app/client/onboarding/add-business
- ✅ Requests Catalog: http://localhost:8080/app/client/requests
- ✅ My Requests: http://localhost:8080/app/client/my-requests
- ✅ MCP: http://localhost:8080/app/client/mcp
- ✅ OPMP: http://localhost:8080/app/client/opmp
- ✅ Support: http://localhost:8080/app/client/support
- ✅ Feedback: http://localhost:8080/app/client/feedback

**Admin Pages:**
- ✅ Admin Dashboard: http://localhost:8080/app/admin/dashboard
- ✅ Clients Management: http://localhost:8080/app/admin/clients
- ✅ Request Types Builder: http://localhost:8080/app/admin/request-types
- ✅ Teams Management: http://localhost:8080/app/admin/teams
- ✅ MCP Management: http://localhost:8080/app/admin/mcp
- ✅ Settings: http://localhost:8080/app/admin/settings

**Staff Pages:**
- ✅ Staff Dashboard: http://localhost:8080/app/staff/dashboard
- ✅ Tasks & Requests: http://localhost:8080/app/staff/requests
- ✅ Staff MCP: http://localhost:8080/app/staff/mcp

---

## 🔧 إعدادات مهمة

### CORS Configuration ✅
- تم تحديث `BE-1.0/config/cors.php` لدعم `http://localhost:8080`

### Environment Variables ✅
- **Backend (.env):**
  ```
  CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173,http://localhost:3000
  SANCTUM_STATEFUL_DOMAINS=localhost:8080,localhost:5173,localhost:3000
  ```

- **Frontend (.env):**
  ```
  VITE_API_URL=http://localhost:8000/api/v1
  ```

---

## 📝 ملاحظات

1. **الباك إند يجب أن يعمل قبل الفرونت إند** - لأن الفرونت إند يحتاج API

2. **Database يجب أن يكون جاهزاً** - تأكد من تشغيل PostgreSQL

3. **Storage Link** - تأكد من تشغيل `php artisan storage:link` لرفع الصور

4. **Queue Worker** (اختياري) - للـ Jobs:
   ```bash
   php artisan queue:work
   ```

5. **الصفحات التي تستخدم Mock Data حالياً:**
   - بعض صفحات Dashboard تستخدم Mock data
   - يمكن تحديثها تدريجياً لاستخدام API

---

## ✅ Checklist قبل التشغيل

- [ ] PostgreSQL Database running
- [ ] Backend `.env` configured
- [ ] Backend migrations run (`php artisan migrate`)
- [ ] Backend seeders run (`php artisan db:seed`)
- [ ] Backend storage linked (`php artisan storage:link`)
- [ ] Backend server running (`php artisan serve`)
- [ ] Frontend `.env` file exists with `VITE_API_URL`
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend server running (`npm run dev`)

---

## 🐛 Troubleshooting

### مشكلة CORS:
```bash
# تأكد من تحديث config/cors.php وإعادة تشغيل Server
php artisan config:clear
php artisan serve
```

### مشكلة Database:
```bash
# تأكد من إعدادات .env
# تحقق من اتصال PostgreSQL
php artisan migrate:status
```

### مشكلة Token:
```bash
# تأكد من Application Key
php artisan key:generate
```

---

## 🎉 جاهز!

المشروع جاهز للاستخدام والتطوير! 🚀

