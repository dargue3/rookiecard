<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

use App\TeamInvite;
use App\Stat;

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


    //checks if this user is a fan
    public function isFan() {

        return $this->role == 4 || $this->role == 45 || $this->role == 46 || $this->role == 47;

    }


    //checks if this user is a member of some sort
    public function isMember() {

        return $this->role == 0 || $this->role == 2;

    }


    //checks if this user is a ghost
    public function isGhost() {

        return $this->user_id == 0;

    }


    //checks if this user is a ghost
    public function isPlayer() {

        return $this->role == 0 || $this->role == 1;

    }



    //checks if this user is a ghost
    public function isCoach() {

        return $this->role == 2 || $this->role == 3;

    }


    //checks if this user has been invited to join this team
    public function isInvited() {

        return $this->role == 5 || $this->role == 6 || $this->role == 45 || $this->role == 46;

    }


    //checks if this user has been invited to join this team
    public function isAnInvitedPlayer() {

        return $this->role == 5 || $this->role == 45;

    }


    //checks if this user has been invited to join this team
    public function isAnInvitedCoach() {

        return $this->role == 6 || $this->role == 46;

    }



    //checks if this user has been invited to join this team
    public function hasRequestedToJoin() {

        return $this->role == 7 || $this->role == 47;

    }




    //switch the fan status of a user
    public function toggleFan() {

        if(!$this->exists) {
            //this is a brand new model
            $this->role = 4;
            $this->save();
        }

        else if($this->isMember()) {
            //we don't want someone to be a fan and a member
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        else if($this->isFan()) {
            //they're a fan, undo that
            $this->removeFan();
        }

        else {
            //they're not a fan, make them one
            $this->makeFan();
        }

        return ['ok' => true];
    }




    //makes a user a fan of a team
    public function makeFan() {
 
        if($this->isInvited() || $this->hasRequestedToJoin()) {
            //if they've been invited or have requested to join, they can be fans too
            $this->role += 40; //see roles description above for why this makes sense
            $this->save();
        }

        else {
            //just make them a fan
            $this->role = 4;
            $this->save();
        }

        return;
    }




    //remove this user as a fan of this team
    public function removeFan() {

        if($this->isInvited() || $this->hasRequestedToJoin()) {
            //they're a fan and have been invited or have requested to join the team
            //save the other section of their membership
            $this->role -= 40;
            $this->save();
        }
        else {
            $this->delete();
        }

        return;
    }




    //add a user to the team based on their email
    //assumes a fresh instance of TeamMember
    public function createGhostAndInviteUser($user) {

        //add a ghost user as a placeholder for the time being
        $this->createGhostUser($user);

        if($user['email']) {
            //invite that email to join team
            $this->invite($user['email']);
        }
  
        return;
    }




    //create a placeholder 'ghost' user with a given name
    public function createGhostUser($user) {

        $this->user_id = 0;
        $this->role = $user['role'];
        $this->meta = json_encode($this->getDefaultGhostMetaData($user['name'], $user['email']));
        $this->save();
        
        return;
    }




    //invite this email to the team
    //if not a RC user, invite them to join the site
    //assumes role and team_id are set
    public function invite($email) {

        if($this->role == 1 || $this->role == 5) $role = 5; //invited player
        if($this->role == 3 || $this->role == 6) $role = 6; //invited coach

        //check if that email is already tied to an account
        $existingUser = User::where('email', $email)->first();

        if($existingUser) {

            $attributes = ['user_id' => $existingUser->id, 'team_id' => $this->team_id];
            $member = TeamMember::firstOrNew($attributes);

            if(!$member->exists) {
                $member->role = $role;
                $member->save();
            }

            else if($member->isMember()) {
                //they're already a member, that shouldn't happen...
                return;
            }

            else if($member->hasRequestedToJoin()) {
                //they wanted to join already anyways, accept invitation
                if($member->isFan()) {
                    $member->role = 40 + $role;
                }
                else {
                    $member->role = $role;
                }

                $member->save();
                $member->acceptInvitation($email);
                return;
            }

            else if($member->isFan()) {
                //if they're a fan, update role to fan + invited
                $member->role = 40 + $role;
                $member->save();
            }

            //create a notification telling them to check this team out
            (new Notification)->teamInvite($this->team_id, $existingUser->id);
        }

        else {
            //user isn't in our database yet, send email inviting them to RC
            $attributes = ['email' => $email, 'team_id' => $this->team_id];
            TeamInvite::firstOrNew($attributes)->inviteToRookiecard($role);
        }

        return;
    }






    //logged in user has requested to join a team or cancelled their request
    public function requestToJoin() {

        if(!$this->exists) {
            //this is a new member entry
            $this->role = 7;
            $this->save();
        }

        else if($this->isMember()) {
            //members shouldn't be able to request to be members
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        else if($this->hasRequestedToJoin()) {
            //they've already been here, so they must be cancelling this request
            if($this->isFan()) {
                //keep fan status, remove request stats
                $this->role = 4;
                $this->save();
            }
            else {
                //otherwise just get rid of this model
                $this->delete();
            }
        }

        else if($this->isInvited()) {
            //this shouldn't happen... but if they want to join and are invited, let them join
            $this->acceptInvitation();
        }

        else {
            if($this->isFan()) {
                //make them a fan and requested
                $this->role = 47;
                $this->save();
            }

            else {
                //okay, finally just add them as requested to join
                $this->role = 7;
                $this->save();
            }
        }

        return ['ok' => true];
    }




    //a user has opted to join a team, switch them from invited to player/coach/fan
    public function acceptInvitation($email = null) {

        if(!$this->exists) {
            //this was a new instantiated class, which means no invite
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if(!$this->isInvited()) {
            //they aren't marked as being invited
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if($this->isMember()) {
            //they're already a member of this team
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        //switch from invited to actual member
        if($this->isAnInvitedPlayer()) {
            //make them a player
            $this->role = 0; 
        }
        else if($this->isAnInvitedCoach()) {
            //make them a coach
            $this->role = 2;
        }

        //track down their ghost by looking for their email in ghost meta data
        $email = $email ? $email : Auth::user()->email; 
        $ghost = $this->findGhostByEmail($email);

        if($ghost) {
            //get rid of the ghost-only meta data but keep the rest of it
            $meta = json_decode($ghost->meta);
            unset($meta->ghost);
            $this->meta = json_encode($meta);
            $this->save();
        }
        else {
            $this->meta = json_encode($this->getDefaultMetaData());
            $this->save();
        }
        
        //find any stats associated with this ghost
        if($ghost) {

            $stats = Stat::findByTeamMember($this->team_id, $ghost->id)->get();

            foreach($stats as $stat) {
                //found some ghost stats, switch data to this user's data            
                $stat->member_id = $this->id;
                $stat->owner_id = $this->user_id;
                $stat->save();
            }

            //get rid of the ghost, this user is replacing it
            $ghost->delete();
        }
    
        return ['ok' => true];
    }


    //logged in user is declining their invitation to join a team
    public function thanksButNoThanks() {

        if(!$this->exists) {
            //this was a new instantiated class, which means no invite
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if(!$this->isInvited()) {
            //they aren't marked as being invited
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if($this->isMember()) {
            //they're already a member of this team
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        else if($this->isFan()) {
            //they're a fan and were invited, just retain their fan status
            $this->role = 4;
            $this->save();
        }

        else {
            //just delete their invitation
            $this->delete();
        }

        return ['ok' => true];
    }


    //return the default meta data for a new player on a team
    public function getDefaultPlayerMetaData() {

        return ['positions' => [], 'num' => ''];

    }



    //return the default meta data for a new ghost on a team
    public function getDefaultGhostMetaData($name, $email) {

        return [
            'ghost' => [
                'name'  => $name,
                'email' => $email,
            ],
            'positions' => [],
            'num'       => '',
        ];

    }


    //find the ghost associated with an email on this team
    public function findGhostByEmail($email) {

        $ghosts = $this->ghosts($this->team_id)->get();

        foreach($ghosts as $ghost) {

            $meta = json_decode($ghost->meta);

            //does this ghost's meta data contain the user's email?
            if($meta->ghost->email == $email) {
                return $ghost;
            }
        }

        //if we got here without finding a ghost, there isn't one
        return null;
    }



    //given an array of meta data, add it to this member
    public function attachMetaData($data) {

        //add any included meta data
        $meta = json_decode($this->meta);

        if(isset($data['num']))
            $meta->num = $data['num'];

        if(isset($data['positions']))
            $meta->positions = $data['positions'];

        $this->meta = json_encode($meta);
        $this->save();

        return;
    }


    //edit an existing member to match the credentials passed in
    public function editMember($data) {

        if(isset($data['admin']))
            $this->admin = $data['admin'] ? 1 : 0;
        else
            $this->admin = 0;

        if(!$this->isFan()) {
            //save member related info
            $this->attachMetaData($data['meta']);
            $this->role = $data['role'];
        }

        $this->save();

        return;
    }




    //process for deleting a member:
    //if member is a user, they become a ghost
    //if member is a ghost, they get completely deleted, stats erased
    public function deleteMember($metaData) {

        if($this->isFan()) {

            //nothing special here
            $this->delete();

            return;
        }

        //if they're a ghost, remove from team entirely
        if($this->isGhost()) {

            //a bit of work, outsourced it to a separate function
            $this->deleteGhost();

            return;
        }

        //if they're a real user, switch them to being a ghost
        $this->role = $this->isPlayer() ? 1 : 3;
        $this->id = 0;
        $this->admin = 0;
        $this->meta = $this->getDefaultGhostMetaData(); //first just fill with ghost data
        $this->meta = $this->attachMetaData($metaData); //re-attach existing meta data
        $this->save();

        return;
    }



    //delete a ghost and all the data that could be scattered around attached to them
    public function deleteGhost() {

        //delete any stats
        $stats = new Stat;
        $stats->deleteByMember($this);

        //delete any outstanding invitations this is placeholding
        $email = json_decode($this->meta)->ghost->email;
        TeamInvite::where('email', $email)->where('team_id', $this->team_id)->delete();
        
        $this->delete();

        return;
    }












}
