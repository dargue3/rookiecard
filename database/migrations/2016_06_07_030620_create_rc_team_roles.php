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

        // insert the default roles
        DB::table('rc_team_roles')->insert([
            ['name' => 'admin'],
            ['name' => 'player'],
            ['name' => 'ghost_player'],
            ['name' => 'coach'],
            ['name' => 'ghost_coach'],
            ['name' => 'fan'],
            ['name' => 'invited_player'],
            ['name' => 'invited_coach'],
            ['name' => 'requested_to_join'],
        ]);

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
        Schema::drop('rc_member_role');
        Schema::drop('rc_team_roles');
    }
}
