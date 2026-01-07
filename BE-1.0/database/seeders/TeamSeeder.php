<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = [
            [
                'name' => 'Content Team',
                'description' => 'Handles content creation requests',
            ],
            [
                'name' => 'Design Team',
                'description' => 'Handles design requests',
            ],
        ];

        foreach ($teams as $team) {
            Team::create($team);
        }
    }
}


