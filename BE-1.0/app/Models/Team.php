<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get team members
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get requests assigned to team
     */
    public function requests()
    {
        return $this->hasMany(Request::class, 'assigned_team_id');
    }

    /**
     * Get request types with this as default team
     */
    public function defaultRequestTypes()
    {
        return $this->hasMany(RequestType::class, 'default_team_id');
    }
}


