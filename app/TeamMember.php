<?php

namespace App;

use App\Rookiecard\Team\Roles\ManagesTeamRoles;
use App\Rookiecard\Team\Roles\RoleInterface;
use App\Rookiecard\Team\Roles\GhostInterface;
use App\Rookiecard\Team\Roles\MemberInterface;
use App\Rookiecard\Team\Roles\Player;
use App\Rookiecard\Team\Roles\GhostPlayer;
use App\Rookiecard\Team\Roles\Coach;
use App\Rookiecard\Team\Roles\GhostCoach;
use App\Rookiecard\Team\Roles\Fan;
use App\Rookiecard\Team\Roles\InvitedPlayer;
use App\Rookiecard\Team\Roles\InvitedCoach;
use App\Rookiecard\Team\Roles\RequestedToJoin;

use App\Stat;
use App\TeamInvite;
use App\TeamRole;
use App\Exception\ApiException;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Faker\Factory;

class TeamMember extends Model
{
    use SoftDeletes;
    use ManagesTeamRoles;

    protected $table = 'rc_team_members';
    protected $guarded = [];
    protected $dates = ['deleted_at'];


    /**
     * Build query to find all of the members of this team
     * 
     * @param  Illuminate\Database\Query\Builder
     * @param  integer
     * @param  integer
     * @return Illuminate\Database\Query\Builder
     */
    public function scopeMember($query, $user_id, $team_id)
    {
        return $query->where('user_id', $user_id)->where('team_id', $team_id);
    }

    /**
     * Build query to find all of the ghosts on this team
     * 
     * @param  Illuminate\Database\Query\Builder
     * @param  integer
     * @return Illuminate\Database\Query\Builder
     */
    public function scopeGhosts($query, $team_id)
    {
        return $query->where('user_id', 0)->where('team_id', $team_id);
    }

    /**
     * Returns this member's roles
     * 
     * @return Illuminate\Support\Collection
     */
    public function roles()
    {
        return $this->belongsToMany('App\TeamRole', 'rc_member_role', 'member_id', 'role_id')->withTimestamps();
    }


    /**
     * Instantiate a new (ghost) player on this team
     * 
     * @param string
     * @return App\TeamMember
     */
    public function addNewPlayer($name = '')
    {
        return $this->addGhost(new GhostPlayer, $name);
    }


    /**
     * Instantiate a new (ghost) coach on this team
     * 
     * @param string
     * @return App\TeamMember
     */
    public function addNewCoach($name = '')
    {
        return $this->addGhost(new GhostCoach, $name);
    }



    /**
     * Setup and instantiate a new ghost member on this team
     * 
     * @param App\Rookiecard\Team\Roles\GhostInterface
     * @param string
     * @return App\TeamMember
     */
    private function addGhost(GhostInterface $role, $name)
    {
        // if no name included, make one up
        $name = $name ?: Factory::create()->name;
        $this->user_id = 0;
        $this->meta = json_encode($role->getDefaultMetaData($name));
        $this->save();

        $this->setRole($role);

        return $this;
    }






    public function invite($email)
    {

        // check if that email is already tied to an account
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            $attributes = ['user_id' => $existingUser->id, 'team_id' => $this->team_id];
            $member = TeamMember::firstOrNew($attributes);

            if (!$member->exists) {
                $member->role = $role;
            }

            $member->role = $member->role->invite($role);
            $member->save();

            // create a notification telling them to check this team out
            (new Notification)->teamInvite($this->team_id, $existingUser->id);

            return;
        }

        // user isn't in our database yet, send email inviting them to RC
        $attributes = ['email' => $email, 'team_id' => $this->team_id];
        TeamInvite::firstOrNew($attributes)->inviteToRookiecard($role);

