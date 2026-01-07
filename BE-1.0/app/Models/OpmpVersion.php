<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpmpVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'opmp_id',
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
     * Get parent OPMP
     */
    public function opmp()
    {
        return $this->belongsTo(Opmp::class);
    }

    /**
     * Get user who updated
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}


