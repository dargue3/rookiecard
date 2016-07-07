<?php
namespace App;

use Illuminate\Database\Eloquent\Model;
use App\RC\NewsFeed\NewsFeedTypes;

class NewsFeed extends Model
{
	use NewsFeedTypes;

    protected $table = 'rc_news_feed';
    protected $guarded = [];   


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


    /**
     * Find all the entries for a given team
     * @param  Builder $query  
     * @param  int $team_id 
     * @return Builder          
     */
    public function scopeTeamEntries($query, $team_id)
    {
        return $query->where('owner_id', $team_id)->where('type', '<', 10);
    }
}




