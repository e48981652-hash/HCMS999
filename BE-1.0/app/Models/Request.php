<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Request extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_type_id',
        'business_id',
        'created_by',
        'assigned_team_id',
        'assigned_user_id',
        'status',
        'priority',
        'due_at',
    ];

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
        ];
    }

    /**
     * Get request type
     */
    public function requestType()
    {
        return $this->belongsTo(RequestType::class);
    }

    /**
     * Get business
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get creator
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get assigned team
     */
    public function assignedTeam()
    {
        return $this->belongsTo(Team::class, 'assigned_team_id');
    }

    /**
     * Get assigned user
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Get field values
     */
    public function fieldValues()
    {
        return $this->hasMany(RequestFieldValue::class);
    }

    /**
     * Get comments
     */
    public function comments()
    {
        return $this->morphMany(Comment::class, 'entity');
    }

    /**
     * Get attachments
     */
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'entity');
    }

    /**
     * Get field value by key
     */
    public function getFieldValue(string $fieldKey)
    {
        $fieldValue = $this->fieldValues()->where('field_key', $fieldKey)->first();
        
        if (!$fieldValue) {
            return null;
        }

        // Return JSON if available, otherwise text
        return $fieldValue->value_json ?? $fieldValue->value_text;
    }

    /**
     * Set field value
     */
    public function setFieldValue(string $fieldKey, $value): void
    {
        $this->fieldValues()->updateOrCreate(
            ['field_key' => $fieldKey],
            [
                'value_text' => is_string($value) ? $value : null,
                'value_json' => is_array($value) || is_object($value) ? $value : null,
            ]
        );
    }
}


