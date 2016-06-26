<?php
namespace App\RC\NewsFeed;

use App\Team;
use App\Notification;
use Illuminate\Support\Facades\Auth;
use App\Repositories\EloquentRepository;

class EloquentNewsFeed extends EloquentRepository implements NewsFeedRepository
{
	/**
	 * The path of this class, to be used in EloquentRepository
	 * 
	 * @var string
	 */
	protected $modelClassPath = 'App\NewsFeed';


	/**
	 * A lookup for fetching the integer value of a type of entry
	 * 
	 * @var array
	 */
    protected $typeLookup = [
        'team_event'            => 0,
        'team_event_update'     => 1,
        'team_event_delete'     => 2,
        'team_post'             => 3,
        'team_stats'            => 4,
        'user_post'             => 20,
        'user_stats'            => 21,
    ];


    /**
     * The type of entry that is being created
     * 
     * @var string
     */
    protected $type;


    /**
     * The id of the owner of this status
     * 
     * @var int
     */
    protected $owner_id;


    /**
     * Meta data to be attached to the feed entry
     * 
     * @var array
     */
    protected $meta = null;


	/**
	 * A team admin created an event
	 * 
	 * @param  Team   $team
	 * @param  array  $meta
	 * @return NewsFeed      
	 */
    public function newTeamEvents(Team $team, array $meta) {

        // notify the team about it
        //(new Notification)->newTeamEvents($team);
        
        $this->type = 'team_event';
        $this->owner_id = $team->id;
        $this->meta = $meta;

        // add the entry to team feed
        return $this->createEntry();
    }


    /**
     * A user has submitted a post to this team's news feed
     * 
     * @param  Team $team
     * @param  string $post
     * @return NewsFeed
     */
    public static function teamNewsFeedPost(Team $team, string $post) {

        // notify the team about it
        //(new Notification)->teamNewsFeedPost($team);

        $this->type = 'team_post';
        $this->owner_id = $team->id;
        $this->meta = ['msg' => $post];

        return $this->createEntry();
    }



    //team admin deleted an event
    public function deleteTeamEvent($team, $meta) {

        //notify the team about it
        //(new Notification)->deleteTeamEvent($team);

        $this->type = 'team_event_delete';
        $this->owner_id = $team->id;
        $this->meta = $meta;

        //add the entry to team feed
        return $this->createEntry();
    }



    //team admin updated an event
    public function updateTeamEvent($team, $meta) {

        //notify the team about it
        //(new Notification)->updateTeamEvent($team);

        $this->type = 'team_event_update';
        $this->owner_id = $team->id;
        $this->meta = $meta;

        //add the entry to team feed
        return $this->createEntry();
    }



    //create an entry to this owner's news feed
    public function createEntry() {

        $typeInt = $this->typeLookup[$this->type];

        $entry = $this->create([
            'type'       => $typeInt,
            'meta'       => json_encode($this->meta),
            'owner_id'   => $this->owner_id,
            'creator_id' => Auth::user()->id
        ]);

        return $entry;
    }
}