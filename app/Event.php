<?php

namespace App;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    /**
    * event types:
    * 0 = practice
    * 1 = home game
    * 2 = away game
    * 3 = other
    */


    use SoftDeletes;
    
    protected $table = 'rc_events';
    protected $dates = ['deleted_at'];
    protected $guarded = [];


    /**
     * Finds the events that haven't happened yet
     * 
     * @param  Builder $query
     * @return Builder      
     */
    public function scopeFuture($query)
    {
        return $query->where('start', '>=', Carbon::now());
    }


    /**
     * Finds all events associated with a given team ID
     * 
     * @param  Builder $query
     * @return Builder   
     */
    public function scopeTeamId($query, $team_id)
    {
        return $query->where('owner_id', $team_id);
    }



    


}
