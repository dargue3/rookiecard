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
*/


    protected $table = 'rc_team_invites';

    protected $fillable = ['email', 'team_id', 'ghost_id', 'role'];


    //add a user to the table (they don't have a rookiecard account yet)
    public function inviteToRookiecard($role) {

        if($this->exists) {
            //this email has already been invited to this team, skip
            return;
        }

        $this->role = $role;
        $this->save();
      
    	return;
    }


    //a new user has joined, if this email matches any in table, add them as 'invited' in TeamMember table
    public function inviteNewUserToTeams($user) {

    	$teams = $this->where('email', $user->email)->get();

    	//for each team, create a TeamMember row and list them as an invited member
    	foreach($teams as $team) {

            $attributes = ['team_id' => $team->id, 'role' => $this->role];
            (new TeamMember($attributes))->invite($user->email);

            //delete this entry
            $team->delete();
    	}

        return;
    }
}