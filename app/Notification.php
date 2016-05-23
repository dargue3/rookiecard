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
     * team_invite (6) - a team admin invited this user to join their team
     *
     * user_post (20) - someone wrote on this user's news feed
     */


    protected $fillable = ['id', 'user_id', 'creator_id', 'type'];

    protected $typeLookup = [
        'team_event'            => 0,
        'team_event_update'     => 1,
        'team_event_delete'     => 2,
        'team_post'             => 3,
        'team_stats'            => 4,
        'team_invite'           => 5,
        'user_post'             => 20,
        'user_fan'              => 21,
    ];

    protected $stringType = '';


    public function scopeTeamUser($query, $user_id, $team_id) {
        return $query->where('user_id', $user_id)->where('creator_id', $team_id);
    }



    //tell user they're invited to the team
    public function teamInvite($team_id, $user_id) {

        $this->creator_id = $team_id;
        $this->user_id = $user_id;
        $this->stringType = 'team_invite';

        $this->notify();

        //email them if that's what they want
        if($this->theyWantAnEmailToo()) {

            // EMAIL THEM HERE

        }

    }

    


    //tell team members someone has posted to their team's news feed
    public function teamNewsFeedPost($team) {

        $users = $team->allAssociatedUsers();

        $this->creator_id = $team->id;
        $this->stringType = 'team_post';

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $this->user_id = $user_id;

            $this->notify();

            //email them if that's what they want
            if($this->theyWantAnEmailToo()) {

                // EMAIL THEM HERE

            }
        }

        return;
    }



    //tell team members an admin has added events
    public function newTeamEvents($team) {

        $users = $team->allAssociatedUsers();

        $this->creator_id = $team->id;
        $this->stringType = 'team_event';

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $this->user_id = $user_id;

            $this->notify();

            //email them if that's what they want
            if($this->theyWantAnEmailToo()) {

                // EMAIL THEM HERE

            }
        }

        return;
    }



    //tell team members an admin has deleted an event
    public function deleteTeamEvent($team) {

        $users = $team->allAssociatedUsers();

        $this->creator_id = $team->id;
        $this->stringType = 'team_event_delete';

        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $this->user_id = $user_id;

            $this->notify();

            //email them if that's what they want
            if($this->theyWantAnEmailToo()) {

                // EMAIL THEM HERE

            }
        }

        return;
    }



    //tell team members an admin has updated an event
    public function updateTeamEvent($team) {

        $users = $team->allAssociatedUsers();

        $this->creator_id = $team->id;
        $this->stringType = 'team_event_update';


        //this is contacting the whole team, loop through all IDs
        foreach($users as $user_id) {

            $this->user_id = $user_id;

            $this->notify();

            //email them if that's what they want
            if($this->theyWantAnEmailToo()) {

                // EMAIL THEM HERE

            }
        }

        return;
    }


    //creates a notification for all users in array
    //generates from creator's id, of a specific type (types described above)
    public function notify() {

        $typeInt = $this->typeLookup[$this->stringType];
  
        $notification = $this->create([
            'user_id'       => $this->user_id,
            'creator_id'    => $this->creator_id,
            'type'          => $typeInt
        ]);

        return $notification;
    }


    //has this user told us they would like to be emailed for this notification?
    public function theyWantAnEmailToo() {

        $settings = UserEmailSetting::where('user_id', $this->user_id)->first();

        return $settings[$this->stringType];
    }


}
