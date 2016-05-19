<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Notification;
use App\StatusUpdate;

class Stat extends Model
{
    use SoftDeletes;

    protected $table = 'rc_stats';

    protected $dates = ['deleted_at'];

    protected $fillable = [
	    'owner_id',
	    'team_id',
	    'sport',
	    'type',
	    'season',
	    'event_id',
        'event_date',
	    'stats',
        'meta'
    ];

    /**
    * current supported stat types (stored as int):
    * 0 = user stats
    * 1 = team stats
    *
    * current supported sports (stored as int):
    * 0 = basketball
	*
	* stats are stored as a json string
    */


    protected $basketballPlayerKeys = ['name', 'gs', 'gp', 'min', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'];

    protected $basketballTeamKeys = ['date', 'win', 'opp', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf'];   




    //returns all stats associated with a given team
    public function getTeamStats($team) {

        return $this->where('team_id', $team->id)->get();
        
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

        //alert team users of new stats
        $status = new StatusUpdate;
        $notification = new Notification;

        //recreate meta data for news feed consumption

        $update = $status->createStatusUpdate($team->id, $event['id'], 'team_stats', $meta);
        $notification->createNotifications($team->members(), $team->id, 'team_stats', $newStats->id);

    	return ['stats' => $newStats, 'feed' => $update];
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




}
