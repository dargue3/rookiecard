<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRcUserEmailSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rc_user_email_settings', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->index('user_id');
            $table->tinyInteger('team_event')->default(1);
            $table->tinyInteger('team_event_update')->default(1);
            $table->tinyInteger('team_event_delete')->default(1);
            $table->tinyInteger('team_post')->default(0);
            $table->tinyInteger('team_stats')->default(0);
            $table->tinyInteger('team_invite')->default(1);
            $table->tinyInteger('user_post')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('rc_user_email_settings');
    }
}
