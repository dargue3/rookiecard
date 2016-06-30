<?php
namespace App\RC\Team;

use App;
use App\User;
use App\Team;
use Illuminate\Support\Facades\Auth;

class TransformsData
{

	/**
	 * An instance of a team member repository
	 * 
	 * @var TeamMemberRepository
	 */
	protected $member;


	public function __construct()
	{
		$this->member = App::make(TeamMemberRepository::class);
	}

	/**
     * Format members' data for front-end consumption
     * 
     * @param  Collection $members 
     * @param  int $team_id 
     * @return array
     */
    public function transformMembers($members, $team_id)
    {
        $admin = Auth::user()->isTeamAdmin($team_id);
        $formatted = [];

        foreach ($members as $member) {
        	$this->member->using($member);
	        $user = User::find($member->user_id);
	        $user['isCoach'] = $this->member->isCoach();
	        $user['isPlayer'] = $this->member->isPlayer();
	        $user['isFan'] = $this->member->isFan();
	        $user['isAdmin'] = $this->member->isAdmin();
	        $user['hasBeenInvited'] = $this->member->hasBeenInvited();
	        $user['hasRequestedToJoin'] = $this->member->hasRequestedToJoin();
	        $user['member_id'] 	= $member->id;

	        if (! $admin) {
	            // hide some sensitive data if they're not an admin
	            $meta = json_decode($member->meta);
	            if (isset($meta->ghost)) {
	                unset($meta->ghost->email);
	                $member->meta = json_encode($meta);
	            }
	        }
	        //attach TeamMember meta data instead of User meta data
	        $user['meta'] = $member->meta;

	        $formatted[] = $user;
	    }

        return $formatted;
    }
}