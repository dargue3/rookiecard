<?php
namespace App\RC\Event;

use Exception;

trait EventTypes
{
	/**
     * A lookup for fetching the integer value of an event type
     * 
     * @var array
     */
    protected $stringToInt = [
        'practice'      => 0,
        'home_game'     => 1,
        'away_game'     => 2,
        'other'         => 3,
    ];


    /**
     * A lookup for fetching the string value of an event type
     * 
     * @var array
     */
    protected $intToString = [
        '0'     => 'practice',
        '1'     => 'home_game',
        '2'     => 'away_game',
        '3'		=> 'other',
    ];


    /**
     * Converts a given type string to its integer counterpart
     * 
     * @param  string $type 
     * @return int       
     */
    public function convertTypeToInt($type)
    {
    	if (isset($this->stringToInt[$type])) {
            return $this->stringToInt[$type];
        }

        throw new Exception("'$type' is an unsupported event type"); 
    }


    /**
     * Converts a given type string to its integer counterpart
     * 
     * @param  int $type 
     * @return string       
     */
    public function convertTypeToString($type)
    {
    	if (isset($this->intToString[$type])) {
            return $this->intToString[$type];
        }

        throw new Exception("'$type' is an unsupported event type"); 
    }





}