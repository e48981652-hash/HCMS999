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
        Schema::create('opmps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->json('data'); // JSONB for flexible structure
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique('business_id');
            $table->index('business_id');
        });

        // Optional versioning table
        Schema::create('opmp_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opmp_id')->constrained('opmps')->onDelete('cascade');
            $table->json('data');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['opmp_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opmp_versions');
        Schema::dropIfExists('opmps');
    }
};


