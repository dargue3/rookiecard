<?php
namespace App\RC\Team\Roles;

use App\RC\Team\Roles\RoleInterface;
use App\RC\Team\Roles\MemberInterface;

class Player implements RoleInterface, MemberInterface
{
	/**
	 * The ID of this role, stored this way in rc_team_roles table
	 * 
	 * @var integer
	 */
	private $id = 2;


	/**
	 * Name of this role, stored this way in rc_team_roles table
	 * 
	 * @var string
	 */
	private $name = 'player';


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