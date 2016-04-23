<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRcStats extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rc_stats', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('owner_id')->unsigned();
            $table->index('owner_id');
            $table->integer('team_id')->unsigned();
            $table->index('team_id')->unsigned();
            $table->integer('sport');
            $table->integer('type');
            $table->integer('season');
            $table->integer('event_id')->unsigned();
            $table->integer('event_date')->unsigned();
            $table->text('stats');
            $table->text('meta');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('rc_stats');
    }
}
