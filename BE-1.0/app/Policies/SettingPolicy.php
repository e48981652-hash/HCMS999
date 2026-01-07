<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Setting;

class SettingPolicy
{
    /**
     * Determine if user can view any settings
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if user can update setting
     */
    public function update(User $user, Setting $setting): bool
    {
        return $user->role === 'admin';
    }
}


