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
       Schema::create('hak_akses', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
        $table->primary(['user_id', 'role_id']);
        $table->timestamps();
        
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hak_akses');
    }
};
