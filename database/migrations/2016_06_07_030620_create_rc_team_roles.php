<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRcTeamRoles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rc_team_roles', function(Blueprint $table)
        {
            $table->increments('id');
            $table->string('name');
        });

        Schema::create('rc_member_role', function(Blueprint $table)
        {
            $table->integer('member_id')->unsigned()->index();
            $table->foreign('member_id')->references('id')->on('rc_team_members')->onDelete('cascade');
            $table->integer('role_id')->unsigned()->index();
            $table->foreign('role_id')->references('id')->on('rc_team_roles')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('rc_team_roles');
        Schema::drop('member_role');
    }
}
