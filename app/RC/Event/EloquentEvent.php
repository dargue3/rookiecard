<?php
namespace App\RC\Event;

use App;
use Auth;
use App\Event;
use App\RC\Stat\StatRepository;
use App\Events\TeamCreatedAnEvent;
use App\Events\TeamUpdatedAnEvent;
use App\Events\TeamDeletedAnEvent;
use App\RC\Event\HandlesEventLogic;
use App\Repositories\EloquentRepository;

class EloquentEvent extends EloquentRepository implements EventRepository
{

	/**
	 * The path of this model, to be used in EloquentRepository
	 * 
	 * @var string
	 */
	protected $modelPath = 'App\Event';


	/**
	 * The max number of events a team can create before it's most definitely spam
	 * 
	 * @var integer
	 */
	public $limitPerTeam;


	public function __construct()
	{
		$this->limitPerTeam = config('rookiecard.events.limitPerTeam');
	}


	/**
	 * Checks if a given team has reached their maximum
	 * 
	 * @param  int   $team_id
	 * @return boolean
	 */
	public function teamHasCreatedTooManyEvents($team_id)
	{
		return Event::where('owner_id', $team_id)->count() > $this->limitPerTeam;
	}


	/**
	 * Fetch all of the events associated with the given team
	 * 
	 * @param  int $team_Id
	 * @return Illuminate\Support\Collection
	 */
	public function getTeamEvents($team_id)
	{
		return Event::where('owner_id', $team_id)->orderBy('start')->get();
	}


	/**
     * Returns whether or not this event is in the future
     * 
     * @param int $event_id
     * @return boolean
     */
    public function hasNotHappenedYet($event_id)
    {
    	$event = Event::findOrFail($event_id);

        return Carbon::createFromTimestampUTC($event->start)->isFuture();
    }


    /**
     * Returns whether or not this event has already happened
     * 
     * @param int $event_id
     * @return boolean
     */
    public function hasHappened($event_id)
    {
    	$event = Event::findOrFail($event_id);

        return Carbon::createFromTimestampUTC($event->end)->isPast();
    }


    /**
     * Returns whether or not this event is currently happening
     * 
     * @param int $event_id
     * @return boolean
     */
    public function isGoingOnNow($event_id)
    {
    	$event = Event::findOrFail($event_id);

        $start = Carbon::createFromTimestampUTC($event->start);
        $end = Carbon::createFromTimestampUTC($event->end);

        return Carbon::now()->between($start, $end);
    }


	/**
	 * Kickoff the process of creating an event given the input data
	 * 
	 * @param  array 	$requestData 
	 * @param  int 		$team_id
	 * @return void      
	 */
	public function store(array $requestData, $team_id)
	{
		$handler = new HandlesEventLogic($requestData, $team_id, $this);
		$events = $handler->create();

		event(new TeamCreatedAnEvent($team_id, $events));
	}



	/**		
	 * Update the event to match given request data
	 * 
	 * @param  array 	$requestData 
	 * @param  int     	$team_id      
	 * @param  int     	$id      
	 * @return void           
	 */
	public function update(array $requestData, $team_id, $id)
	{
		$new = new HandlesEventLogic($requestData, $team_id, $this);

		$event = Event::findOrFail($id);
		$original = $event; // make a copy of the original

		$event->title 		= $new->title;
		$event->type 		= $new->type;
		$event->details 	= $new->details;
		$event->start 		= $new->start->timestamp;
		$event->end 		= $new->end->timestamp;
		$event->creator_id 	= Auth::user()->id;
		$event->save();

		event(new TeamUpdatedAnEvent($team_id, $event, $original));
	}


	/**		
	 * Delete the given event and associated stats
	 *    
	 * @param  int   $team_id      
	 * @param  int   $id      
	 * @return void           
	 */
	public function delete($team_id, $id)
	{
		$event = Event::findOrFail($id);
		$event->delete();

		$stat = App::make(StatRepository::class);

		$stat->deleteByEvent($team_id, $id);

		event(new TeamDeletedAnEvent($team_id, $event));
	}


	/**
	 * Delete all the events that belong to a given team
	 * 
	 * @param  int $team_id 
	 * @return void
	 */
	public function deleteByTeam($team_id)
	{
		$events = Event::where('owner_id', $team_id)->get();

		foreach($events as $event) {
			$this->delete($team_id, $event->id);
		}
	}
}