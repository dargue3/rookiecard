<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use App\NewsFeed;
use App\UserEmailSetting;

class Notification extends Model
{
    protected $table = 'rc_notifications';


    /**
     * Options of notification types are as follows:
     *
     * team_event (0) - when a new event is added to the calendar
     * team_event_update (1) - when an event is updated
     * team_event_delete (2) - when an event is "cancelled"
     * team_post (3) - when someone posts to the team feed
     * team_stats (4) - when stats are posted for a previous event
     * team_fan (5) - someone became a fan of user's team
     * team_invite (6) - a team admin invited this user to join their team
     *
     * user_post (20) - someone wrote on this user's news feed
     * user_fan (21) - someone became a fan of this user 
     */


    protected $fillable = ['id', 'user_id', 'creator_id', 'type'];

    protected $notifyTypes = [
        'team_event'            => 0,
        'team_event_update'     => 1,
        'team_event_delete'     => 2,
        'team_post'             => 3,
        'team_stats'            => 4,
        'team_invite'           => 5,
        'team_fan'              => 6,
        'user_post'             => 20,
        'user_fan'              => 21,
    ];


    public function scopeTeamUser($query, $user_id, $team_id) {
        return $query->where('user_id', $user_id)->where('creator_id', $team_id);
    }



    //tell user they're invited to the team
    public function teamInvite($user, $team_id) {

        $this->notify($user->id, $team_id, 'team_invite');

        //email them if that's what they want
        if($this->theyWantAnEmailToo($user_id, 'team_invite')) {

            // EMAIL THEM HERE

        }

    }


    //tell users someone is a fan of their team
    public function teamFan($team) {

        $users = $team->members();

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $notification = $this->notify($user_id, $team->id, 'team_fan');

            //email them if that's what they want
            if($this->theyWantAnEmailToo($user_id, 'team_fan')) {

                // EMAIL THEM HERE

            }
        }

        return;
    }


    //tell team members someone has posted to their team's news feed
    public function newsFeedPost($team) {

        $users = $team->members();

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $notification = $this->notify($user_id, $team->id, 'team_post');

            //email them if that's what they want
            if($this->theyWantAnEmailToo($user_id, 'team_post')) {

                // EMAIL THEM HERE

            }
        }

        return;
    }



    //tell team members an admin has added events
    public function newTeamEvents($team) {

        $users = $team->members();

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $notification = $this->notify($user_id, $team->id, 'team_event');

            //email them if that's what they want
            if($this->theyWantAnEmailToo($user_id, 'team_event')) {

                // EMAIL THEM HERE

            }
        }

        return;
    }



    //tell team members an admin has deleted an event
    public function deleteTeamEvent($team) {

        $users = $team->members();

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $notification = $this->notify($user_id, $team->id, 'team_event_delete');

            //email them if that's what they want
            if($this->theyWantAnEmailToo($user_id, 'team_event_delete')) {

                // EMAIL THEM HERE

            }
        }

        return;
    }



    //tell team members an admin has updated an event
    public function updateTeamEvent($team) {

        $users = $team->members();

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $notification = $this->notify($user_id, $team->id, 'team_event_update');

            //email them if that's what they want
            if($this->theyWantAnEmailToo($user_id, 'team_event_update')) {

                // EMAIL THEM HERE

            }
        }

        return;
    }


    //creates a notification for all users in array
    //generates from creator's id, of a specific type (types described above)
    public function notify($user_id, $creator_id, $type) {

        $typeInt = $this->notifyTypes[$type];
  
        $notification = $this->create([
            'user_id'       => $user_id,
            'creator_id'    => $creator_id,
            'type'          => $typeInt
        ]);

        return $notification;
    }


    //has this user told us they would like to be emailed for this notification?
    public function theyWantAnEmailToo($user_id, $type) {

        $settings = new UserEmailSetting;
        return $settings->doesUserWantAnEmail($user_id, $type);
    }


}
