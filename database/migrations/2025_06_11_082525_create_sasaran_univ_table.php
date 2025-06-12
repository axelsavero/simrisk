<?php
// database/migrations/xxxx_add_dokumen_fields_to_sasaran_univ_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;



return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sasaran_univ', function (Blueprint $table) {
            $table->id('id_sasaran_univ');
            $table->string('kategori');
            $table->string('nama_dokumen')->nullable();
            $table->string('nomor_dokumen')->nullable();
            $table->date('tanggal_dokumen')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sasaran_univ');
    }
};

