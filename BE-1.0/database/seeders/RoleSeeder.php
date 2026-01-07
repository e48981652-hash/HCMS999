<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin role gets all permissions
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'Full access to all features',
        ]);

        $adminRole->permissions()->attach(Permission::pluck('id'));

        // Staff role - specific permissions
        $staffRole = Role::create([
            'name' => 'staff',
            'display_name' => 'Staff Member',
            'description' => 'Can handle assigned tasks and requests',
        ]);

        $staffPermissions = Permission::whereIn('key', [
            'requests.view',
            'requests.update_status',
            'mcp.view',
        ])->pluck('id');

        $staffRole->permissions()->attach($staffPermissions);

        // Client role - basic permissions
        $clientRole = Role::create([
            'name' => 'client',
            'display_name' => 'Client',
            'description' => 'Can create requests and view their data',
        ]);

        $clientPermissions = Permission::whereIn('key', [
            'businesses.view',
            'requests.create',
            'requests.view',
            'mcp.view',
            'opmp.view',
        ])->pluck('id');

        $clientRole->permissions()->attach($clientPermissions);
    }
}


