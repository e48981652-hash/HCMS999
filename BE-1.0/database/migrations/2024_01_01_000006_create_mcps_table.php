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
        Schema::create('mcps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->string('month'); // Format: YYYY-MM
            $table->enum('status', ['draft', 'in-preparation', 'ready', 'published'])->default('draft');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['business_id', 'month']);
            $table->index(['business_id', 'status']);
        });

        Schema::create('mcp_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mcp_id')->constrained('mcps')->onDelete('cascade');
            $table->string('title');
            $table->string('platform'); // Instagram, Facebook, Twitter, etc.
            $table->text('caption')->nullable();
            $table->enum('status', ['draft', 'in-preparation', 'scheduled', 'published'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->json('metadata')->nullable(); // Additional platform-specific data
            $table->timestamps();
            $table->softDeletes();

            $table->index(['mcp_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mcp_posts');
        Schema::dropIfExists('mcps');
    }
};


