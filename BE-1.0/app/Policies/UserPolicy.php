<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if user can view any users
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if user can update user
     */
    public function update(User $user, User $model): bool
    {
        return $user->role === 'admin';
    }
}


