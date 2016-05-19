<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'rc_notifications';


    /**
     * the creator_id is from whatever entity created the notification. usually a team
     * creating an event or posting the scores for one
     *
     * target_id is for if clicking that notification takes them somewhere; whether that be someone's
     * profile, the team page, a message. it's broad because idk currently how much these will expand
     *
     * type is for expressing to the view what to show the user. current types are in the 
     * switch statement below. see StatusUpdate class for explanations on types
     */



    protected $fillable = ['id', 'user_id', 'creator_id', 'target_id', 'type'];


    //creates a notification for all users in array
    //generates from creator's id, of a specific type (types described above)
    public function createNotifications($userIDs, $creatorID, $type, $targetID = null) {

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
            case 'team_invite':
                $type = 5;
                break;
            case 'user_stats':
                $type = 10;
                break;    
        }

        if(!is_array($userIDs))
            $userIDs = [$userIDs];


        foreach($userIDs as $id) {
            //loop through all the users, send them notifications
            $this->firstOrCreate([
                'user_id' => $id,
                'creator_id' => $creatorID,
                'target_id' => $targetID,
                'type' => $type
            ]);
        }

        return;
    }


    public function scopeTeamUser($query, $user_id, $team_id) {

        return $query->where('user_id', $user_id)->where('creator_id', $team_id);

    }
}
