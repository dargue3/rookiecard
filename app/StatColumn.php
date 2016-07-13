<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class StatColumn extends Model
{
    protected $table = 'rc_stat_columns';

    protected $fillable = ['id', 'sport', 'stats'];

    public $timestamps = false;
}
