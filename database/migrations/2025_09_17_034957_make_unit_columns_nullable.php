<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeUnitColumnsNullable extends Migration
{
    public function up()
    {
        Schema::table('unit', function (Blueprint $table) {
            $table->string('kode_unit')->nullable()->change();
            $table->string('nama_unit')->nullable()->change();
            $table->string('jenis_unit')->nullable()->change();
            $table->string('level_unit')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('unit', function (Blueprint $table) {
            $table->string('kode_unit')->nullable(false)->change();
            $table->string('nama_unit')->nullable(false)->change();
            $table->string('jenis_unit')->nullable(false)->change();
            $table->string('level_unit')->nullable(false)->change();
        });
    }
}
