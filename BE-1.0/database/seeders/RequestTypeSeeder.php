<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RequestType;
use App\Models\Team;

class RequestTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contentTeam = Team::where('name', 'Content Team')->first();
        $designTeam = Team::where('name', 'Design Team')->first();

        // Content Request Type
        $contentRequest = RequestType::create([
            'name' => 'Content Request',
            'description' => 'Request new content creation',
            'is_published' => true,
            'default_team_id' => $contentTeam?->id,
            'sla_hours' => 72, // 3 days
        ]);

        $contentRequest->fields()->createMany([
            [
                'field_key' => 'title',
                'label' => 'Title',
                'type' => 'text',
                'required' => true,
                'order' => 0,
            ],
            [
                'field_key' => 'description',
                'label' => 'Description',
                'type' => 'textarea',
                'required' => true,
                'order' => 1,
            ],
            [
                'field_key' => 'target_audience',
                'label' => 'Target Audience',
                'type' => 'text',
                'required' => false,
                'order' => 2,
            ],
        ]);

        // Design Request Type with Image field
        $designRequest = RequestType::create([
            'name' => 'Design Request',
            'description' => 'Request design work',
            'is_published' => true,
            'default_team_id' => $designTeam?->id,
            'sla_hours' => 120, // 5 days
        ]);

        $designRequest->fields()->createMany([
            [
                'field_key' => 'project_name',
                'label' => 'Project Name',
                'type' => 'text',
                'required' => true,
                'order' => 0,
            ],
            [
                'field_key' => 'description',
                'label' => 'Project Description',
                'type' => 'textarea',
                'required' => true,
                'order' => 1,
            ],
            [
                'field_key' => 'reference_images',
                'label' => 'Reference Images',
                'type' => 'image',
                'required' => false,
                'options' => [
                    'multiple' => true,
                    'max_files' => 5,
                    'max_size' => 4,
                    'allowed_types' => ['jpg', 'png', 'webp'],
                    'public' => true,
                ],
                'order' => 2,
            ],
        ]);
    }
}


