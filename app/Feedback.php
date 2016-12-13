<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table = 'rc_feedback';
    protected $fillable = ['type', 'details', 'creator_id'];
}
