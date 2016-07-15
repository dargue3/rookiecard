<?php
namespace App\Events;

use App\Events\Event;
use App\RC\Team\TeamRepository;
use Illuminate\Support\Facades\Redis;
use Illuminate\Queue\SerializesModels;
use App\Events\Contracts\NotifiesUsers;
use App\Events\Contracts\CreatesNewsFeedEntries;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class UserPostedToTeamFeed extends Event implements CreatesNewsFeedEntries, NotifiesUsers
{
    use SerializesModels;

    /**
     * The team that created the event
     * 
     * @var int
     */
    public $team_id;


    /**
     * The text that was posted on the news feed
     * 
     * @var string
     */
    public $post;


    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($team_id, $post)
    {
        $this->team_id = $team_id;
        $this->post = $post;
    }


    /**
     * Return the type of notification this will created
     * 
     * @return string
     */
    public function type()
    {
        return 'team_post';
    }


    /**
     * Return an array of data to be attached as meta
     * 
     * @return array
     */
    public function data()
    {
        return ['post' => $this->post];
    }


    /**
     * Return the id of the owner of this event
     * 
     * @return int
     */
    public function owner()
    {
        return $this->team_id;
    }


    /**
     * Return an array of users to notify about this event
     * 
     * @return array
     */
    public function users(TeamRepository $team)
    {
        return $team->users(array('id'));
    }


    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn()
    {
        return ['rookiecard.api'];
    }
}
