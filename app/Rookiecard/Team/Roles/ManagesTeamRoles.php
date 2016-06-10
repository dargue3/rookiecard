<?php
namespace App\Rookiecard\Team\Roles;

use App\TeamRole;
use App\Rookiecard\Team\Roles\RoleInterface;
use App\Rookiecard\Team\Roles\Player;
use App\Rookiecard\Team\Roles\Coach;
use App\Rookiecard\Team\Roles\GhostPlayer;
use App\Rookiecard\Team\Roles\GhostCoach;
use App\Rookiecard\Team\Roles\Fan;
use App\Rookiecard\Team\Roles\InvitedPlayer;
use App\Rookiecard\Team\Roles\InvitedCoach;
use App\Rookiecard\Team\Roles\RequestedToJoin;

trait ManagesTeamRoles
{
    /**
     * Array of this member's roles
     * 
     * @var array
     */
	private $roleArray;
	

    /**
     * Fetches the roles associated with user and stores them
     * 
     * @return App\TeamMember
     */
    private function fetchRoles()
    {
        $this->roleArray = [];

        foreach($this->roles()->get() as $role) {
            $this->roleArray[] = $role->name;
        }

        return $this;
    }


    /**
     * Checks if member has a given role
     * 
     * @param  App\Rookiecard\Team\Roles\RoleInterface
     * @return boolean
     */
    private function hasRole(RoleInterface $role)
    {
        if (! $this->roleArray) {
            $this->fetchRoles();
        }

        return (boolean) in_array($role->name(), $this->roleArray);
    }



    /**
     * Attaches a given role to this member
     * 
     * @param App\Rookiecard\Team\Roles\RoleInterface
     * @param boolean
     * @return App\TeamMember
     */
    private function setRole(RoleInterface $role, $detachOthers = true)
    {
        if ($detachOthers) {
            $this->roles()->detach();
        }

        $this->roles()->attach($role->id());

        $this->fetchRoles();

        return $this;
    }


    /**
     * Removes a given role from the member
     * 
     * @param  App\Rookiecard\Team\Roles\RoleInterface
     * @param  boolean
     * @return App\TeamMember
     */
    public function removeRole(RoleInterface $role, $delete = true)
    {
        $this->roles()->detach($role->id());

        $this->fetchRoles();

        if ($delete) {
            return $this->deleteIfNecessary();
        }

        return $this;
    }


    /**
     * Removes all roles associated with this member
     * 
     * @return  App\TeamMember
     */
    private function removeAllRoles()
    {
        $this->roles()->detach();

        return $this;
    }


    /**
     * If there are no roles associated with this member, delete them
     * 
     * @return mixed
     */
    private function deleteIfNecessary()
    {
        if (! $this->roleArray) {
            $this->delete();
        }

        return $this;
    }


    /**
     * Toggle the fan status of this user
     * 
     * @return App\TeamMember
     */
    public function toggleFan()
    {
        if (! $this->exists) {
            $this->setRole(new Fan);
            $this->save();
            return $this;
        }

        // we don't want members also becoming fans
        else if ($this->isMember()) {
            throw ApiException('User is already a member.');
        }

        else if (! $this->isFan()) {
            $this->setRole(new Fan);
            return $this;
        }

        $this->removeRole(new Fan);        
    }


    /**
     * @return boolean
     */
    public function isMember()
    {
        return  $this->hasRole(new Player) or
                $this->hasRole(new GhostPlayer) or 
                $this->hasRole(new GhostCoach) or 
                $this->hasRole(new Coach);
    }



     /**
     * @return boolean
     */
    public function isGhost()
    {
        return $this->hasRole(new GhostPlayer) or $this->hasRole(new GhostCoach);
    }



     /**
     * @return boolean
     */
    public function isAdmin()
    {
        return $this->hasRole(new Admin);
    }



     /**
     * @return boolean
     */
    public function isPlayer()
    {
        return $this->hasRole(new Player) or $this->hasRole(new GhostPlayer);
    }



     /**
     * @return boolean
     */
    public function isCoach()
    {
        return $this->hasRole(new Coach) or $this->hasRole(new GhostCoach);
    }



     /**
     * @return boolean
     */
    public function isFan()
    {
        return $this->hasRole(new Fan);
    }



     /**
     * @return boolean
     */
    public function hasBeenInvited()
    {
        return $this->hasRole(new InvitedPlayer) or $this->hasRole(new InvitedCoach);
    }



     /**
     * @return boolean
     */
    public function hasRequestedToJoin()
    {
        return $this->hasRole(new RequestedToJoin);
    }



}











