<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\TeamMember;

class TeamInvite extends Model
{
    
/*  
  	this model represents the table of users who were invited to join a team at rookiecard
	however they don't yet have an account. emails in this table are compared against new
	registrations as to invite them to teams right as they create their account

    'role' designates which role in the team they were invited to fill (consistent with TeamMember model)
    5 = player
    6 = coach
    7 = fan

    'ghost_id' is the id of the ghost that is currently holding their spot on the team
*/


    protected $table = 'rc_team_invites';

    protected $fillable = ['email', 'team_id', 'ghost_id', 'role'];


    //add a user to the table (they don't have a rookiecard account yet)
    public function inviteToRookiecard($team_id, $email, $role, $ghost_id) {

        //reassign roles to be 'invites' if not already
        if($role == 1) $role = 5;
        if($role == 3) $role = 6;

    	$invite = $this->firstOrNew(['team_id' => $team_id, 'email' => $email]);

        if($invite->ghost_id == 0) {
            //new invite, send email to user

            //INSERT MAIL CALL HERE
        }

        $invite->ghost_id = $ghost_id;
        $invite->role = $role;
        $invite->save();

    	return;
    }


    //a new user has joined, if this email matches any in table, add them as 'invited' in TeamMember table
    public function inviteNewUserToTeams($user) {

    	$teams = $this->where('email', $user->email)->get();

    	if(!$teams) 
    		return;

    	$member = new TeamMember;

    	//for each team, create a TeamMember row and list them as an invited member
    	foreach($teams as $team) {
    		$member->invite($team->team_id, $team->ghost_id, $user, $team->role);

            //delete this entry
            $team->delete();
    	}

        

    }
}