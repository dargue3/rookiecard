<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateRcTeams extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rc_teams', function (Blueprint $table) {
            $table->softDeletes();
            $table->integer('season');
            $table->integer('sport');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('rc_teams', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('season');
            $table->dropColumn('sport');
        });
    }
}
