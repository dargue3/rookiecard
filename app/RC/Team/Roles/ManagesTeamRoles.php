<?php
namespace App\RC\Team\Roles;

use App\TeamRole;
use App\Exceptions\ApiException;

use App\RC\Team\Roles\RoleInterface;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;

trait ManagesTeamRoles
{
    /**
     * Array of this member's roles
     * 
     * @var array
     */
	public $roleArray = null;
	

    /**
     * Fetches the roles associated with user and stores them
     * 
     * @return App\TeamMember
     */
    private function fetchRoles()
    {
        $this->roleArray = $this->roles()->get()->map(function($role) {
            return $role->name;
        })->all();

        return $this;
    }


    /**
     * Checks if member has a given role
     * 
     * @param  App\RC\Team\Roles\RoleInterface $role
     * @return boolean
     */
    public function hasRole(RoleInterface $role)
    {
        if (! is_array($this->roleArray)) {
            $this->fetchRoles();
        }

        return (boolean) in_array($role->name(), $this->roleArray);
    }



    /**
     * Attaches a given role to this member
     * 
     * @param App\RC\Team\Roles\RoleInterface $role
     * @param boolean $detachOthers
     * @return App\TeamMember
     */
    public function addRole(RoleInterface $role, $detachOthers = false)
    {   
        if($this->hasRole($role)) {
            throw new ApiException("User is already a " . $role->name());
        }

        if ($detachOthers) {
            $this->removeAllRoles();
        }

        $this->roles()->attach($role->id());

        array_push($this->roleArray, $role->name());

        return $this;
    }


    /**
     * Removes a given role from the member
     * 
     * @param  RoleInterface $role
     * @return TeamMember
     */
    public function removeRole(RoleInterface $role)
    {
        $this->roles()->detach($role->id());

        unset($this->roleArray[$role->name()]);

        return $this;
    }


    /**
     * Attach or remove a role according to boolean input
     * 
     * @param RoleInterface $role   
     * @param boolean        $status
     * @return TeamMember
     */
    public function setRole(RoleInterface $role, $status)
    {
        if ($status) {
            return $this->addRole($role);
        }

        return $this->removeRole($role);
    }




    /**
     * Toggle whether the member has this role
     * 
     * @param RoleInterface $role   
     * @param boolean        $status
     * @return TeamMember
     */
    public function toggleRole(RoleInterface $role)
    {
        if ($this->hasRole($role)) {
            return $this->removeRole($role);
        }

        return $this->setRole($role);
    }



    /**
     * Removes all roles associated with this member
     * 
     * @return  App\TeamMember
     */
    public function removeAllRoles()
    {
        $this->roles()->detach();

        $this->roleArray = [];

        return $this;
    }


    /**
     * If there are no roles associated with this member, delete them
     * 
     * @return mixed
     */
    public function deleteIfNecessary()
    {
        if (is_array($this->roleArray) and empty($this->roleArray)) {
            $this->delete();
            return null;
        }

        return $this;
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
        return  $this->hasRole(new GhostPlayer) or 
                $this->hasRole(new GhostCoach);
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
        return  $this->hasRole(new Player) or
                $this->hasRole(new GhostPlayer);
    }



     /**
     * @return boolean
     */
    public function isCoach()
    {
        return  $this->hasRole(new Coach) or
                $this->hasRole(new GhostCoach);
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
        return  $this->hasRole(new InvitedPlayer) or
                $this->hasRole(new InvitedCoach);
    }



     /**
     * @return boolean
     */
    public function hasRequestedToJoin()
    {
        return $this->hasRole(new RequestedToJoin);
    }



}











