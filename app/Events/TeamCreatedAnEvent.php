<?php
namespace App\Events;

use App\Events\Event;
use Illuminate\Support\Facades\Redis;
use Illuminate\Queue\SerializesModels;
use App\Events\Contracts\NotifiesUsers;
use App\Events\Contracts\CreatesNewsFeedEntries;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TeamCreatedAnEvent extends Event implements CreatesNewsFeedEntries, NotifiesUsers
{
    use SerializesModels;

    /**
     * The team that created the event
     * 
     * @var int
     */
    public $team_id;


    /**
     * Array of the events that were created
     * 
     * @var array
     */
    public $events;


    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($team_id, array $events)
    {
        $this->team_id = $team_id;
        $this->events = $events;
    }


    /**
     * Return the type of notification this will created
     * 
     * @return string
     */
    public function type()
    {
        return 'team_event_create';
    }


    /**
     * Return an array of data to be attached as meta
     * 
     * @return array
     */
    public function data()
    {
        return ['events' => $this->events];
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
        return $team->users('id');
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
