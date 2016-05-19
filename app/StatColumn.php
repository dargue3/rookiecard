<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class StatColumn extends Model
{
    protected $table = 'rc_stat_columns';

    protected $fillable = ['id', 'sport', 'stats'];

    public $timestamps = false;


    public function getStatColumns($sport) {

    	return $this->where('sport', $sport)->first()->stats;

    }

    public function add($sport, $stats) {
    	$this->create([
    		'sport' => $sport,
    		'stats' => json_encode($stats)
    	]);

    	return;
    }


}
