<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['key' => 'clients.view', 'name' => 'View Clients', 'description' => 'Can view clients list'],
            ['key' => 'clients.manage', 'name' => 'Manage Clients', 'description' => 'Can create, update, delete clients'],
            ['key' => 'businesses.view', 'name' => 'View Businesses', 'description' => 'Can view businesses'],
            ['key' => 'businesses.manage', 'name' => 'Manage Businesses', 'description' => 'Can create, update, delete businesses'],
            ['key' => 'requests.create', 'name' => 'Create Requests', 'description' => 'Can create new requests'],
            ['key' => 'requests.view', 'name' => 'View Requests', 'description' => 'Can view requests'],
            ['key' => 'requests.assign', 'name' => 'Assign Requests', 'description' => 'Can assign requests to teams/users'],
            ['key' => 'requests.update_status', 'name' => 'Update Request Status', 'description' => 'Can update request status'],
            ['key' => 'mcp.view', 'name' => 'View MCP', 'description' => 'Can view monthly content plans'],
            ['key' => 'mcp.manage', 'name' => 'Manage MCP', 'description' => 'Can create and manage MCPs'],
            ['key' => 'opmp.view', 'name' => 'View OPMP', 'description' => 'Can view operational marketing plans'],
            ['key' => 'opmp.manage', 'name' => 'Manage OPMP', 'description' => 'Can edit operational marketing plans'],
            ['key' => 'settings.manage', 'name' => 'Manage Settings', 'description' => 'Can manage system settings'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
    }
}


