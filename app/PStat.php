<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PStat extends Model
{
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'rc_personal_stats';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id', 'stat_tag', 'statID', 'onProfile'];


    public function owner() {

        return $this->belongsTo('App\User');

    }
}
