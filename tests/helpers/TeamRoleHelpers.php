<?php
use App\TeamRole;
use App\RC\Team\Roles\Admin;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;

trait TeamRoleHelpers
{

    /**
     * List of roles that fulfill the RoleInterface contract
     * 
     * @var array
     */
	public $roles = [
        Admin::class,
        Player::class,
        GhostPlayer::class,
        Coach::class,
        GhostCoach::class,
        Fan::class,
        InvitedPlayer::class,
        InvitedCoach::class,
        RequestedToJoin::class,
    ];

	public function seedRolesTable()
	{
	    foreach($this->roles as $role) {
	        TeamRole::create(['id' => (new $role)->id(), 'name' => (new $role)->name()]);
	    }
	}
}