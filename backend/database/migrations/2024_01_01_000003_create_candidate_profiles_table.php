<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('candidate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->string('headline')->nullable();
            $table->string('location')->nullable();
            $table->string('experience_years')->nullable();
            $table->string('current_salary')->nullable();
            $table->string('expected_salary')->nullable();
            $table->enum('availability', ['immediately', 'two_weeks', 'one_month', 'not_looking'])->default('immediately');
            $table->string('resume')->nullable();
            $table->json('skills')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('candidate_profiles'); }
};
