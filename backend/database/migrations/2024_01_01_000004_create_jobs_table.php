<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->text('benefits')->nullable();
            $table->enum('type', ['full-time', 'part-time', 'contract', 'freelance', 'internship']);
            $table->string('category');
            $table->string('location');
            $table->boolean('is_remote')->default(false);
            $table->decimal('salary_min', 10, 2)->nullable();
            $table->decimal('salary_max', 10, 2)->nullable();
            $table->string('currency')->default('USD');
            $table->enum('experience_level', ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']);
            $table->enum('status', ['draft', 'published', 'closed', 'paused'])->default('draft');
            $table->integer('views')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('category');
            $table->index('location');
        });
    }
    public function down(): void { Schema::dropIfExists('jobs'); }
};
