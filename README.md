# Horizon CMS - Complete Client Management System

<div dir="rtl">

# نظام إدارة العملاء - Horizon CMS

</div>

A comprehensive, bilingual (Arabic/English) web platform for managing clients, requests, monthly content plans, and internal teams. Built with modern technologies for scalability and maintainability.

<div dir="rtl">

منصة ويب شاملة ثنائية اللغة (عربي/إنجليزي) لإدارة العملاء والطلبات وخطة المحتوى الشهرية والفرق الداخلية. مبنيّة بتقنيات حديثة لضمان القابلية للتوسع والصيانة.

</div>

## 🌟 Features | المميزات

### Core Features | المميزات الأساسية

- **Multi-role System** | نظام متعدد الأدوار: Support for Clients, Admins (Account Managers), and Staff
- **Bilingual Support** | دعم ثنائي اللغة: Full Arabic/English with RTL/LTR support
- **Role-based Access Control** | التحكم في الوصول حسب الدور: Protected routes based on user roles
- **Dynamic Request System** | نظام طلبات ديناميكي: Create and manage custom request types with form builder
- **Monthly Content Plans (MCP)** | خطة المحتوى الشهرية: Track and manage content schedules
- **OPMP Management** | إدارة OPMP: One-Page Marketing Plan management
- **Team Management** | إدارة الفرق: Assign requests to teams and track performance
- **Analytics & Reports** | التحليلات والتقارير: Comprehensive reporting and analytics
- **Audit Logs** | سجلات التدقيق: Track all system activities
- **Modern UI** | واجهة حديثة: Built with React, TypeScript, Tailwind CSS, and shadcn/ui

## 🛠️ Tech Stack | التقنيات المستخدمة

### Frontend
- **React 18** with TypeScript
- **React Router v7** for routing
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **i18next** for internationalization
- **React Hook Form + Zod** for form validation
- **Recharts** for charts and graphs
- **@dnd-kit** for drag & drop functionality

### Backend
- **Laravel 12** (PHP)
- **Laravel Sanctum** for authentication
- **PostgreSQL** as database
- **RESTful API** architecture
- **Queue System** for background jobs
- **Event-Driven Architecture** for notifications

## 📁 Project Structure | هيكل المشروع

```
horizon-cms1.0/
├── cms-1.0/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── pages/           # Page components
│   │   └── locales/         # Translation files
│   └── package.json
│
└── BE-1.0/                  # Backend (Laravel)
    ├── app/
    │   ├── Http/Controllers/ # API Controllers
    │   ├── Models/           # Eloquent Models
    │   ├── Events/           # Event classes
    │   ├── Jobs/             # Queue jobs
    │   └── Services/         # Business logic services
    ├── database/
    │   ├── migrations/       # Database migrations
    │   └── seeders/          # Database seeders
    └── routes/
        └── api.php           # API routes
```

## 🚀 Getting Started | البدء السريع

### Prerequisites | المتطلبات

- **Node.js** 18+ and npm/yarn
- **PHP** 8.2+ and Composer
- **PostgreSQL** 12+
- **Git**

### Installation | التثبيت

#### 1. Clone the repository | استنساخ المستودع

```bash
git clone <repository-url>
cd horizon-cms1.0
```

#### 2. Backend Setup | إعداد الـ Backend

```bash
cd BE-1.0

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=horizonx
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Link storage
php artisan storage:link

# Start server
php artisan serve
```

#### 3. Frontend Setup | إعداد الـ Frontend

```bash
cd cms-1.0

# Install dependencies
npm install

# Copy environment file (if exists)
# cp .env.example .env

# Configure API URL in .env
# VITE_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

### Default Credentials | بيانات الدخول الافتراضية

After running seeders, you can login with:
بعد تشغيل الـ seeders، يمكنك تسجيل الدخول بـ:

- **Admin**: admin@example.com / password
- **Client**: client@example.com / password
- **Staff**: staff@example.com / password

⚠️ **Important**: Change these credentials in production!

## 📚 Documentation | الوثائق

### Available Documentation | الوثائق المتاحة

- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing instructions
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [INTEGRATION_REVIEW.md](INTEGRATION_REVIEW.md) - API integration details

### API Documentation | وثائق الـ API

See [BE-1.0/API_DOCUMENTATION.md](BE-1.0/API_DOCUMENTATION.md) for complete API documentation.

## 🧪 Testing | الاختبار

### Backend Tests | اختبارات الـ Backend

```bash
cd BE-1.0
php artisan test
```

### Frontend Tests | اختبارات الـ Frontend

```bash
cd cms-1.0
npm test
```

## 🏗️ Building for Production | البناء للإنتاج

### Backend | الـ Backend

```bash
cd BE-1.0

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set environment
APP_ENV=production
APP_DEBUG=false
```

### Frontend | الـ Frontend

```bash
cd cms-1.0

# Build
npm run build

# The build output will be in dist/
```

## 🔐 Security | الأمان

- All passwords are hashed using bcrypt
- API authentication via Laravel Sanctum tokens
- CORS configured for secure cross-origin requests
- Input validation on both frontend and backend
- SQL injection protection via Eloquent ORM
- XSS protection via React's built-in escaping

## 🤝 Contributing | المساهمة

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License | الترخيص

This project is proprietary and confidential. All rights reserved.

هذا المشروع خاص وسري. جميع الحقوق محفوظة.

## 📞 Support | الدعم

For support, email support@horizon-cms.com or create an issue in the repository.

للحصول على الدعم، أرسل بريدًا إلكترونيًا إلى support@horizon-cms.com أو أنشئ مشكلة في المستودع.

## 🎯 Roadmap | خارطة الطريق

- [ ] Mobile app support
- [ ] Advanced analytics dashboard
- [ ] Email templates customization
- [ ] Webhook integrations
- [ ] Multi-tenancy support
- [ ] Advanced reporting with custom filters

---

**Built with ❤️ by Horizon Team**

<div dir="rtl">

**مبني بحب من فريق Horizon**

</div>

