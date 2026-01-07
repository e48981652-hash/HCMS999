<?php

namespace App\Policies;

use App\Models\User;
use App\Models\RequestType;

class RequestTypePolicy
{
    /**
     * Determine if user can view any request types
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if user can create request types
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if user can update request type
     */
    public function update(User $user, RequestType $requestType): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if user can delete request type
     */
    public function delete(User $user, RequestType $requestType): bool
    {
        return $user->role === 'admin';
    }
}


