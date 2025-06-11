<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sasaran_univ', function (Blueprint $table) {
            $table->id('id_sasaran_univ');
            $table->string('kode_sasaran', 20)->unique();
            $table->string('nama_sasaran');
            $table->text('deskripsi')->nullable();
            $table->decimal('target_capaian', 12, 2)->nullable();
            $table->string('satuan_target', 50)->nullable();
            $table->year('periode_tahun');
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->decimal('bobot_penilaian', 5, 2)->default(0);
            $table->enum('prioritas', ['tinggi', 'sedang', 'rendah'])->default('sedang');
            $table->enum('kategori', [
                'akademik', 'penelitian', 'pengabdian', 
                'kemahasiswaan', 'keuangan', 'infrastruktur'
            ])->nullable();
            $table->enum('status', ['aktif', 'non-aktif', 'selesai', 'ditunda'])->default('aktif');
            $table->string('pic_sasaran')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['periode_tahun', 'status']);
            $table->index(['kategori', 'prioritas']);
            $table->index('kode_sasaran');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sasaran_univ');
    }
};
