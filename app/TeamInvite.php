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


    /**
     * Send an email inviting a non-user to join Rookiecard, and more specifically, their team
     * @param  TeamMember $ghost 
     * @return void        
     */
    public static function invite($ghost) {

        $email = json_decode($ghost->meta)->email;
        $instance = new static(['team_id' => $ghost->team_id, 'email' => $email, 'ghost_id' => $ghost->id]);
        $instance->save();

        // SEND THE MAIL HERE
    }


    //a new user has joined, if this email matches any in table, add them as 'invited' in TeamMember table
    public function inviteNewUserToTeams($user) {

    	$teams = self::where('email', $user->email)->get();

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