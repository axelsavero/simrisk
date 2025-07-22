<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('identify_risks', function (Blueprint $table) {
            $table->id();
            $table->string('id_identify')->unique();
            $table->boolean('is_active')->default(true);
            $table->string('risk_category');

            // Field untuk dashboard filtering
            $table->string('unit_kerja')->nullable();
            $table->string('kategori_risiko')->nullable();
            $table->year('tahun')->default(date('Y'));

            $table->date('identification_date_start');
            $table->date('identification_date_end');
            $table->text('description');
            $table->string('nama_risiko');
            $table->string('jabatan_risiko');
            $table->string('no_kontak');
            $table->string('strategi');
            $table->string('pengendalian_internal');
            $table->decimal('biaya_penangan', 15, 2);

            // Risk assessment
            $table->integer('probability');
            $table->integer('impact');
            $table->integer('level')->nullable();

            // Residual risk (setelah mitigasi)
            $table->integer('probability_residual')->nullable();
            $table->integer('impact_residual')->nullable();
            $table->integer('level_residual')->nullable();

            // Mitigasi fields
            $table->string('pemilik_risiko')->nullable();
            $table->text('rencana_mitigasi')->nullable();
            $table->date('target_mitigasi')->nullable();
            $table->enum('status_mitigasi', ['belum_dimulai', 'sedang_berjalan', 'selesai'])->default('belum_dimulai');

            // Validation workflow
            $table->string('validation_status')->default('pending')->index();
            $table->timestamp('validation_processed_at')->nullable();
            $table->foreignId('validation_processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('rejection_reason')->nullable();
            $table->json('bukti_files')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Owner of the risk

            $table->string('status')->default('Pending'); // Add status field

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identify_risks');
    }
};