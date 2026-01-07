<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mcp extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_id',
        'month',
        'status',
    ];

    /**
     * Get business
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get MCP posts
     */
    public function posts()
    {
        return $this->hasMany(McpPost::class);
    }
}


