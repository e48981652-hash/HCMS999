<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class McpPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'mcp_id',
        'title',
        'platform',
        'caption',
        'status',
        'scheduled_at',
        'published_at',
        'assigned_to',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    /**
     * Get parent MCP
     */
    public function mcp()
    {
        return $this->belongsTo(Mcp::class);
    }

    /**
     * Get assigned user
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}


