<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BusinessController;
use App\Http\Controllers\Api\V1\RequestTypeController;
use App\Http\Controllers\Api\V1\RequestController;
use App\Http\Controllers\Api\V1\McpController;
use App\Http\Controllers\Api\V1\OpmpController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\FeedbackController;
use App\Http\Controllers\Api\V1\Admin\ClientController as AdminClientController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\RequestTypeController as AdminRequestTypeController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Api\V1\Client\ClientDashboardController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\AttachmentController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReportsController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ExportController;
use App\Http\Controllers\Api\V1\AuditLogsController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\ActivityController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });

        // Businesses
        Route::apiResource('businesses', BusinessController::class);

        // Request Types (published for clients)
        Route::get('/request-types', [RequestTypeController::class, 'index']);

        // Requests
        Route::apiResource('requests', RequestController::class);
        Route::post('/requests/bulk', [RequestController::class, 'bulk']);
        
        // Comments
        Route::prefix('requests/{requestId}/comments')->group(function () {
            Route::get('/', [CommentController::class, 'index']);
            Route::post('/', [CommentController::class, 'store']);
        });
        Route::patch('/comments/{id}', [CommentController::class, 'update']);
        Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

        // Attachments
        Route::prefix('requests/{requestId}/attachments')->group(function () {
            Route::get('/', [AttachmentController::class, 'index']);
            Route::post('/', [AttachmentController::class, 'store']);
        });
        Route::get('/attachments/{id}/download', [AttachmentController::class, 'download']);
        Route::delete('/attachments/{id}', [AttachmentController::class, 'destroy']);

        // MCP
        Route::prefix('businesses/{businessId}/mcps')->group(function () {
            Route::get('/', [McpController::class, 'index']);
            Route::post('/', [McpController::class, 'store']);
        });
        Route::patch('/mcp-posts/{id}', [McpController::class, 'updatePost']);

        // OPMP
        Route::prefix('businesses/{businessId}/opmp')->group(function () {
            Route::get('/', [OpmpController::class, 'show']);
            Route::patch('/', [OpmpController::class, 'update']);
            Route::get('/versions', [OpmpController::class, 'versions']);
        });

        // Feedback
        Route::post('/feedback', [FeedbackController::class, 'store']);

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });

        // Reports (Admin only)
        Route::prefix('reports')->middleware('role:admin')->group(function () {
            Route::get('/requests', [ReportsController::class, 'requests']);
            Route::get('/clients', [ReportsController::class, 'clients']);
            Route::get('/teams', [ReportsController::class, 'teams']);
        });

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
            Route::get('/requests', [AnalyticsController::class, 'requests']);
            Route::get('/teams', [AnalyticsController::class, 'teams']);
        });

        // Export (Admin only)
        Route::prefix('export')->middleware('role:admin')->group(function () {
            Route::post('/requests', [ExportController::class, 'requests']);
            Route::post('/clients', [ExportController::class, 'clients']);
        });

        // Audit Logs (Admin only)
        Route::prefix('audit-logs')->middleware('role:admin')->group(function () {
            Route::get('/', [AuditLogsController::class, 'index']);
            Route::get('/{id}', [AuditLogsController::class, 'show']);
        });

        // Search
        Route::get('/search', [SearchController::class, 'index']);

        // Activity Feed
        Route::get('/activity/feed', [ActivityController::class, 'feed']);

        // Client routes
        Route::prefix('client')->middleware('role:client')->group(function () {
            Route::get('/dashboard', [ClientDashboardController::class, 'index']);
        });

        // Staff routes
        Route::prefix('staff')->middleware('role:staff')->group(function () {
            Route::get('/dashboard', [StaffDashboardController::class, 'index']);
        });

        // Admin routes
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            
            // Clients
            Route::prefix('clients')->group(function () {
                Route::get('/', [AdminClientController::class, 'index']);
                Route::post('/', [AdminClientController::class, 'store']);
                Route::post('/bulk', [AdminClientController::class, 'bulk']);
                Route::get('/{id}', [AdminClientController::class, 'show']);
                Route::patch('/{id}/suspend', [AdminClientController::class, 'suspend']);
                Route::patch('/{id}/activate', [AdminClientController::class, 'activate']);
            });

            // Request Types
            Route::prefix('request-types')->group(function () {
                Route::get('/', [AdminRequestTypeController::class, 'adminIndex']);
                Route::post('/', [AdminRequestTypeController::class, 'store']);
                Route::patch('/{id}', [AdminRequestTypeController::class, 'update']);
            });

            // Teams
            Route::apiResource('teams', TeamController::class);
            Route::post('/teams/{id}/assign-users', [TeamController::class, 'assignUsers']);

            // Settings
            Route::prefix('settings')->group(function () {
                Route::get('/', [SettingsController::class, 'index']);
                Route::get('/{key}', [SettingsController::class, 'show']);
                Route::patch('/{key}', [SettingsController::class, 'update']);
            });

            // Users (Admin/Staff Management)
            Route::prefix('users')->group(function () {
                Route::get('/', [AdminUserController::class, 'index']);
                Route::post('/', [AdminUserController::class, 'store']);
                Route::get('/{id}', [AdminUserController::class, 'show']);
                Route::patch('/{id}', [AdminUserController::class, 'update']);
                Route::delete('/{id}', [AdminUserController::class, 'destroy']);
            });
        });
    });
});

