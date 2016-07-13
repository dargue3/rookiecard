<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRcTeams extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rc_teams', function (Blueprint $table) {
            $table->increments('id');
            $table->string('teamname')->unique();
            $table->string('name');
            $table->integer('season');
            $table->tinyInteger('sport');
            $table->tinyInteger('gender');
            $table->text('meta');
            $table->float('long');
            $table->float('lat');
            $table->string('pic');
            $table->string('backdrop');
            $table->integer('creator_id')->unsigned();
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
        Schema::drop('rc_teams');
    }
}
