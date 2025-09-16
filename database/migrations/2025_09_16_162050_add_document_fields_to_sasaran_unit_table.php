<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sasaran_unit', function (Blueprint $table) {
            // Tambahkan kolom yang divalidasi di controller Anda
            $table->string('kategori')->after('id_unit'); // Sesuaikan 'after'
            $table->string('nama_dokumen')->nullable()->after('kategori');
            $table->string('nomor_dokumen')->nullable()->after('nama_dokumen');
            $table->date('tanggal_dokumen')->nullable()->after('nomor_dokumen');
            $table->string('file_path')->nullable()->after('tanggal_dokumen');
        });
    }

    public function down(): void
    {
        Schema::table('sasaran_unit', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'nama_dokumen', 'nomor_dokumen', 'tanggal_dokumen', 'file_path']);
        });
    }
};