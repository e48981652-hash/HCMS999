# Artisan Commands Reference

## Setup Commands

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Link storage (for public file access)
php artisan storage:link

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Development Commands

```bash
# Start development server
php artisan serve

# Run queue worker (for jobs)
php artisan queue:work

# List all routes
php artisan route:list

# Create new migration
php artisan make:migration create_example_table

# Create new model with migration
php artisan make:model Example -m

# Create new controller
php artisan make:controller Api/V1/ExampleController

# Create new policy
php artisan make:policy ExamplePolicy --model=Example

# Create new event
php artisan make:event ExampleEvent

# Create new listener
php artisan make:listener ExampleListener --event=ExampleEvent

# Create new job
php artisan make:job ExampleJob
```

## Production Commands

```bash
# Optimize for production
php artisan optimize

# Cache routes
php artisan route:cache

# Cache config
php artisan config:cache

# Cache views
php artisan view:cache
```


