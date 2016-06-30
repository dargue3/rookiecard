<?php
namespace App\RC\Team\Roles;

class Coach extends Role
{
	/**
	 * The ID of this role, stored this way in rc_team_roles table
	 * 
	 * @var integer
	 */
	protected $id = 4;


	/**
	 * Name of this role, stored this way in rc_team_roles table
	 * 
	 * @var string
	 */
	protected $name = 'coach';
}