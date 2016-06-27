<?php
namespace App\RC\NewsFeed;

class NewsFeedTypes
{
	/**
	 * A lookup for fetching the integer value of a type of entry
	 * 
	 * @var array
	 */
    private $types = [
        'team_event_create'     => 0,
        'team_event_update'     => 1,
        'team_event_delete'     => 2,
        'team_post'             => 3,
        'team_stats'            => 4,
        'user_post'             => 20,
        'user_stats'            => 21,
    ];


    /**
     * Verify that the given type is supported and return its integer value
     * 
     * @param  string $type
     * @return int
     */
    public function verifyAndTransform($type)
    {
        if (isset($this->types[$type])) {
            return $this->types[$type];
        }

        throw new Exception("'$type' is an unsupported feed type"); 
    }
}