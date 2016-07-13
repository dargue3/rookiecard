<?php
namespace App\RC\Sports;

use Exception;

class Sport
{
	/**
	 * Array of current supported sport classes
	 * 
	 * @var array
	 */
	protected $sports = [
		'basketball' 	=> Basketball::class,
	];


	/**
	 * The sports' integer values lookup array
	 * 
	 * @var array
	 */
	protected $stringToInt = [
		'basketball'	=> 0,
	];


	/**
	 * The sports' string names lookup array
	 * 
	 * @var array
	 */
	protected $intToString = [
		'0'		=> 'basketball',
	];
	

	/**
	 * Fetch an instance of the desired sport by its id
	 * 
	 * @param  string $id 
	 * @return SportInterface
	 */
	public static function find($id)
	{
		$self = new static;

		if (! isset($self->sports[$id])) {
			throw new Exception("No sports with the id '$id' are currently supported");
		}

		$sport = new $self->sports[$id];

		if (! is_a($sport, SportInterface::class)) {
			throw new Exception("Sport with the id '$id' does not implement SportInterface");
		}

		return $sport;
	}


	/**
	 * Fetch all the positions a player could play
	 * 
	 * @return array
	 */
	public function positions()
	{
		return $this->positions;
	}


	/**
	 * Fetch the array of valid stat keys
	 * 
	 * @return array
	 */
	public function validKeys()
	{
		return $this->validKeys;
	}


	/**
	 * Fetch all possible keys for player stats
	 * 
	 * @return array
	 */
	public function playerStatKeys()
	{
		return $this->playerKeys;
	}


	/**
	 * Fetch all possible keys for team stats
	 * 
	 * @return array
	 */
	public function teamStatKeys()
	{
		return $this->teamKeys;
	}


	/**
	 * Return the name of this sport class
	 * 
	 * @return string
	 */
	public function name()
	{
		return $this->name;
	}


	/**
	 * Sort the keys that the user wants to see on their page into team and player keys
	 * 
	 * @param  array  $keys The stat keys that the user wants on their page
	 * @return array  		Formatted array for team meta data
	 */
	public function sortKeys(array $keys)
	{
		$this->validate($keys);

		$player = $this->permanentPlayerKeys;
		$team = $this->permanentTeamKeys;

		foreach ($this->playerKeys as $key) {
			if (in_array($key, $keys)) {
				$player[] = $key;
			}
		}

		foreach ($this->teamKeys as $key) {
			if (in_array($key, $keys)) {
				$team[] = $key;
			}
		}

		return ['playerCols' => $player, 'teamCols' => $team];
	}


	/**
	 * Check that this array of stats only has valid stat keys
	 * 
	 * @param  array $stats
	 * @return array 
	 */
	protected function validate(array $stats)
	{
		if ($this->isAssociative($stats)) {
			foreach($stats as $key => $value) {
				if (! in_array($key, $this->validKeys)) {
					throw new Exception("'$key' is not a valid stat key in Basketball");
				}
			}
		}
		else {
			foreach($stats as $key) {
				if (! in_array($key, $this->validKeys)) {
					throw new Exception("'$key' is not a valid stat key in Basketball");
				}
			}
		}

		return $stats;
	}


	/**
	 * Check whether or not this array of stats is associative
	 * 
	 * @param  array   $stats 
	 * @return boolean        
	 */
	public function isAssociative(array $stats)
	{
		return array_keys($stats) !== range(0, count($stats) - 1);
	}


	/**
	 * Validate and format the team stats before returning back to HandlesStatLogic
	 * 
	 * @param  array $stats
	 * @return array
	 */
	public function validateTeamStats($stats)
	{
		return $this->validate($stats);
	}


	/**
	 * Validate and format the player stats before returning back to HandlesStatLogic
	 * 
	 * @param  array $stats
	 * @return array
	 */
	public function validatePlayerStats($stats)
	{
		$validated = [];
		foreach ($stats as $stat) {

			if (isset($stat['min']) and $stat['min'] == 0) {
				// don't include stats for a player that didn't play
				continue;
			}

			else if (isset($stat['dnp']) and $stat['dnp'] == true) {
				// don't include stats for a player that didn't play
				continue;
			}

			unset($stat['dnp']);

			$validated[] = $this->validate($stat);
		}

		return $validated;
	}


	/**
	 * Convert the given sport string to its integer counterpart
	 * 
	 * @param  string $sport 
	 * @return int        
	 */
	public static function convertSportToInt($sport)
	{
		$self = new static;
		if (isset($self->stringToInt[$sport])) {
            return $self->stringToInt[$sport];
        }

        throw new Exception("'$sport' is an unsupported sport"); 
	}


	/**
     * Converts a given sport integer to its string counterpart
     * 
     * @param  int $sport
     * @return string
     */
    public static function convertSportToString($sport)
    {
    	$self = new static;
        if (isset($self->intToString[$sport])) {
            return $self->intToString[intval($sport)];
        }

        throw new Exception("'$sport' is an unsupported sport"); 
    }
}