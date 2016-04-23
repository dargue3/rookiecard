<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class StatusUpdate extends Model
{

    /**
     * Options of status update types are as follows:
     *
     * team_event (0) - when a new event is added to the calendar
     * team_event_update (1) - when an event is updated
     * team_event_delete (2) - when an event is "canceled"
     * team_post (3) - when someone posts to the team feed
     * team_stats (4) - when stats are posted for a previous event
     * user_stats (10) - when stats are posted for a user 
     */



    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'rc_status_updates';


    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['id', 'owner_id', 'creator_id', 'target_id', 'type', 'meta'];



    public function getTeamFeed($team) {

        return $this->where('owner_id', $team->id)->where('type', '<', 10)->orderBy('created_at', 'desc')->get();

    }


    public function createStatusUpdate($ownerID, $targetID, $type, $metaData = null) {

        switch($type) {
            case 'team_event':
                $type = 0;
                break;
            case 'team_event_update':
                $type = 1;
                break;
            case 'team_event_delete':
                $type = 2;
                break;
            case 'team_post':
                $type = 3;
                break;
            case 'team_stats':
                $type = 4;
                break;
            case 'user_stats':
                $type = 10;
                break;
            default:
                $type = -1;
                break;    
        }

        $update = $this->create([
            'owner_id'   => $ownerID,
            'target_id'  => $targetID,
            'type'       => $type,
            'meta'       => $metaData,
            'creator_id' => Auth::user()->id
        ]);

        return $update;
    }


        
}




