<?php

namespace App;

use App\RC\Team\Roles\ManagesTeamRoles;
use App\RC\Team\Roles\RoleInterface;
use App\RC\Team\Roles\GhostInterface;
use App\RC\Team\Roles\MemberInterface;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\Admin;
use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;

use App\Stat;
use App\TeamInvite;
use App\TeamRole;
use App\Exceptions\ApiException;

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
     * @param  Builder
     * @param  integer
     * @param  integer
     * @return Builder
     */
    public function scopeMember($query, $user_id, $team_id)
    {
        return $query->where('user_id', $user_id)->where('team_id', $team_id);
    }



    /**
     * Build query to find all of the ghosts on this team
     * 
     * @param  Builder
     * @param  integer
     * @return Builder
     */
    public function scopeGhosts($query, $team_id)
    {
        return $query->where('user_id', 0)->where('team_id', $team_id);
    }



    /**
     * Returns this member's roles
     * 
     * @return Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles()
    {
        return $this->belongsToMany('App\TeamRole', 'rc_member_role', 'member_id', 'role_id')->withTimestamps();
    }


    /**
     * Instantiate a new (ghost) coach on this team
     * 
     * @param  integer $team_id
     * @param string $name
     * @return TeamMember
     */
    public static function newPlayer($team_id, $name = '')
    {
        return (new static(['team_id' => $team_id]))->addGhost(new GhostPlayer, $name);
    }


    /**
     * Instantiate a new (ghost) coach on this team
     * 
     * @param  integer $team_id
     * @param string $name
     * @return TeamMember
     */
    public static function newCoach($team_id, $name = '')
    {
        return (new static(['team_id' => $team_id]))->addGhost(new GhostCoach, $name);
    }



    /**
     * Setup and instantiate a new ghost member on this team
     * 
     * @param RoleInterface $role
     * @param string $name
     * @return TeamMember
     */
    private function addGhost(RoleInterface $role, $name)
    {
        // if no name included, make one up
        $name = $name ?: Factory::create()->name;

        $this->user_id = 0;
        $this->save();
        $this->addRole($role);

        $this->meta = json_encode($this->getDefaultMetaData($name));
        $this->save();

        return $this;
    }



    /**
     * Invites person with given email to the team
     * 
     * @param  string $email
     * @return TeamMember
    */
    public function invite($email)
    {
        if (! $this->isGhost()) {
            throw new ApiException('Member must be a ghost');
        }

        $this->addEmailToMetaData($email);

        $user = User::where('email', $email)->first();

        // check if that email is already tied to an account
        if ($user) {
            $attributes = ['user_id' => $user->id, 'team_id' => $this->team_id];
            $member = TeamMember::firstOrNew($attributes);
            $member->save();

            if ($member->isMember()) {
                throw new ApiException('This user is already a member');
            }

            if ($member->hasBeenInvited()) {
                throw new ApiException('This user has already been invited');
            }

            $role = $this->isPlayer() ? InvitedPlayer::class : InvitedCoach::class; 
            $member->addRole(new $role);

            // create a notification telling them to check this team out
            (new Notification)->teamInvite($this->team_id, $user->id);

            return $this;
        }

        // user isn't in our database yet, send email inviting them to RC
        TeamInvite::invite($this);

        return $this;
    }




    /**
     * Logged-in user is asking admin to join this team
     *     
     * @return void
     */
    public function requestToJoin()
    {
        // instantiate a new member if necessary
        if (! $this->exists) {
            $this->save();
        }

        // members shouldn't be able to request to be members
        else if ($this->isMember()) {
            throw new ApiException("You're already a member of this team");
        }

        return $this->addRole(new RequestedToJoin);
    }



    /**
     * Logged-in user canceled their request to join this team
     *     
     * @return void
     */
    public function cancelRequestToJoin()
    {
        // instantiate a new member if necessary
        if (! $this->exists or ! $this->hasRequestedToJoin()) {
            throw new ApiException("You never requested to join this team");
        }

        return $this->removeRole(new RequestedToJoin)->deleteIfTheyHaveNoRoles();
    }




    /**
     * Logged-in user is accepting an invitation to join this team
     * 
     * @return TeamMember       
     */
    public function acceptInvitation()
    {
        if (! $this->exists or ! $this->hasBeenInvited()) {
            throw new ApiException("You haven't been invited to this team");
        }

        else if ($this->isMember()) {
            throw new ApiException("You're already a member of this team");
        }

        return $this->replaceGhostWithUser();
    }



    /**
     * Convert a ghost member instance into a user-controlled member
     * 
     * @return TeamMember
     */
    public function replaceGhostWithUser()
    {   
        if ($this->hasRole(new InvitedPlayer)) {
            $this->addRole(new Player, true);
        }
        else if ($this->hasRole(new InvitedCoach)) {
            $this->addRole(new Coach, true);
        }

        $ghost = $this->findGhostByEmail(Auth::user()->email);

        if ($ghost) {
            // attach ghost's relevent meta data to user
            $meta = json_decode($ghost->meta);
            unset($meta->ghost);
            $this->meta = json_encode($meta);

            // any stats that belonged to the ghost now belong to this user
            Stat::switchOwners($ghost, $this); 

            $ghost->delete();
        }

        $this->save();

        return $this;
    }


    /**
     * Turn this user-controlled member instance into a ghost member
     * 
     * @return TeamMember
     */
    public function replaceUserWithGhost()
    {
        $oldUser = $this;

        if ($this->hasRole(new Player)) {
            $this->addRole(new GhostPlayer, true);
        }
        else if ($this->hasRole(new Coach)) {
            $this->addRole(new GhostCoach, true);
        }

        $user = User::findOrFail($this->user_id);
        $meta = json_decode($this->meta);

        // attach default meta data then overwrite with user's old data
        $this->meta = json_encode($this->getDefaultMetaData($user->fullName()));
        $this->attachMetaData((array) $meta);
        $this->user_id = 0;
        $this->save();

        // any stats that belonged to the ghost now belong to this user
        Stat::switchOwners($oldUser, $this); 

        return $this;
    }


    /**
     * Logged-in user is declining the invitation to join this team
     * 
     * @return TeamMember
     */
    public function thanksButNoThanks()
    {
        if (! $this->exists or ! $this->hasBeenInvited()) {
            throw new ApiException("You haven't been invited to this team");
        }

        else if ($this->isMember()) {
            throw new ApiException("You're already a member of this team");
        }

        return $this->removeInviteRoles()->deleteIfTheyHaveNoRoles();
    }




    /**
     * Toggle the fan status of this user
     * 
     * @return App\TeamMember
     */
    public function toggleFan()
    {
        if (! $this->exists) {
            $this->save();
            return $this->addRole(new Fan);
        }

        // don't want members also becoming fans
        else if ($this->isMember()) {
            throw new ApiException('You are already a member.');
        }

        return $this->toggleRole(new Fan); 
    }




    /**
     * Return the ghost on this team that matches a given email
     * 
     * @param  string $email
     * @return TeamMember|null       
     */
    public function findGhostByEmail($email)
    {
        $ghosts = self::ghosts($this->team_id)->get();

        foreach ($ghosts as $ghost) {
            $meta = json_decode($ghost->meta);

            // does this ghost's meta data contain the user's email?
            if ($meta->ghost->email == $email) {
                return $ghost;
            }
        }

        // if we got here without finding a ghost, there isn't one
        return null;
    }


    /**
     * Add this email to the ghost's member data
     * 
     * @param string $email
     * @return  TeamMember
     */
    private function addEmailToMetaData($email)
    {
        $meta = json_decode($this->meta);

        $meta->ghost->email = $email;    

        $this->meta = json_encode($meta);
        $this->save();

        return $this;
    }




    /**
     * Attaches given array as meta data onto this member
     * 
     * @param  array $data
     * @return TeamMember       
     */
    public function attachMetaData($data)
    {
        $meta = (array) json_decode($this->meta);

        foreach ($data as $key => $value) {
            $meta[$key] = $value;
        }

        $this->meta = json_encode($meta);
        $this->save();

        return $this;
    }



    /**
     * Set this member's default meta data according to their role
     * 
     * @param  string $name
     * @return TeamMember
     */
    private function getDefaultMetaData($name = '')
    {
        if ($this->isGhost()) {
            return [
                'ghost' => [
                    'name'  => $name,
                    'email' => '',
                ],
                'positions' => [],
                'num'       => '',
            ];
        }

        return [
            'positions' => [],
            'num'       => '',
        ];
    }


    /**
     * Make this member's data match the arguments
     * 
     * @param  array $data Array of meta data to be attached
     * @param  boolean $admin Their new admin status
     * @return TeamMember
     */
    public function editMember($data, $admin)
    {
        $this->attachMetaData($data);

        $this->setRole(new Admin, $admin);

        return $this;
    }




    /**
     * Delete this member
     * 
     * If the member is a user, turn this member into a ghost version of them.
     * If the member is a ghost, completely delete this entry and all associated data.
     * 
     * @return TeamMember|null
     */
    public function deleteMember()
    {
        if (! $this->isMember()) {
            throw new ApiException("This user is not a member of this team");
        }

        if (! $this->isGhost()) {
            return $this->replaceUserWithGhost();
        }

        return $this->deleteGhost();
    }



    /**
     * Delete this instance and all associated data
     * 
     * @return null
     */
    public function deleteGhost() {

        // delete any stats
        Stat::teamMember($this->team_id, $this->id)->delete();

        // delete any outstanding invitations this is placeholding
        $meta = json_decode($this->meta);
        if (isset($meta->ghost->email)) {
            $email = $meta->ghost->email;
            TeamInvite::where('email', $email)->where('team_id', $this->team_id)->delete();
        }

        $this->delete();

        return null;
    }












}
