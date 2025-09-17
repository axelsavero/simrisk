<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit', function (Blueprint $table) {
            $table->id('id_unit');
            $table->string('kode_unit', 20)->nullable();
            $table->string('nama_unit');
            $table->enum('jenis_unit', [
                'fakultas', 'prodi', 'lembaga', 'biro', 
                'upt', 'pusat', 'bagian', 'sub_bagian'
            ]);
            $table->enum('level_unit', [
                'universitas', 'fakultas', 'jurusan', 
                'program_studi', 'unit_kerja'
            ]);
            $table->foreignId('parent_unit_id')
                  ->nullable()
                  ->constrained('unit', 'id_unit')
                  ->onDelete('set null');
            $table->string('kepala_unit')->nullable();
            $table->string('email', 100)->nullable();
            $table->string('telepon', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->text('visi')->nullable();
            $table->text('misi')->nullable();
            $table->enum('status', ['aktif', 'non-aktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes untuk performance
            $table->index(['jenis_unit', 'status']);
            $table->index(['level_unit', 'status']);
            $table->index('parent_unit_id');
            $table->index('kode_unit');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit');
    }
};