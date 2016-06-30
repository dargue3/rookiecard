<?php
namespace App\Events;

use App\Events\Event;
use App\RC\Team\TeamRepository;
use Illuminate\Support\Facades\Redis;
use Illuminate\Queue\SerializesModels;
use App\Events\Contracts\NotifiesUsers;
use App\Events\Contracts\CreatesNewsFeedEntries;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TeamUpdatedAnEvent extends Event implements CreatesNewsFeedEntries, NotifiesUsers
{
    use SerializesModels;

    /**
     * The team that created the event
     * 
     * @var int
     */
    public $team_id;


    /**
     * An instance of the updated event
     * 
     * @var App\Event
     */
    public $event;


    /**
     * An instance of the original event before updating
     * 
     * @var App\Event
     */
    public $original;


    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($team_id, $event, $original)
    {
        $this->team_id = $team_id;
        $this->event = $event;
        $this->original = $original;
    }


    /**
     * Return the type of notification this will created
     * 
     * @return string
     */
    public function type()
    {
        return 'team_event_update';
    }


    /**
     * Return an array of data to be attached as meta
     * 
     * @return array
     */
    public function data()
    {
        return ['event' => $this->event, 'original' => $this->original];
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
