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
        Schema::table('mitigasis', function (Blueprint $table) {
            $table->tinyInteger('probability')->unsigned()->default(1)->after('status_mitigasi');
            $table->tinyInteger('impact')->unsigned()->default(1)->after('probability');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mitigasis', function (Blueprint $table) {
            $table->dropColumn(['probability', 'impact']);
        });
    }
};