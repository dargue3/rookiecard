<?php
namespace App\Policies;

use App;
use App\Team;
use App\User;
use Illuminate\Http\Request;
use App\RC\Event\EventRepository;
use App\RC\Team\TeamMemberRepository;
use App\RC\NewsFeed\NewsFeedRepository;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamPolicy
{
    use HandlesAuthorization;

    protected $member;
    protected $feed;
    protected $event;

      
    public function __construct()
    {
        $this->member = App::make(TeamMemberRepository::class);
        $this->feed = App::make(NewsFeedRepository::class);
        $this->event = App::make(EventRepository::class);
    }
   

    /**
     * Make sure the member being edited belongs to this team
     * 
     * @param  User   $user      
     * @param  Team   $team      
     * @param  int $member_id 
     * @return boolean
     */
    public function editMember(User $user, Team $team, $member_id)
    {
        return $team->id == $this->member->findOrFail($member_id)->team_id;
    }



    /**
     * Make sure the event being edited belongs to this team
     * 
     * @param  User   $user     
     * @param  Team   $team     
     * @param  int $event_id 
     * @return boolean           
     */
    public function editEvents(User $user, Team $team, $event_id)
    {
        return $team->id == $this->event->findOrFail($event_id, ['owner_id'])->owner_id;
    }



    /**
     * Make sure the feed entry being edited belongs to this team
     * 
     * @param  User   $user    
     * @param  Team   $team    
     * @param  int $post_id 
     * @return boolean          
     */
    public function editPosts(User $user, Team $team, $post_id)
    {
        return $team->id == $this->feed->findOrFail($post_id)->owner_id;
    }












}
