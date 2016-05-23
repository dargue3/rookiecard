<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Notification;

class NewsFeed extends Model
{

    /**
     * Options of news feed types are as follows:
     *
     * team_event (0) - when a new event is added to the calendar
     * team_event_update (1) - when an event is updated
     * team_event_delete (2) - when an event is "cancelled"
     * team_post (3) - when someone posts to the team feed
     * team_stats (4) - when stats are posted for a previous event
     *
     * user_post (20) - someone wrote on a user's news feed
     * user_stats (21) - when stats are posted for a user 
     */

    protected $table = 'rc_news_feed';


    protected $fillable = ['id', 'owner_id', 'creator_id', 'type', 'meta'];

    //see above for descriptions
    protected $typeLookup = [
        'team_event'            => 0,
        'team_event_update'     => 1,
        'team_event_delete'     => 2,
        'team_post'             => 3,
        'team_stats'            => 4,
        'user_post'             => 20,
        'user_stats'            => 21,
    ];

    protected $stringType = '';


    //returns the news feed for a team
    public function getTeamFeed($team) {

        return $this->where('owner_id', $team->id)->where('type', '<', 10)->orderBy('created_at', 'desc')->get();

    }


    //someone has posted to the team feed
    public function teamNewsFeedPost($team, $meta) {

        //notify the team about it
        (new Notification)->teamNewsFeedPost($team);

        $this->stringType = 'team_post';
        $this->owner_id = $team->id;

        //add the entry to team feed
        return $this->createEntry($meta);
    }



    //team admin created event(s)
    public function newTeamEvents($team, $meta) {

        //notify the team about it
        (new Notification)->newTeamEvents($team);
        
        $this->stringType = 'team_event';
        $this->owner_id = $team->id;

        //add the entry to team feed
        return $this->createEntry($meta);
    }



    //team admin deleted an event
    public function deleteTeamEvent($team, $meta) {

        //notify the team about it
        (new Notification)->deleteTeamEvent($team);

        $this->stringType = 'team_event_delete';
        $this->owner_id = $team->id;

        //add the entry to team feed
        return $this->createEntry($meta);
    }



    //team admin updated an event
    public function updateTeamEvent($team, $meta) {

        //notify the team about it
        (new Notification)->updateTeamEvent($team);

        $this->stringType = 'team_event_update';
        $this->owner_id = $team->id;

        //add the entry to team feed
        return $this->createEntry($meta);
    }





    //create an entry to this owner's news feed
    public function createEntry($meta = null) {

        $typeInt = $this->typeLookup[$this->stringType];

        $update = $this->create([
            'type'       => $typeInt,
            'meta'       => json_encode($meta),
            'creator_id' => Auth::user()->id
        ]);

        return $update;
    }


        
}




