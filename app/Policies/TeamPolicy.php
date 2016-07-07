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



    /**
     * Make sure the stats are being set to members of this team
     * 
     * @param  User    $user    
     * @param  Team    $team    
     * @param  Request $request 
     * @return boolean           
     */
    public function editStats(User $user, Team $team, Request $request)
    {
        //loop through all the uploaded stats, check that the
        //member_id, id, & team all correspond to eachother
        foreach ($request->playerStats as $stats)    {
            $member = $this->member->find($stats['member_id']);

            if (!$member) {
                //this person isn't even in the database
                return false;
            }

            if ($member->team_id != $team->id) {
                //this person isn't on this team
                return false;
            }

            if ($stats['id'] != $member->user_id) {
                //the stat's user_id doesn't match TeamMember's user_id, tampered with
                return false;
            }
        }

        if ($request->team['id'] != $team->id) {
            //wrong team
            return false;
        }

        return true;
    }













}
