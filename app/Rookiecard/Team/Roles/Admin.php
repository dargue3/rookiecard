<?php
namespace App\Rookiecard\Team\Roles;

use App\Rookiecard\Team\Roles\RoleInterface;

class Admin implements RoleInterface
{
	/**
	 * The ID of this role, stored this way in rc_team_roles table
	 * 
	 * @var integer
	 */
	private $id = 1;


	/**
	 * Name of this role, stored this way in rc_team_roles table
	 * 
	 * @var string
	 */
	private $name = 'admin';


	/**
	 * Returns the ID of this role
	 * 
	 * @return integer
	 */
	public function id()
	{
		return $this->id;
	}



	/**
	 * Returns the name of this role
	 * 
	 * @return string
	 */
	public function name()
	{
		return $this->name;
	}
	
}