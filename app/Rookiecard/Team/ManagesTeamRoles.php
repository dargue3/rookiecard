<?php
namespace App\Rookiecard\Team;

use App\TeamRole;

trait ManagesTeamRoles
{
	private $roleArray;
	
    private function fetchRoles()
    {
        $this->roleArray = [];

        foreach($this->roles()->get() as $role) {
            $this->roleArray[] = $role->name;
        }

        return $this;
    }


    //check if a member has a particular role
    private function hasRole($role)
    {
        if (! $this->roleArray) {
            $this->fetchRoles();
        }

        return in_array($role, $this->roleArray);
    }

    public function isMember()
    {
        return $this->isPlayer() or $this->isCoach();
    }


    public function isGhost()
    {
        return $this->user_id == 0;
    }


    public function isAdmin()
    {
        return $this->hasRole('admin');
    }


    public function isPlayer()
    {
        return $this->hasRole('player') or $this->hasRole('ghost_player');
    }


    public function isCoach()
    {
        return $this->hasRole('coach') or $this->hasRole('ghost_coach');
    }


    public function isFan()
    {
        return $this->hasRole('fan');
    }


    public function hasBeenInvited()
    {
        return $this->hasRole('invited_player') or $this->hasRole('invited_coach');
    }


    public function hasRequestedToJoin()
    {
        return $this->hasRole('requested_to_join');
    }


    // if a member doesn't have any roles, delete this instance of TeamMember
    private function deleteIfNecessary()
    {
        if (! $this->roleArray) {
            $this->delete();
            return null;
        }

        return $this;
    }


    public function makeThemACoach()
    {
        $this->removeMemberRoles();

        $role = 'coach';
        if ($this->isGhost()) {
            $role = 'ghost_coach';
        }
        
        $this->roles()->attach(TeamRole::id($role));
    }


    public function makeThemAPlayer()
    {
        $this->removeMemberRoles();

        $role = 'player';
        if ($this->isGhost()) {
            $role = 'ghost_player';
        }
        
        $this->roles()->attach(TeamRole::id($role));
    }


    public function removeMemberRoles()
    {
        $this->roles()->detach(TeamRole::id('ghost_player'));
        $this->roles()->detach(TeamRole::id('player'));
        $this->roles()->detach(TeamRole::id('ghost_coach'));
        $this->roles()->detach(TeamRole::id('coach'));
        $this->roles()->detach(TeamRole::id('fan'));
    }
}











