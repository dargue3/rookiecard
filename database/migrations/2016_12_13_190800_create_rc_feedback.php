<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRcFeedback extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rc_feedback', function (Blueprint $table) {
            $table->increments('id');
            $table->string('type');
            $table->integer('creator_id')->unsigned();
            $table->text('details');
            $table->tinyInteger('done');
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
        Schema::drop('rc_feedback');
    }
}
