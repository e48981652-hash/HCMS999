# 🧪 دليل الاختبار - Testing Guide

## ✅ ما تم إنجازه

### Backend (Laravel 12) ✅
- ✅ جميع Migrations جاهزة (18 migration)
- ✅ جميع Models مع Relationships
- ✅ جميع Controllers (14 controller)
- ✅ جميع Routes (41 routes)
- ✅ Events & Jobs للـ n8n integration
- ✅ Policies & Middleware للصلاحيات
- ✅ CORS configured لدعم port 8080

### Frontend (React) ✅
- ✅ API Client جاهز (`src/lib/api.ts`)
- ✅ AuthContext محدّث للاتصال بالباك إند
- ✅ Login/Signup/ForgotPassword/ResetPassword محدّثة
- ✅ Onboarding page محدّثة
- ✅ Feedback page محدّثة
- ✅ Environment file (`.env`) جاهز

---

## 🚀 خطوات التشغيل

### Terminal 1 - Backend:
```bash
cd d:\horizon_CMS\horizon-cms1.0\BE-1.0
php artisan serve
# ✅ يعمل على: http://127.0.0.1:8000
```

### Terminal 2 - Frontend:
```bash
cd d:\horizon_CMS\horizon-cms1.0\cms-1.0
npm run dev
# ✅ يعمل على: http://localhost:8080
```

---

## 🧪 سيناريوهات الاختبار

### 1. اختبار Authentication ✅

#### A. تسجيل حساب جديد:
1. افتح http://localhost:8080
2. اضغط "Sign Up"
3. املأ البيانات:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
4. اضغط "Sign Up"
5. ✅ يجب أن يتم إنشاء الحساب والانتقال إلى Onboarding

#### B. تسجيل الدخول:
1. من صفحة Login
2. Email: test@example.com
3. Password: password123
4. اضغط "Login"
5. ✅ يجب أن يتم تسجيل الدخول والانتقال للـ Dashboard

#### C. نسيان كلمة المرور:
1. اضغط "Forgot Password"
2. أدخل Email
3. ✅ يجب أن تظهر رسالة نجاح

---

### 2. اختبار Client Features ✅

#### A. Onboarding (إضافة Business):
1. بعد Signup، ستذهب تلقائياً لصفحة Onboarding
2. املأ:
   - Business Name: My Business
   - Industry: Technology
   - Description: Test business
3. اضغط "Create Business"
4. ✅ يجب أن يتم إنشاء Business والانتقال للـ Dashboard

#### B. إنشاء Request:
1. اذهب إلى "Requests Catalog"
2. اختر Request Type
3. املأ الحقول (إذا كانت موجودة)
4. اضغط "Create Request"
5. ✅ يجب أن يتم إنشاء Request

#### C. إرسال Feedback:
1. اذهب إلى "Feedback"
2. املأ:
   - Category: Feature Request
   - Subject: Test Feedback
   - Message: This is a test feedback
   - Rating: 5 stars (اختياري)
3. اضغط "Send Feedback"
4. ✅ يجب أن تظهر رسالة نجاح

---

### 3. اختبار Admin Features ✅

#### A. تسجيل دخول Admin:
- سجّل حساب جديد
- في Database، غيّر role إلى 'admin':
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
  ```
- أو استخدم حساب admin من Seeders

#### B. إدارة Clients:
1. اذهب إلى "Clients"
2. ✅ يجب أن ترى قائمة Clients
3. جرب Suspend/Activate Client

#### C. Request Types Builder:
1. اذهب إلى "Request Types"
2. اضغط "Create Request Type"
3. أضف Fields (text, image, select, etc.)
4. ✅ يجب أن يتم حفظ Request Type

---

### 4. اختبار API مباشرة (Postman/Thunder Client) ✅

#### Register:
```http
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login:
```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Get User Info (بعد Login، استخدم Token):
```http
GET http://localhost:8000/api/v1/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Create Business:
```http
POST http://localhost:8000/api/v1/businesses
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Test Business",
  "industry": "Technology",
  "description": "Test description"
}
```

---

## 🔍 التحقق من التكامل

### 1. Browser Console:
افتح Developer Tools (F12) وتحقق من:
- ✅ لا توجد CORS errors
- ✅ API calls تنجح
- ✅ Token يتم حفظه في localStorage
- ✅ Responses تحتوي على البيانات الصحيحة

### 2. Network Tab:
راقب Network requests:
- ✅ `/api/v1/auth/login` → 200 OK
- ✅ `/api/v1/auth/me` → 200 OK
- ✅ `/api/v1/businesses` → 200 OK

### 3. Database:
تحقق من البيانات:
```sql
-- Check users
SELECT * FROM users;

-- Check businesses
SELECT * FROM businesses;

-- Check requests
SELECT * FROM requests;
```

---

## 📋 Checklist الاختبار

### Authentication ✅
- [ ] Signup يعمل
- [ ] Login يعمل
- [ ] Logout يعمل
- [ ] Token يتم حفظه
- [ ] Protected routes تعمل

### Client Features ✅
- [ ] Onboarding (Create Business) يعمل
- [ ] Dashboard يعرض البيانات
- [ ] Requests Catalog يعرض Request Types
- [ ] Create Request يعمل
- [ ] Feedback submission يعمل

### Admin Features ✅
- [ ] Admin login يعمل
- [ ] Clients page يعرض Clients
- [ ] Request Types Builder يعمل
- [ ] Teams management يعمل

---

## 🎉 الخلاصة

المشروع جاهز للاختبار! 🚀

- ✅ Backend يعمل على port 8000
- ✅ Frontend يعمل على port 8080
- ✅ API Integration جاهز
- ✅ Authentication متكامل
- ✅ CORS configured

**ابدأ الاختبار الآن!**

