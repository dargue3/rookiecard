<?php
namespace App\RC\Team\Roles;

use App\Exceptions\ApiException;

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
     * @return App\TeamMember
     */
    private function fetchRoles()
    {
        $this->roleArray = [];

        foreach ($this->roles()->get() as $role) {
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
     * @return App\TeamMember
     */
    public function addRole(RoleInterface $role, $deleteOtherRoles = false)
    {   
        if($this->hasRole($role)) {
            throw new ApiException("User is already a " . $role->name());
        }

        if ($deleteOtherRoles) {
            $this->removeAllRoles();
        }

        $this->roles()->attach($role->id());

        // cache locally
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

        // remove from local cache
        $this->roleArray = array_diff($this->roleArray, [$role->name()]);

        return $this;
    }



    /**
     * Attach or remove a role according to boolean input
     * 
     * @param RoleInterface $role   
     * @param boolean $status
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

        return $this->addRole($role);
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
     * Removes Invited roles from member
     * 
     * @return  App\TeamMember
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
     * @return mixed
     */
    public function deleteIfTheyHaveNoRoles()
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











