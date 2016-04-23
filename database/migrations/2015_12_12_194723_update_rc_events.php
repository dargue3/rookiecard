<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateRcEvents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rc_events', function (Blueprint $table) {
            $table->softDeletes();
            $table->longText('details')->nullable();
            $table->smallInteger('type');
            $table->integer('creator_id')->unsigned();
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
        Schema::table('rc_events', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('details');
            $table->dropColumn('type');
            $table->dropColumn('creator_id');
            $table->dropTimestamps();
        });
    }
}
