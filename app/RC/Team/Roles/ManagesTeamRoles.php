<?php
namespace App\RC\Team\Roles;

use Exception;

trait ManagesTeamRoles
{
    /**
     * Array acting as a cache of this member's roles
     * 
     * @var array
     */
	private $roleArray = null;


    /**
     * Returns roleArray
     * 
     * @return array
     */
    public function roleArray()
    {
       return $this->roleArray; 
    }
	


    /**
     * Fetches the roles associated with user and stores them locally
     * 
     * @return parent
     */
    private function fetchRoles()
    {
        $this->roleArray = [];

        $this->checkForMember();

        foreach ($this->member->roles()->get() as $role) {
            $this->roleArray[] = $role->name;
        }

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

        return in_array($role->name(), $this->roleArray);
    }



    /**
     * Attaches a given role to this member
     * 
     * @param App\RC\Team\Roles\RoleInterface $role
     * @param boolean $deleteOtherRoles
     * @return parent
     */
    public function addRole(RoleInterface $role, $deleteOtherRoles = false)
    {   
        $this->checkForMember();

        if ($deleteOtherRoles) {
            $this->removeAllRoles();
        }

        if ($this->hasRole($role)) {
            $role = $role->name();
            throw new Exception("This member already has a role of '$role'");
        }

        $this->member->roles()->attach($role->id());
        $this->member->save();

        // cache locally
        array_push($this->roleArray, $role->name());

        return $this;
    }


    /**
     * Removes a given role from the member
     * 
     * @param  RoleInterface $role
     * @return parent
     */
    public function removeRole(RoleInterface $role)
    {
        $this->checkForMember();

        $this->member->roles()->detach($role->id());
        $this->member->save();

        // remove from local cache
        $this->roleArray = array_diff($this->roleArray, [$role->name()]);

        return $this;
    }


    /**
     * Attach or remove a role according to boolean input
     * 
     * @param RoleInterface $role   
     * @param boolean $status
     * @return parent
     */
    public function setRole(RoleInterface $role, $status)
    {
        if ($status) {
            return $this->addRole($role);
        }

        return $this->removeRole($role);
    }


    /**
     * Toggle whether the member has given role
     * 
     * @param RoleInterface $role 
     * @return parent
     */
    public function toggleRole(RoleInterface $role)
    {
        if ($this->hasRole($role)) {
            return $this->removeRole($role);
        }

        return $this->addRole($role);
    }


    /**
     * Toggle the member from coach -> player or vice versa
     * 
     * @return parent
     */
    public function switchMemberRole()
    {
        if ($this->isGhost()) { 
            if ($this->hasRole(new GhostPlayer)) {
                return $this->addRole(new GhostCoach, true);
            }

            return $this->addRole(new GhostPlayer, true);
        }

        if ($this->hasRole(new Player)) {
            return $this->addRole(new Coach, true);
        }

        return $this->addRole(new Player, true);
    }



    /**
     * Removes all roles associated with this member
     * 
     * @return  parent
     */
    public function removeAllRoles()
    {
        $this->checkForMember();

        $this->member->roles()->detach();
        $this->member->save();

        $this->roleArray = [];

        return $this;
    }



    /**
     * Removes Invited roles from member
     * 
     * @return  parent
     */
    public function removeInviteRoles()
    {
        $this->removeRole(new InvitedPlayer);
        $this->removeRole(new InvitedCoach);

        return $this;
    }



    /**
     * If there are no roles associated with this member, delete them
     * 
     * @return parent
     */
    public function deleteIfTheyHaveNoRoles()
    {
        if (is_array($this->roleArray) and empty($this->roleArray)) {
            $this->destroy($this->member->id);
            $this->member = null;
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