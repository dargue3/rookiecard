<?php
namespace App\RC\Team;

use App\Team;
use App\TeamMember;

class JoinTeam
{
	/**
     * Logged-in user accepted an admin's invitation to join their team
     * 
     * @param  Team   $team 
     * @return void
     */
    public function userHasAcceptedInvitation(Team $team)
    {
        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $team->id];

        $member = TeamMember::firstOrNew($attributes)->acceptInvitation();
    }


    /**
     * Logged-in user declined an admin's invitation to join their team
     * 
     * @param  Team   $team 
     * @return void
     */
    public function userHasDeclinedInvitation(Team $team)
    {
        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $team->id];

        $member = TeamMember::firstOrNew($attributes)->thanksButNoThanks();
    }



    /**
     * Logged-in user has requested to join this team
     * 
     * @param  Team   $team 
     * @return void
     */
    public function userHasAskedToJoin(Team $team) {
        
        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $team->id];
        
        $member = TeamMember::firstOrNew($attributes)->requestToJoin();
    }



    /**
     * Logged-in user has canceled their request to join this team
     * 
     * @param  Team   $team 
     * @return void
     */
    public function userHasCanceledRequestToJoin(Team $team) {
        
        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $team->id];
        
        $member = TeamMember::firstOrNew($attributes)->cancelRequestToJoin();
    }
}