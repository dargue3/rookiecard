<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateRcUsers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rc_users', function (Blueprint $table) {
            $table->softDeletes();
            $table->string('pic');
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
            $table->dropSoftDeletes();
            $table->dropColumn('pic');
        });
    }
}
