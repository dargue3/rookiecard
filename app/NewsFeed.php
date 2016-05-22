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
    protected $feedTypes = [
        'team_event'            => 0,
        'team_event_update'     => 1,
        'team_event_delete'     => 2,
        'team_post'             => 3,
        'team_stats'            => 4,
        'user_post'             => 20,
        'user_stats'            => 21,
    ];


    //returns the news feed for a team
    public function getTeamFeed($team) {

        return $this->where('owner_id', $team->id)->where('type', '<', 10)->orderBy('created_at', 'desc')->get();

    }


    //someone has posted to the team feed
    public function newsFeedPost($team, $post) {

        //notify the team about it
        $notification = new Notification;
        $notification->newsFeedPost($team);

        //prepare meta data about entry
        $meta = ['details' => $post];

        //add the entry to team feed
        return $this->createEntry($team->id, 'team_post', $post);
    }



    //team admin created event(s)
    public function newTeamEvents($team, $meta) {

        //notify the team about it
        $notification = new Notification;
        $notification->newTeamEvents($team);

        //in this particular case, the meta data was custom enough that 
        //it is passed in straight from the Event model

        //add the entry to team feed
        return $this->createEntry($team->id, 'team_event', $meta);
    }



    //team admin deleted an event
    public function deleteTeamEvent($team, $event) {

        //notify the team about it
        $notification = new Notification;
        $notification->deleteTeamEvent($team);

        //prepare meta data about entry
        $meta = ['event' => $event];

        //add the entry to team feed
        return $this->createEntry($team->id, 'team_event_delete', $meta);
    }



    //team admin updated an event
    public function updateTeamEvent($team, $event, $oldEvent) {

        //notify the team about it
        $notification = new Notification;
        $notification->updateTeamEvent($team);

        //prepare meta data about entry
        $meta = ['event' => $event, 'oldEvent' => $oldEvent];

        //add the entry to team feed
        return $this->createEntry($team->id, 'team_event_update', $meta);
    }





    //create an entry to this owner's news feed
    public function createEntry($owner_id, $type, $meta = null) {

        $typeInt = $this->feedTypes[$type];

        $update = $this->create([
            'owner_id'   => $owner_id,
            'type'       => $typeInt,
            'meta'       => json_encode($meta),
            'creator_id' => Auth::user()->id
        ]);

        return $update;
    }


        
}




