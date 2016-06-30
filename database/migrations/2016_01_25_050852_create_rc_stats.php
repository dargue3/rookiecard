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
            $table->integer('owner_id')->unsigned()->index();
            $table->integer('member_id')->unsigned()->index();
            $table->integer('team_id')->unsigned()->index();
            $table->tinyInteger('sport');
            $table->tinyInteger('type');
            $table->integer('season');
            $table->integer('event_id')->unsigned();
            $table->integer('event_date')->unsigned();
            $table->text('stats');
            $table->text('meta')->nullable();
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
