<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('identity_risks', function (Blueprint $table) {
            $table->id();
            $table->string('id_identity')->unique(); // ID unik buatan Anda
            $table->boolean('status')->default(true);
            $table->string('risk_category');
            $table->date('identification_date_start');
            $table->date('identification_date_end');
            $table->text('description');
            $table->integer('probability');
            $table->integer('impact');
            $table->integer('level')->nullable(); // Akan dihitung otomatis
            $table->timestamps();
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identity_risks');
    }
};