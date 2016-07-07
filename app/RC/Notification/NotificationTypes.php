<?php
namespace App\RC\Notification;

trait NotificationTypes
{
	/**
	 * A lookup for fetching the integer value of a type of entry
	 * 
	 * @var array
	 */
    protected $stringToInt = [
        'team_event_create'     => 0,
        'team_event_update'     => 1,
        'team_event_delete'     => 2,
        'team_post'             => 3,
        'team_stats'            => 4,
        'user_post'             => 20,
        'user_stats'            => 21,
    ];


    /**
     * A lookup for fetching the string value of a type of entry
     * 
     * @var array
     */
    protected $intToString = [
        '0'     => 'team_event_create',
        '1'     => 'team_event_update',
        '2'     => 'team_event_delete',
        '3'     => 'team_post',
        '4'     => 'team_stats',
        '20'    => 'user_post',
        '21'    => 'user_stats',
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

        throw new Exception("'$type' is an unsupported notification type"); 
    }


    /**
     * Converts a given type integer to its string counterpart
     * 
     * @param  int $type
     * @return string
     */
    public function convertTypeToString($type)
    {
        if (isset($this->intToString[intval($type)])) {
            return $this->intToString[intval($type)];
        }

        throw new Exception("'$type' is an unsupported notification type"); 
    }
}