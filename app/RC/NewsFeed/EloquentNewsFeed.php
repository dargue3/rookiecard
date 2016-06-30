<?php
namespace App\RC\NewsFeed;

use Exception;
use Illuminate\Support\Facades\Auth;
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
    protected $type;


    /**
     * The id of the owner of this status
     * 
     * @var int
     */
    protected $owner_id;


    /**
     * Meta data to be attached to the feed entry
     * 
     * @var array
     */
    protected $meta;


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
       return $this->create([
            'type'       => $this->type,
            'meta'       => json_encode($this->meta),
            'owner_id'   => $this->owner_id,
            'creator_id' => Auth::user()->id
        ]);
    }
}