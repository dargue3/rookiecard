<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRcPersonalStatsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rc_personal_stats', function (Blueprint $table) {
            $table->integer('user_id')->unsigned();
            $table->string ('stat_tag');
            $table->integer('stat_id')->unsigned();
            $table->boolean('on_profile');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('rc_personal_stats');
    }
}
