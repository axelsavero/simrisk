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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'unit_id')) {
                $table->unsignedBigInteger('unit_id')->nullable()->after('password');
                $table->index('unit_id');
            }
            if (!Schema::hasColumn('users', 'unit')) {
                $table->string('unit')->nullable()->after('unit_id');
            }
            if (!Schema::hasColumn('users', 'kode_unit')) {
                $table->string('kode_unit')->nullable()->after('unit');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'kode_unit')) {
                $table->dropColumn('kode_unit');
            }
            if (Schema::hasColumn('users', 'unit')) {
                $table->dropColumn('unit');
            }
            if (Schema::hasColumn('users', 'unit_id')) {
                $table->dropIndex(['unit_id']);
                $table->dropColumn('unit_id');
            }
        });
    }
};


