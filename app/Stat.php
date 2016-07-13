<?php
namespace App;

use App\RC\Sports\Sport;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stat extends Model
{
    use SoftDeletes;

    protected $table = 'rc_stats';
    protected $dates = ['deleted_at'];
    protected $fillable = ['owner_id', 'team_id', 'member_id', 'meta', 'stats', 'event_id', 'sport', 'type', 'season'];


    /**
     * Returns all stats for a given member on a given team
     * 
     * @param  Builder $query     
     * @param  int $team_id   
     * @param  int $member_id 
     * @return Builder            
     */
    public function scopeTeamMember($query, $team_id, $member_id)
    {
        return $query->where('team_id', $team_id)->where('member_id', $member_id);
    }



    /**
     * Convert the sport to a string before giving to front-end
     * 
     * @param  int $sport 
     * @return string       
     */
    public function getSportAttribute($sport)
    {
        return Sport::convertSportToString($sport);
    }


    /**
     * Convert the sport to an int before storing in db
     * 
     * @param  string $sport 
     * @return void       
     */
    public function setSportAttribute($sport)
    {
        $this->attributes['sport'] = Sport::convertSportToInt($sport);
    }


    /**
     * Convert the type to a string before giving to front-end
     * 
     * @param  int $type 
     * @return string       
     */
    public function getTypeAttribute($type)
    {
        if ($type == 0) return 'player';
        if ($type == 1) return 'team';
    }


    /**
     * Convert the type to an int before storing in db
     * 
     * @param  string $type 
     * @return void       
     */
    public function setTypeAttribute($type)
    {
        if ($type == 'player') $this->attributes['type'] = 0;
        if ($type == 'team')   $this->attributes['type'] = 1;
    }


    


    //create team stats based on ajax request inputs
    public function createTeamStats($team, $stats, $event, $meta) {

        $team = Team::findOrFail($team['id']);

        //take given meta data and add the extraneous event data to that
        //(helps when re-constructing the news feed)
        $meta = json_encode(array_merge($meta, ['event' => $event]));

        //create row with related data
    	$newStats = $this->create([
    		'owner_id'    => $team->id,
    		'team_id' 	  => $team->id,
            'event_id'    => $event['id'],
    		'event_date'  => $event['start'],
    		'sport' 	  => $team->sport,
    		'season' 	  => $team->season,
            'type'        => 1,
    		'stats' 	  => json_encode($stats),
            'meta'        => $meta,
  		]);
    }


    //create user stats based on ajax request inputs
    public function createUserStats($team, $stats, $event, $meta) {

        $meta = json_encode(array_merge($meta, ['event' => $event]));

        $newStats = [];

        //foreach user, store stats
        foreach($stats as $stat) {

            //save and remove id from stats object
            //id was stored in stats just because it wasn't necessary to 
            //send in all the user data
            $id = $stat['id'];
            unset($stat['id']);

            $stat = $this->formatPlayerStats($stat);

            if(!$stat) {
                //player marked as a DNP
                continue;
            }
            

            //create row with related data
            $new = $this->create([
                'owner_id'      => $id,
                'team_id'       => $team['id'],
                'event_id'      => $event['id'],
                'event_date'    => $event['start'],
                'sport'         => $team['sport'],
                'season'        => $team['season'],
                'type'          => 0,
                'stats'         => json_encode($stat),
                'meta'          => $meta
            ]);

            $newStats[] = $new;

        }

        return $newStats;
    }

    //if there's an update, first we have to delete the current stats, then create.
    //it's done this way because the stats are all json anyways, might as well wipe
    public function updateStats($team, $teamStats, $playerStats, $event, $meta) {

        $newStats = [];

        //loop through all the players, format and update their stats
        foreach($playerStats as $stats) {
            $oldStats = $this->where('event_id', $event['id'])->where('owner_id', $stats['id'])->where('type', 0)->first();
            $oldStats->event_date = $event['start'];
            unset($stats['id']); //don't need anymore

            $stats = $this->formatPlayerStats($stats);
            if($stats) {
                $oldStats->stats = json_encode($stats);
                $oldStats->meta = json_encode(array_merge($meta, ['event' => $event]));
                $oldStats->save();
                $newStats[] = $oldStats;
            }
            else {
                //player marked as a DNP
                $oldStats->delete();
            }

        }

        //now save the team stats
        $oldStats = $this->where('event_id', $event['id'])->where('owner_id', $team['id'])->where('type', 1)->first();
        $oldStats->stats = json_encode($teamStats);
        $oldStats->event_date = $event['start'];
        $oldStats->meta = json_encode(array_merge($meta, ['event' => $event]));
        $oldStats->save();
        $newStats[] = $oldStats;


        return $newStats;
    }


    //formats the stats to make sure they're accurate and/or tossed
    public function formatPlayerStats($stats) {
  
        if(isset($stats['min'])) {
            //minutes is a category in these stats
            $min = $stats['min'];
            if($min <= 0)
                //if minutes are <= 0, user didn't play, skip
                return null;
        }

        if(isset($stats['dnp'])) {
            //DNP is a category in these stats
            $dnp = $stats['dnp'];
            if($dnp == true)
                //if DNP was checked, user didn't play, skip
                return null;
        }


        //all empty or invalid fields are treated as zeros 
        //as per instructions to user
        foreach($stats as $key => $val) {
            if($key == 'starter' || $key == 'name')
                continue;
            if(empty($val) || !is_numeric($val))
                $stats[$key] = 0;
        }

        return $stats;
    }


    //return the list of stat keys (in correct precedence order)
    public function getStatKeys($sport, $userStats, $rcStats) {

        count($userStats) == 0 ? $playerCols = [] : $playerCols = ['name'];
        $teamCols = ['date', 'win', 'opp'];
        switch($sport) {
            case 0:
                //basketball
                $playerKeys = $this->basketballPlayerKeys;
                $teamKeys = $this->basketballTeamKeys;
                break;
            default:
                $keys = [];
                break;
        }

        //loop through the keys, if they exist in either array, add to master list
        foreach($playerKeys as $key) {
            if(in_array($key, $userStats) || in_array($key, $rcStats))
                $playerCols[] = $key;
        }

        //loop through the keys, if they exist in either array, add to master list
        foreach($teamKeys as $key) {
            if(in_array($key, $userStats) || in_array($key, $rcStats))
                $teamCols[] = $key;
        }

        return ['playerCols' => $playerCols, 'teamCols' => $teamCols];
    }


    //deletes all stats associated with this event
    public static function deleteByEvent(Team $team, Event $event)
    {
        self::where('team_id', $team->id)->where('event_id', $event->id)->delete();
    }



    //deletes all stats associated with this team member
    public static function deleteByMember(TeamMember $member)
    {
        self::where('member_id', $member->id)->delete();
    }




}
