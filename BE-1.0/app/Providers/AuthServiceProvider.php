<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\RequestType;
use App\Models\Team;
use App\Models\Mcp;
use App\Models\Opmp;
use App\Models\Setting;
use App\Policies\RequestTypePolicy;
use App\Policies\TeamPolicy;
use App\Policies\McpPolicy;
use App\Policies\OpmpPolicy;
use App\Policies\SettingPolicy;
use App\Policies\UserPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        RequestType::class => RequestTypePolicy::class,
        Team::class => TeamPolicy::class,
        Mcp::class => McpPolicy::class,
        Opmp::class => OpmpPolicy::class,
        Setting::class => SettingPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Register Gates for permissions
        Gate::before(function (User $user, string $ability) {
            if ($user->role === 'admin') {
                return true;
            }
        });
    }
}


