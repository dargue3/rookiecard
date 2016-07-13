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
		'basketball' => Basketball::class,
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
	 * @return Sport
	 */
	public static function find($id)
	{
		$self = new static;

		if (! isset($self->sports[strval($id)])) {
			throw new Exception("No sports with the id '$id' are currently supported");
		}

		$sport = $self->sports[strval($id)];

		return $self->ensureContract(new $sport);
	}


	/**
	 * Leverage type-hinting to ensure this sport implements the Sport interface
	 * 
	 * @return SportInterface
	 */
	private function ensureContract(SportInterface $sport)
	{
		return $sport;
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