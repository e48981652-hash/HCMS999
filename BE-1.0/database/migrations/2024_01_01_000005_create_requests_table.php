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
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_type_id')->constrained('request_types')->onDelete('restrict');
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('assigned_team_id')->nullable()->constrained('teams')->onDelete('set null');
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['new', 'draft', 'in-preparation', 'ready', 'scheduled', 'published', 'needs-review', 'completed', 'in-progress', 'waiting', 'overdue'])->default('new');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->timestamp('due_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'status']);
            $table->index(['assigned_user_id', 'status']);
            $table->index(['assigned_team_id', 'status']);
            $table->index('due_at');
        });

        Schema::create('request_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            $table->string('field_key');
            $table->text('value_text')->nullable();
            $table->json('value_json')->nullable(); // For complex data like images
            $table->timestamps();

            $table->index(['request_id', 'field_key']);
            $table->unique(['request_id', 'field_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_field_values');
        Schema::dropIfExists('requests');
    }
};


