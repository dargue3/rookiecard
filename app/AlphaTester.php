<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class AlphaTester extends Model
{
    protected $table = 'rc_alpha_testers';
    protected $guarded = [];


    public static function testers()
    {
    	return static::all()->implode('email', ',');
    }
}
