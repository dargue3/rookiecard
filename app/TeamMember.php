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

        else if($this->isFan() && !$this->trashed()) {
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
 
        if($this->trashed()) {
            //this member was deleted, but here at rookiecard we recycle   
            $this->role = 4;
            $this->restore();
            $this->save();
        }

        else if($this->isInvited() || $this->hasRequestedToJoin()) {
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
    //used during a team creation request
    public function inviteAndCreateGhost($team_id, $user, $role) {

        //add a ghost user as a placeholder for the time being
        $ghost = $this->createGhostUser($team_id, $user, $role);

        if($user['email']) {
            //invite that email to join team
            $this->invite($team_id, $ghost->id, $user, $role);
        }
  
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
            $notification->teamInvite($existingUser, $team_id);
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




    //logged in user has requested to join a team or cancelled their request
    public function requestToJoin() {

        if(!$this->exists) {
            //this is a new member entry
            $this->role = 7;
            $this->save();
        }

        else if($this->trashed()) {
            //member was deleted, make a request and restore
            $this->role = 7;
            $this->restore();
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
    public function acceptInvitation() {

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
        $email = Auth::user()->email; 
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
    public function getDefaultMetaData() {

        return ['positions' => [], 'num' => ''];

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



    //edit an existing member to match the credentials passed in
    public function editMember($newMember) {

        $this->admin = $newMember['admin'] ? 1 : 0;

        if(!$this->isFan()) {
            //save member related info
            $this->meta = json_encode($newMember['meta']);
            $this->role = $newMember['role'];
            $this->save();
        }

        return ['ok' => true, 'user' => $this];
    }












}
