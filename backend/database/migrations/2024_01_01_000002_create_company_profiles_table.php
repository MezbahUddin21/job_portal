<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('company_slug')->unique();
            $table->text('description')->nullable();
            $table->string('industry');
            $table->string('company_size')->nullable();
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            $table->string('location');
            $table->string('founded_year')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('company_profiles'); }
};
