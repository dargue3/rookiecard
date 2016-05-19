<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\StatusUpdate;
use App\TeamInvite;
use Illuminate\Support\Facades\Auth;

class TeamMember extends Model
{
     /**
     * The database table used by the model.
     *
     * @var string
     */

    protected $table = 'rc_team_members';

    use SoftDeletes;


    /**
     * possible roles are as follows:
     * 0 = player 
     * 1 = ghost player
     * 2 = coach
     * 3 = ghost coach
     * 4 = fan
     * 5 = invited player
     * 6 = invited coach
     * 7 = has requested to join
     * 45 = invited player AND fan (it's like joining a 4 and a 5, right?)
     * 46 = invited coach AND fan
     * 47 = has requested to join AND fan
    */
    protected $fillable = ['user_id', 'team_id', 'role', 'admin', 'meta'];

    protected $dates = ['deleted_at'];


    //creates shortcut TeamMember::member($user_id, $team_id) to fetch a user
    public function scopeMember($query, $user_id, $team_id) {
        return $query->where('user_id', $user_id)->where('team_id', $team_id);
    }


    //creates shortcut TeamMember::ghosts($team_id) to fetch all ghosts
    public function scopeGhosts($query, $team_id) {
        return $query->where('user_id', 0)->where('team_id', $team_id);
    }


    //makes a user a fan of a team
    public function makeFan($user_id, $team_id) {

        $member = $this->member($user_id, $team_id)->withTrashed()->first();

        if(!$member) {
            //they're not already a member in some form
            $this->create([
                'user_id'   => $user_id,
                'team_id'   => $team_id,
                'role'      => 4,
            ]);
        }
        else if($member->deleted_at) {
            //this member was deleted, but here at rookiecard we recycle   
            $member->role = 4;
            $member->restore();
            $member->save();
        }
        else if($member->role == 5 || $member->role == 6 || $member->role == 7) {
            //if they've been invited or have requested to join, they can be fans too
            $member->role += 40; //see roles description above for why this makes sense
            $member->save();
        }
        else {
            //seems like they must already be a member of the team, shouldn't have happened
            return ['ok' => false, 'error' => 'There was a problem, try refreshing the page'];
        }

        return ['ok' => true];
    }


    //remove this user as a fan of this team
    public function removeFan($user_id, $team_id) {

        $member = $this->member($user_id, $team_id)->first();

        if(!$member) {
            //should've found some data
            return ['ok' => false, 'error' => 'There was a problem, try refreshing the page'];
        }
        else if($member->role == 45 || $member->role == 46 || $member->role == 47) {
            //they're a fan and have been invited or have requested to join the team
            //save the other section of their membership
            $member->role -= 40;
            $member->save();
        }
        else {
            //they're just a plain ol' fan 
            $member->delete();
        }

        return ['ok' => true];
    }




    //add a user to the team based on their email
    //used during a team creation request
    public function inviteAndCreateGhost($team_id, $user, $role) {

        //add a ghost user as a placeholder for the time being
        $ghost = $this->createGhostUser($team_id, $user, $role);

        //invite that email to join team
        if($user['email'])
            $this->invite($team_id, $ghost->id, $user, $role);
  
        return $ghost;
    }




    //invite this email to the team
    //if not a RC user, invite them to join the site
    public function invite($team_id, $ghost_id, $user, $role) {

        //check if that email is already tied to an account
        $existingUser = User::where('email', $user['email'])->first();

        
        if($existingUser) {
            //user exists, add them as an 'invited' user
            $member = $this->firstOrNew([
                'user_id'   => $existingUser->id,
                'team_id'   => $team_id,
            ]);

            if($member->role) {
                //they're already a member, that shouldn't happen...
                return;
            }
          
            //save their ghost's id so they can easily take its spot if they join
            $member->meta = json_encode(['ghost_id' => $ghost_id]);
            
            $member->role = $role;
            $member->save();

            //create a notification telling them to check this team out
            $notification = new Notification;
            $notification->createNotifications($existingUser->id, $team_id, 'team_invite');
        }

        else {
            //user isn't in our database yet, send email inviting them to RC
            $invite = new TeamInvite;
            $invite->inviteToRookiecard($team_id, $user['email'], $role, $ghost_id);
        }

        return;
    }




