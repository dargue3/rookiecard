<?php

namespace App\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Request;
use App\TeamMember;
use App\Team;
use App\User;

class TeamPolicy
{
    use HandlesAuthorization;
   
    public function __construct()
    {
        //
    }

    //decide whether or not user can manipulate team stats
    public function editStats(User $user, Team $team, Request $request) {

  		//loop through all the uploaded stats, check that the
  		//member_id, id, & team all correspond to eachother
    	foreach($request->playerStats as $stats)	{
    		$member = TeamMember::find($stats['member_id']);

    		if(!$member) {
    			//this person isn't even in the database
    			return false;
    		}

    		if($member->team_id != $team->id) {
    			//this person isn't on this team
    			return false;
    		}

    		if($stats['id'] != $member->user_id) {
    			//the stat's user_id doesn't match TeamMember's user_id, tampered with
    			return false;
    		}
    	}

    	if($request->team['id'] != $team->id) {
    		//wrong team
    		return false;
    	}

    	return true;

    }


    //make sure the user in the request 
    public function editUser(User $user, Team $team, Request $request) {

        $member = TeamMember::findOrFail($request->editedUser['member_id']);

        return $member->team_id == $team->id && $member->user_id == $request->editedUser['id'];

    }













}
