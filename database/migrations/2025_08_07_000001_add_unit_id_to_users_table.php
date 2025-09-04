<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('users', 'unit_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->bigInteger('unit_id')->unsigned()->nullable()->after('password');
            });
        }
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'unit_id')) {
                $table->dropColumn('unit_id');
            }
        });
    }
};