<?php

namespace App;

class TeamRole {

    const PLAYER = 0;
    const GHOST_PLAYER = 1;
    const COACH = 2;
    const GHOST_COACH = 3;
    const FAN = 4;
    const INVITED_PLAYER = 5;
    const INVITED_COACH = 6;
    const REQUESTED_TO_JOIN = 7;
    const INVITED_PLAYER_AND_FAN = 45;
    const INVITED_COACH_AND_FAN = 46;
    const REQUESTED_TO_JOIN_AND_FAN = 47;

	private $role;

	public function __construct($role)
	{
		$this->role = $role;
	}


    public function isFan()
    {
        return 	$this->role === self::FAN || 
        		$this->role === self::INVITED_PLAYER_AND_FAN || 
        		$this->role === self::INVITED_COACH_AND_FAN || 
        		$this->role === self::REQUESTED_TO_JOIN_AND_FAN;
    }


    public function isMember()
    {
        return 	$this->role === self::PLAYER || 
        		$this->role === self::GHOST_PLAYER || 
        		$this->role === self::COACH || 
        		$this->role === self::GHOST_COACH;
    }


    public function isGhost()
    {
        return $this->role === self::GHOST_PLAYER || $this->role === self::GHOST_COACH;
    }


    public function isPlayer()
    {
        return $this->role === self::PLAYER || $this->role === self::GHOST_PLAYER;
    }


    public function isCoach()
    {
        return $this->role === self::COACH || $this->role === self::GHOST_COACH;
    }


    public function isInvited()
    {
        return 	$this->role === self::INVITED_PLAYER || 
        		$this->role === self::INVITED_COACH || 
        		$this->role === self::INVITED_PLAYER_AND_FAN || 
        		$this->role === self::INVITED_COACH_AND_FAN;
    }


    public function isAnInvitedPlayer()
    {
        return $this->role === self::INVITED_PLAYER || $this->role === self::INVITED_PLAYER_AND_FAN;
    }


    public function isAnInvitedCoach()
    {
        return $this->role === self::INVITED_COACH || $this->role === self::INVITED_COACH_AND_FAN;
    }


    public function hasRequestedToJoin()
    {
        return $this->role === self::REQUESTED_TO_JOIN || $this->role === self::REQUESTED_TO_JOIN_AND_FAN;
    }


    //returns the role value for this role
    public function makePlayer()
    {
    	return self::PLAYER;
    }


    //returns the role value for this role
    public function makeGhostPlayer()
    {
    	return self::GHOST_PLAYER;
    }


    //returns the role value for this role
    public function makeCoach()
    {
    	return self::COACH;
    }


    //returns the role value for this role
    public function makeGhostCoach()
    {
    	return self::GHOST_COACH;
    }


    //returns the role value after toggling their fan status
    public function toggleFan()
    {
    	if ($this->isMember())
    	{
    		throw new Exception('User is already a member.');
    	}

    	else if ($this->isFan())
    	{
    		return $this->removeFan();
    	}

    	return $this->makeFan();
    }


    //returns new fan role
    public function makeFan()
    {
    	if ($this->isAnInvitedPlayer())
        {
        	return self::INVITED_PLAYER_AND_FAN;
        }

        else if ($this->isAnInvitedCoach())
        {
        	return self::INVITED_COACH_AND_FAN;
        }

        else if ($this->hasRequestedToJoin())
        {
        	return self::REQUESTED_TO_JOIN_AND_FAN;
        }

        return self::FAN;
    }


    //returns new role or false if they now don't have one
    public function removeFan()
    {
    	if ($this->isAnInvitedPlayer())
        {
        	return self::INVITED_PLAYER;
        }

        else if ($this->isAnInvitedCoach())
        {
        	return self::INVITED_COACH;
        }

        else if ($this->hasRequestedToJoin())
        {
        	return self::REQUESTED_TO_JOIN;
        }

        return false;
    }


    //given a role, invite this user to the team
    public function invite($role)
    {
    	if ($this->isMember())
        {
        	//don't change anything if they're a member already
            return $this->role;
        }

        else if ($this->isFan())
        {
        	if ($role == self::INVITED_PLAYER)
        		return self::INVITED_PLAYER_AND_FAN;

        	else if ($role == self::INVITED_COACH)
        		return self::INVITED_COACH_AND_FAN;
        }

        return $role;
    }











}