    //create a placeholder 'ghost' user with a given name
    public function createGhostUser($team_id, $user, $role) {

        if($role == 5) $role = 1; //ghost player
        if($role == 6) $role = 3; //ghost coach

        //ghost users have a 0 for a user_id
        $ghost = $this->create([
            'user_id'   => 0,
            'team_id'   => $team_id,
            'role'      => $role
        ]);

        //storing their TeamMember id here for easier access to an identifier
        $meta = [
            'ghost' => [
                'name'  => $user['name'],
                'email' => $user['email'],
            ],
            'positions' => [],
        ];

        $ghost->meta = json_encode($meta);
        $ghost->save();
        
        return $ghost;
    }




    //logged in user has requested to join a team
    public function requestToJoin($team) {

        //check if Auth user is already part of this team
        $member = $this->member(Auth::user()->id, $team->id)->first();

        if(!$member) {
            //user isn't a member or fan, just request to join
            $member = $this->create([
                'user_id'   => Auth::user()->id,
                'team_id'   => $team->id,
                'role'      => 7
            ]);
        }

        else if($member->role == 4) {
            //they're already a fan, update their role from 4 -> 47
            $member->role = 47;
            $member->save();
        }
       
        return $member;
    }




    //a user has opted to join a team, switch them from invited to player/coach/fan
    public function acceptInvitation($team, $user) {

        $thisUser = $this->member($user->id, $team->id)->first();

        if(!$thisUser) {
            //no member with these credentials
            return ['ok' => false, 'error' => "You haven't been invited"];
        }

        //switch from invited to actual member
        if($thisUser->role == 5) $thisUser->role = 0; //make them a player

        else if($thisUser->role == 6) $thisUser->role = 2; //make them a coach

        else return ['ok' => false, 'error' => "You haven't been invited"]; //they shouldn't have gotten here

        $thisUser->meta = json_encode(['positions' => []]);
        $thisUser->save();


        $ghost = $this->findGhostByEmail($team, $user->email);

        if($ghost) {
            //they are replacing a ghost user in the TeamMember table

            //find all of the stats associated with ghosts for this team
            $stats = new Stat;
            $stats = $stats->where('team_id', $team->id)->where('owner_id', 0)->get();

            foreach($stats as $stat) {
                //loop through all the stats, check the meta data for
                //a ghost ID matching the one we are replacing
                $meta = json_decode($stat->meta);
                if($meta->id == $ghost->id) {
                    //found stats associated with this ghost, change the data to this user's data
                    $meta->id = $thisUser->user_id;
                    $stat->owner_id = $thisUser->user_id;
                    $stat->meta = json_encode($meta);
                    $stat->save();
                }
            }
        }
    
        return ['ok' => true];
    }


    //logged in user is declining their invitation to join a team
    public function thanksButNoThanks($team) {

        $member = $this->member(Auth::user()->id, $team->id)->first();

        if(!$member) {
            //they weren't invited after all
            return ['ok' => false, 'error' => "You haven't been invited"];
        }
        else if($member->role == 45 || $member->role == 46) {
            //they were a fan, keep their fan status and remove invitation
            $member->role -= 40;
            $member->save();
        }
        else {
            $member->delete();
        }

        return ['ok' => true];
    }


    //find the ghost associated with an email on a ceratin team
    public function findGhostByEmail($team, $email) {

        $ghosts = $this->ghosts($team->id)->get();
        $theirGhost = null;

        foreach($ghosts as $ghost) {
            $meta = json_decode($ghost->meta);

            //does this ghost's meta data show the user's email?
            if($meta->ghost->email == $email) {
                $theirGhost = $ghost;
                $ghost->delete();
            }
        }

        return $theirGhost;

    }












}
