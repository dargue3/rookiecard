<?php

/**
 * The rookiecard master config file
 */

return [

	/**
	 * Teams' event creation limits
	 */
	'events' => [
		'limitPerTeam'		=> 5000,
		'limitPerRequest' 	=> 500,
	],

	/**
	 * Reserved route keywords, can't be used for teams or users
	 */
	'reserved' => [
		'usernames' => [
			'team', 'secret_panel', 'options', 'compare',
			'login', 'logout', 'register', 'password', 'oauth', 'api'
		],
		'teamnames'	=> ['create'],
	],








];