<?php
namespace App\RC\NewsFeed;

use Auth;
use Exception;
use App\NewsFeed;
use App\Repositories\EloquentRepository;

class EloquentNewsFeed extends EloquentRepository implements NewsFeedRepository
{
	/**
	 * The path of this model, to be used in EloquentRepository
	 * 
	 * @var string
	 */
	protected $modelPath = 'App\NewsFeed';


    /**
     * The type of entry that is being created
     * 
     * @var string
     */
    public $type;


    /**
     * The id of the owner of this status
     * 
     * @var int
     */
    public $owner_id;


    /**
     * Meta data to be attached to the feed entry
     * 
     * @var array
     */
    public $meta;


	/**
	 * An event has fired that creates news feed entry
	 * 
     * @param  int      $owner_id
	 * @param  string   $type
	 * @param  array    $meta
	 * @return NewsFeed      
	 */
    public function add($owner_id, $type, array $meta = [])
    {
        $this->type = $type;
        $this->owner_id = $owner_id;
        $this->meta = $meta;

        return $this->store();
    }


    /**
     * Store this entry in the database
     * 
     * @return void
     */
    private function store()
    {
        return NewsFeed::create([
            'owner_id'   => $this->owner_id,
            'creator_id' => Auth::id(),
            'type'       => $this->type,
            'meta'       => json_encode($this->meta),
        ]);
    }


    /**
     * Fetch all feed entries for a given team
     * 
     * @param  int $team_id 
     * @return Illuminate\Support\Collection          
     */
    public function getTeamFeed($team_id)
    {
        return NewsFeed::teamEntries($team_id)->orderBy('created_at', 'desc')->get();
    }
}