<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestTypeField extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_type_id',
        'field_key',
        'label',
        'type',
        'required',
        'options',
        'validation',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'required' => 'boolean',
            'options' => 'array',
            'validation' => 'array',
        ];
    }

    /**
     * Get parent request type
     */
    public function requestType()
    {
        return $this->belongsTo(RequestType::class);
    }

    /**
     * Check if field is image type
     */
    public function isImageType(): bool
    {
        return $this->type === 'image';
    }

    /**
     * Get image upload config
     */
    public function getImageConfig(): array
    {
        if (!$this->isImageType()) {
            return [];
        }

        return [
            'multiple' => $this->options['multiple'] ?? false,
            'max_files' => $this->options['max_files'] ?? 1,
            'max_size' => $this->options['max_size'] ?? 4, // MB
            'allowed_types' => $this->options['allowed_types'] ?? ['jpg', 'png', 'webp'],
            'public' => $this->options['public'] ?? true,
        ];
    }
}


