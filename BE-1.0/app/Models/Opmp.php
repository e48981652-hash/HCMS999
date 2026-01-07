<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Opmp extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_id',
        'data',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    /**
     * Get business
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get user who last updated
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get versions
     */
    public function versions()
    {
        return $this->hasMany(OpmpVersion::class);
    }
}


