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
            $table->string('nama_risiko');
            $table->string('jabatan_risiko');
            $table->string('no_kontak');
            $table->string('strategi');
            $table->string('pengendalian_internal');
            $table->decimal('biaya_penangan', 15, 2);
            $table->integer('probability');
            $table->integer('impact');
            $table->integer('level')->nullable(); // Akan dihitung otomatis
            $table->string('validation_status')->default('pending')->index()->comment('Status validasi: pending, approved, rejected');
            $table->timestamp('validation_processed_at')->nullable()->comment('Waktu validasi diproses (approved/rejected)');
            $table->foreignId('validation_processed_by')->nullable()->constrained('users')->onDelete('set null')->comment('User yang memproses validasi');
            $table->text('rejection_reason')->nullable()->comment('Alasan jika validasi ditolak');
            $table->timestamps();
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identity_risks');
    }
};