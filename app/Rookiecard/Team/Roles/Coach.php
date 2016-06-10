<?php
namespace App\Rookiecard\Team\Roles;

use App\Rookiecard\Team\Roles\RoleInterface;
use App\Rookiecard\Team\Roles\MemberInterface;

class Coach implements RoleInterface, MemberInterface
{
	/**
	 * The ID of this role, stored this way in rc_team_roles table
	 * 
	 * @var integer
	 */
	private $id = 4;


	/**
	 * Name of this role, stored this way in rc_team_roles table
	 * 
	 * @var string
	 */
	private $name = 'coach';


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



	/**
	 * Returns the default meta data associated with this role
	 * 
	 * @return array
	 */
	public function getDefaultMetaData()
	{
		return [
            'positions' => [],
            'num'       => '',
        ];
	}


	
}