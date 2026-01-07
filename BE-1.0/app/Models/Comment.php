<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'entity_type',
        'entity_id',
        'content',
    ];

    /**
     * Get comment author
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get parent entity (polymorphic)
     */
    public function entity()
    {
        return $this->morphTo();
    }
}


