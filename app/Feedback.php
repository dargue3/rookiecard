<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table = 'rc_feedback';
    protected $fillable = ['type', 'details', 'creator_id'];


    /**
     * Return all of the finished feedback entries
     * 
     * @param  Builder $query 
     * @return Builder
     */
    public function scopeFinished($query)
    {
    	return $query->where('done', 1);	
    }


    /**
     * An RC Dev has toggled this feedback item's 'done' status
     * 
     * @return void
     */
    public function toggle()
    {
    	$this->done = ! $this->done;

    	$this->save();
    }
}
