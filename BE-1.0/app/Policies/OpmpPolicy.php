<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Opmp;

class OpmpPolicy
{
    /**
     * Determine if user can update OPMP
     */
    public function update(User $user, Opmp $opmp): bool
    {
        return $user->role === 'admin';
    }
}


