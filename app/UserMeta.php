<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserMeta extends Model
{
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'rc_user_meta';

    public $timestamps = false;

    public $primaryKey = null;

    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id', 'meta_tag', 'meta_value'];


    public function owner() {

        return $this->belongsTo('App\User');

    }
}
