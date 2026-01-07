<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequestType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'is_published',
        'default_team_id',
        'sla_hours',
    ];

    /**
     * Get request type fields
     */
    public function fields()
    {
        return $this->hasMany(RequestTypeField::class)->orderBy('order');
    }

    /**
     * Get default team
     */
    public function defaultTeam()
    {
        return $this->belongsTo(Team::class, 'default_team_id');
    }

    /**
     * Get requests of this type
     */
    public function requests()
    {
        return $this->hasMany(Request::class);
    }
}


