<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Mcp;

class McpPolicy
{
    /**
     * Determine if user can create MCP
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if user can update MCP
     */
    public function update(User $user, Mcp $mcp): bool
    {
        return $user->role === 'admin';
    }
}


