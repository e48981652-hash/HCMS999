<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_user_id',
        'name',
        'industry',
        'description',
        'social_links',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
        ];
    }

    /**
     * Get business owner
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /**
     * Get business users (pivot)
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'business_user')
            ->withPivot('role_in_business')
            ->withTimestamps();
    }

    /**
     * Get business requests
     */
    public function requests()
    {
        return $this->hasMany(Request::class);
    }

    /**
     * Get business MCPs
     */
    public function mcps()
    {
        return $this->hasMany(Mcp::class);
    }

    /**
     * Get business OPMP
     */
    public function opmp()
    {
        return $this->hasOne(Opmp::class);
    }
}


