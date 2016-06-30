<?php
namespace App\RC\Team\Roles;

abstract class Role implements RoleInterface
{
	/**
	 * Returns the ID of this role
	 * 
	 * @return int
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