<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('request_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_published')->default(false);
            $table->foreignId('default_team_id')->nullable()->constrained('teams')->onDelete('set null');
            $table->integer('sla_hours')->default(72); // Default 3 days
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_published');
        });

        Schema::create('request_type_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_type_id')->constrained('request_types')->onDelete('cascade');
            $table->string('field_key');
            $table->string('label');
            $table->enum('type', ['text', 'textarea', 'select', 'multiselect', 'date', 'file', 'image'])->default('text');
            $table->boolean('required')->default(false);
            $table->json('options')->nullable(); // For select/multiselect options and image config
            $table->json('validation')->nullable(); // Additional validation rules
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['request_type_id', 'order']);
            $table->unique(['request_type_id', 'field_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_type_fields');
        Schema::dropIfExists('request_types');
    }
};

