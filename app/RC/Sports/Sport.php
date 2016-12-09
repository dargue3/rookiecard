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
	 * Return the name of this sport class
	 * 
	 * @return string
	 */
	public function name()
	{
		return $this->name;
	}


	/**
     * Return the stat keys for this sport
     * 
     * @return array
     */
    public function statKeys()
    {
    	return $this->statKeys;
    }


	/**
     * Return the default stat keys for this sport
     * 
     * @return array
     */
    public function defaultStatKeys()
    {
    	return $this->defaultKeys;
    }


    /**
     * Return the keys that are always shown in the stat table
     * 
     * @return array
     */
    public function alwaysShown()
    {
    	return $this->alwaysShown;
    }


    /**
     * Return the keys that are only included when storing new stats
     * 
     * @return array
     */
    public function keysOnlyUsedDuringCreation()
    {
    	return $this->keysOnlyUsedDuringCreation;
    }


    /**
     * Return the positions for this sport
     * 
     * @return array 
     */
    public function positions()
    {
    	return $this->positions;
    }


    /**
     * Return the default backdrop photo for this sport
     * 
     * @return string 
     */
    public function backdropPath()
    {
    	return $this->defaultBackdropPath;
    }


    /**
     * Return the default profile photo for this sport
     * 
     * @return string 
     */
    public function profilePicPath()
    {
    	return $this->defaultProfilePicPath;
    }


	/**
	 * Sort the keys that the user wants to see on their page into team and player keys
	 * 
	 * @param  array  $keys The stat keys that the user wants on their page
	 * @return array  		Formatted array for team meta data
	 */
	public function validateKeys(array $keys)
	{
		if (! $keys) {
			return $this->defaultStatKeys();
		}

		$reordered = [];
		$this->validate($keys);

		// add in the keys always shown by this sport
		$keys = array_merge($keys, $this->alwaysShown());

		// reorder the stats to the way they're stored in statKeys
		foreach ($this->statKeys() as $key) {
			if (in_array($key, $keys)) {
				$reordered[] = $key;
			}
		}

		return $reordered;
	}


	/**
	 * Valid stat keys during the creation process
	 * 
	 * @return array
	 */
	public function validKeys()
	{
		return array_merge($this->keysOnlyUsedDuringCreation(), $this->statKeys());
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
			foreach ($stats as $key => $value) {
				if (! in_array($key, $this->validKeys())) {
					throw new Exception("'$key' is not a valid stat key in $this->name");
				}
			}
		}
		else {
			foreach ($stats as $key) {
				if (! in_array($key, $this->validKeys())) {
					throw new Exception("'$key' is not a valid stat key in $this->name");
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
	 * Validate and format the player stats before returning back to HandlesStatLogic
	 * 
	 * @param  array $stats
	 * @return array
	 */
	public function validatePlayerStats($stats)
	{
		$validated = [];
		foreach ($stats as $stat) {
			if ($this->theyDidNotPlay($stat)) {
				// don't include stats for a player that didn't play
				continue;
			}

			$validated[] = $this->validate($stat);
		}

		return $validated;
	}


	/**
     * Unset relevent keys before stats object is inserted into db
     * 
     * @param  array $stats 
     * @return array        
     */
    public function unsetKeysBeforeCreate($stats)
    {
    	foreach ($this->keysOnlyUsedDuringCreation() as $key) {
    		unset($stats[$key]);
    	}

    	return $stats;
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