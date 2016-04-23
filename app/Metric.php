<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Metric extends Model
{
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'rc_user_metrics';

    public $timestamps = false;

    public $primaryKey = null;

    public $incrementing = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id', 'metric_tag', 'metric_value', 'on_profile'];


    public function owner() {

        return $this->belongsTo('App\User');

    }
}
