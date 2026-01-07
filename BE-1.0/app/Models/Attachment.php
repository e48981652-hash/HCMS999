<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'entity_type',
        'entity_id',
        'uploaded_by',
        'file_path',
        'file_name',
        'mime_type',
        'size',
        'disk',
    ];

    /**
     * Get uploader
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get parent entity (polymorphic)
     */
    public function entity()
    {
        return $this->morphTo();
    }

    /**
     * Get full URL
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->file_path);
    }
}


