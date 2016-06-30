<?php

namespace App;

use App\RC\Event\EventTypes;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes;
    use EventTypes;
    
    protected $table = 'rc_events';

    protected $dates = ['deleted_at'];

    protected $fillable = ['title', 'start', 'end', 'type', 'owner_id', 'creator_id', 'details'];


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


    /**
     * Convert the type to a string before giving to front-end
     * 
     * @param  int $type 
     * @return string       
     */
    public function getTypeAttribute($type)
    {
        return $this->convertTypeToString($type);
    }


    /**
     * Convert the type to an int before storing in db
     * 
     * @param  int $type 
     * @return void       
     */
    public function setTypeAttribute($type)
    {
        $this->attributes['type'] = $this->convertTypeToInt($type);
    }



    


}
