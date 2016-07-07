<?php
namespace App\RC\User;

use Auth;
use App\User;
use Carbon\Carbon;

class TransformsUserData
{
	/**
	 * Format the given user object for front-end consumption
	 * 
	 * @param  User   $user 
	 * @return array       
	 */
	public function user(User $user)
	{
		$formatted = [
            'id'            => $user->id,
            'username'      => $user->username,
            'firstname'     => $user->firstname,
            'lastname'      => $user->lastname,
            'pic'           => $user->pic,
            'age'           => Carbon::createFromTimestampUTC($user->birthday)->age,
            'gender'		=> $user->gender,
        ]; 

        if ($user->id == Auth::id()) {
        	$formatted['email'] = $user->email;
        	$formatted['settings'] = $user->settings;
		} 

		return $formatted;
	}


	/**
	 * Format the given collection of teams for front-end consumption
	 * 
	 * @param  Illuminate\Support\Collection  $teams
	 * @return array        
	 */
	public function teams($teams)
	{
		$formatted = [];

		foreach ($teams as $team) {
			$teamData = $team['team']->brief();
			$roles = $team['roles'];

			$formatted[] = array_merge($teamData, $roles);
		}

		return $formatted;
	}
}