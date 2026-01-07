<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestFieldValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'field_key',
        'value_text',
        'value_json',
    ];

    protected function casts(): array
    {
        return [
            'value_json' => 'array',
        ];
    }

    /**
     * Get parent request
     */
    public function request()
    {
        return $this->belongsTo(Request::class);
    }
}


