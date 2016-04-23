<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateRcUsersDeleteIndexEmail extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rc_users', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('rc_users', function (Blueprint $table) {
            $table->unique(['email']);
        });
    }
}