        return;
    }






    // logged in user has requested to join a team or cancelled their request
    public function requestToJoin()
    {
        if(!$this->exists) {
            // this is a new member entry
            $this->role = 7;
            $this->save();
        }

        else if($this->isMember()) {
            // members shouldn't be able to request to be members
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        else if($this->hasRequestedToJoin()) {
            // they've already been here, so they must be cancelling this request
            if($this->isFan()) {
                // keep fan status, remove request stats
                $this->role = 4;
                $this->save();
            }
            else {
                // otherwise just get rid of this model
                $this->delete();
            }
        }

        else if($this->isInvited()) {
            // this shouldn't happen... but if they want to join and are invited, let them join
            $this->acceptInvitation();
        }

        else {
            if($this->isFan()) {
                // make them a fan and requested
                $this->role = 47;
                $this->save();
            }

            else {
                // okay, finally just add them as requested to join
                $this->role = 7;
                $this->save();
            }
        }

        return ['ok' => true];
    }




    // a user has opted to join a team, switch them from invited to player/coach/fan
    public function acceptInvitation($email = null) {

        if(!$this->exists) {
            // this was a new instantiated class, which means no invite
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if(!$this->isInvited()) {
            // they aren't marked as being invited
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if($this->isMember()) {
            // they're already a member of this team
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        // switch from invited to actual member
        if($this->isAnInvitedPlayer()) {
            // make them a player
            $this->role = 0; 
        }
        else if($this->isAnInvitedCoach()) {
            // make them a coach
            $this->role = 2;
        }

        // track down their ghost by looking for their email in ghost meta data
        $email = $email ? $email : Auth::user()->email; 
        $ghost = $this->findGhostByEmail($email);

        if($ghost) {
            // get rid of the ghost-only meta data but keep the rest of it
            $meta = json_decode($ghost->meta);
            unset($meta->ghost);
            $this->meta = json_encode($meta);
            $this->save();
        }
        else {
            $this->meta = json_encode($this->getDefaultMetaData());
            $this->save();
        }
        
        // find any stats associated with this ghost
        if($ghost) {

            $stats = Stat::findByTeamMember($this->team_id, $ghost->id)->get();

            foreach($stats as $stat) {
                // found some ghost stats, switch data to this user's data            
                $stat->member_id = $this->id;
                $stat->owner_id = $this->user_id;
                $stat->save();
            }

            // get rid of the ghost, this user is replacing it
            $ghost->delete();
        }
    
        return ['ok' => true];
    }


    // logged in user is declining their invitation to join a team
    public function thanksButNoThanks() {

        if(!$this->exists) {
            // this was a new instantiated class, which means no invite
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if(!$this->isInvited()) {
            // they aren't marked as being invited
            return ['ok' => false, 'error' => "You haven't been invited to this team"];
        }

        else if($this->isMember()) {
            // they're already a member of this team
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        else if($this->isFan()) {
            // they're a fan and were invited, just retain their fan status
            $this->role = 4;
            $this->save();
        }

        else {
            // just delete their invitation
            $this->delete();
        }

        return ['ok' => true];
    }


    // find the ghost associated with an email on this team
    public function findGhostByEmail($email)
    {
        $ghosts = $this->ghosts($this->team_id)->get();

        foreach($ghosts as $ghost) {

            $meta = json_decode($ghost->meta);

            // does this ghost's meta data contain the user's email?
            if($meta->ghost->email == $email) {
                return $ghost;
            }
        }

        // if we got here without finding a ghost, there isn't one
        return null;
    }



    // given an array of meta data, add it to this member
    public function attachMetaData($data) {

        // add any included meta data
        $meta = json_decode($this->meta);

        if(isset($data['num']))
            $meta->num = $data['num'];

        if(isset($data['positions']))
            $meta->positions = $data['positions'];

        $this->meta = json_encode($meta);
        $this->save();

        return;
    }


    // edit an existing member to match the credentials passed in
    public function editMember($data) {

        if(isset($data['admin']))
            $this->admin = $data['admin'] ? 1 : 0;
        else
            $this->admin = 0;

        if(!$this->isFan()) {
            // save member related info
            $this->attachMetaData($data['meta']);
            $this->role = $data['role'];
        }

        $this->save();

        return;
    }




    // process for deleting a member:
    // if member is a user, they become a ghost
    // if member is a ghost, they get completely deleted, stats erased
    public function deleteMember($metaData) {

        if($this->isFan()) {

            // nothing special here
            $this->delete();

            return;
        }

        // if they're a ghost, remove from team entirely
        if($this->isGhost()) {

            // a bit of work, outsourced it to a separate function
            $this->deleteGhost();

            return;
        }

        // if they're a real user, switch them to being a ghost
        $this->role = $this->isPlayer() ? 1 : 3;
        $this->id = 0;
        $this->admin = 0;
        $this->meta = $this->getDefaultGhostMetaData(); // first just fill with ghost data
        $this->meta = $this->attachMetaData($metaData); // re-attach existing meta data
        $this->save();

        return;
    }



    // delete a ghost and all the data that could be scattered around attached to them
    public function deleteGhost() {

        // delete any stats
        $stats = new Stat;
        $stats->deleteByMember($this);

        // delete any outstanding invitations this is placeholding
        $email = json_decode($this->meta)->ghost->email;
        TeamInvite::where('email', $email)->where('team_id', $this->team_id)->delete();
        
        $this->delete();

        return;
    }












}
