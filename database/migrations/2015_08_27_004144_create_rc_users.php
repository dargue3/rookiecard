<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRcUsers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rc_users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('firstname');
            $table->string('lastname');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->index('email');
            $table->string('password', 60);
            $table->integer('birthday')->unsigned();
            $table->tinyInteger('gender');
            $table->string('pic');
            $table->text('meta')->nullable();
            $table->text('settings')->nullable();
            $table->rememberToken();
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
        Schema::drop('rc_users');
    }
}
