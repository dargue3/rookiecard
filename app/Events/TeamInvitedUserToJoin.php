<?php
namespace App\Events;

use App\Events\Event;
use App\RC\Team\TeamRepository;
use Illuminate\Support\Facades\Redis;
use Illuminate\Queue\SerializesModels;
use App\Events\Contracts\NotifiesUsers;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TeamInvitedUserToJoin extends Event implements NotifiesUsers
{
    use SerializesModels;

    /**
     * The team that created the event
     * 
     * @var int
     */
    public $team_id;


    /**
     * The user that was invited
     * 
     * @var int
     */
    public $user_id;


    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($team_id, $user_id)
    {
        $this->team_id = $team_id;
        $this->user_id = $user_id;
    }


    /**
     * Return the type of notification this will created
     * 
     * @return string
     */
    public function type()
    {
        return 'team_invite';
    }


    /**
     * Return an array of data to be attached as meta
     * 
     * @return array
     */
    public function data()
    {
        return ['team_id' => $this->team_id, 'user_id' => $this->user_id];
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
