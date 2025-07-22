<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('risk_references', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['kategori', 'kriteria']);
            $table->string('title');
            $table->text('description');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_references');
    }
};
