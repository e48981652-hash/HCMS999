# 🚀 Quick Start Guide

## تشغيل سريع للمشروع

### 1️⃣ الباك إند (Terminal 1)
```bash
cd d:\horizon_CMS\horizon-cms1.0\BE-1.0
php artisan serve
```

### 2️⃣ الفرونت إند (Terminal 2)
```bash
cd d:\horizon_CMS\horizon-cms1.0\cms-1.0
npm run dev
```

### 3️⃣ افتح المتصفح
```
http://localhost:8080
```

---

## ✅ التحقق من التكامل

### اختبار API مباشرة:
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","password":"password123","password_confirmation":"password123"}'

# Login  
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### من المتصفح:
1. افتح http://localhost:8080
2. سجّل حساب جديد
3. سجّل دخول
4. اختبر الصفحات

---

## 📝 ملاحظات مهمة

✅ **CORS configured** - يدعم port 8080  
✅ **API Client created** - في `src/lib/api.ts`  
✅ **AuthContext updated** - يستخدم API  
✅ **All Auth pages updated** - Login, Signup, Forgot/Reset Password  
✅ **Environment files ready** - `.env` files configured  

---

## 🔧 إذا واجهت مشاكل

### CORS Error:
```bash
cd BE-1.0
php artisan config:clear
php artisan serve
```

### API Connection Error:
- تأكد من أن Backend يعمل على port 8000
- تحقق من `VITE_API_URL` في `.env`
- افتح Browser Console للتحقق من الأخطاء

---

**جاهز للاختبار!** 🎉

