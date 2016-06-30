<?php
namespace App\RC\Team\Roles;

class InvitedPlayer extends Role
{
	/**
	 * The ID of this role, stored this way in rc_team_roles table
	 * 
	 * @var integer
	 */
	protected $id = 7;


	/**
	 * Name of this role, stored this way in rc_team_roles table
	 * 
	 * @var string
	 */
	protected $name = 'invited_player';
}