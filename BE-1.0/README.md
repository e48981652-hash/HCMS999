# HorizonX Backend API

Laravel 12 Backend API for HorizonX CMS Platform

## Tech Stack
- Laravel 12
- Laravel Sanctum (Authentication)
- PostgreSQL
- RESTful API

## Setup Instructions

1. Install dependencies:
```bash
composer install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Setup database in `.env`:
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=horizonx
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. Run migrations:
```bash
php artisan migrate
```

6. Seed database:
```bash
php artisan db:seed
```

7. Link storage:
```bash
php artisan storage:link
```

8. Start server:
```bash
php artisan serve
```

## API Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected routes require Bearer token in Authorization header:
```
Authorization: Bearer {token}
```

## Documentation
API documentation available at `/api/documentation` (if enabled)


