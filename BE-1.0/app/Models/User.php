<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'status',
        'team_id',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get user's businesses
     */
    public function businesses()
    {
        return $this->hasMany(Business::class, 'owner_user_id');
    }

    /**
     * Get user's businesses (pivot for multi-user support)
     */
    public function businessUsers()
    {
        return $this->belongsToMany(Business::class, 'business_user')
            ->withPivot('role_in_business')
            ->withTimestamps();
    }

    /**
     * Get user's teams
     */
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get requests created by user
     */
    public function createdRequests()
    {
        return $this->hasMany(Request::class, 'created_by');
    }

    /**
     * Get requests assigned to user
     */
    public function assignedRequests()
    {
        return $this->hasMany(Request::class, 'assigned_user_id');
    }

    /**
     * Get MCP posts assigned to user
     */
    public function assignedMcpPosts()
    {
        return $this->hasMany(McpPost::class, 'assigned_to');
    }

    /**
     * Get user's roles
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_role')->withTimestamps();
    }

    /**
     * Check if user has permission
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->role === 'admin') {
            return true; // Admins have all permissions
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('key', $permission);
            })
            ->exists();
    }

    /**
     * Check if user owns or has access to business
     */
    public function hasBusinessAccess(int $businessId): bool
    {
        if ($this->role === 'admin') {
            return true;
        }

        return $this->businesses()->where('id', $businessId)->exists() ||
               $this->businessUsers()->where('business_id', $businessId)->exists();
    }
}


