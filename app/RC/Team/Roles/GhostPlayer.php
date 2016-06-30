<?php
namespace App\RC\Team\Roles;

class GhostPlayer extends Role
{
	/**
	 * The ID of this role, stored this way in rc_team_roles table
	 * 
	 * @var integer
	 */
	protected $id = 3;


	/**
	 * Name of this role, stored this way in rc_team_roles table
	 * 
	 * @var string
	 */
	protected $name = 'ghost_player';
}