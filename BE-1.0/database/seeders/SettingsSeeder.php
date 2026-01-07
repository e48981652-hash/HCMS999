<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'whatsapp_number',
                'value' => '+1234567890',
                'description' => 'Support WhatsApp number',
            ],
            [
                'key' => 'feedback_emails',
                'value' => ['admin@example.com'],
                'description' => 'Emails to receive feedback notifications',
            ],
            [
                'key' => 'cms_welcome_message',
                'value' => 'Welcome to Horizon CMS',
                'description' => 'Welcome message for clients',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}


