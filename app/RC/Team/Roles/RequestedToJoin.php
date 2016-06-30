<?php
namespace App\RC\Team\Roles;

class RequestedToJoin extends Role
{
	/**
	 * The ID of this role, stored this way in rc_team_roles table
	 * 
	 * @var integer
	 */
	protected $id = 9;


	/**
	 * Name of this role, stored this way in rc_team_roles table
	 * 
	 * @var string
	 */
	protected $name = 'requested_to_join';
}