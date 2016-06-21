<?php

use App\User;

trait SignedInUser
{	
	/**
	 * The logged in user instance
	 * @var User
	 */
	public $user;


	/**
	 * Login as either a random or given user and save their credentials
	 *  
	 * @param  User|null $user 
	 * @return TestCase          
	 */
	public function signIn(User $user = null)
	{
		$this->user = $user ?: factory(User::class)->create();

		$this->actingAs($this->user);

		return $this->user;
	}
}