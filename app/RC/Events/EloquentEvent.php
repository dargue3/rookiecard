<?php
namespace App\RC\Events;

use App\Team;
use App\Stat;
use App\Event;
use App\NewsFeed;
use Carbon\Carbon;
use App\Exceptions\ApiException;
use App\Events\TeamCreatedAnEvent;
use App\RC\Events\HandlesEventLogic;
use App\RC\NewsFeed\NewsFeedRepository;
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
	protected $maxEvents;


	public function __construct()
	{
		$this->maxEvents = config('rookiecard.events.maximum');
	}


	/**
	 * Checks if a given team has reached their maximum
	 * 
	 * @param  int   $team_id
	 * @return boolean
	 */
	public function teamHasCreatedTooManyEvents($team_id)
	{
		return Event::where('owner_id', $team_id)->count() > $this->maxEvents;
	}


	/**
	 * Kickoff the process of creating an event given the input data
	 * 
	 * @param  array 	$requestData 
	 * @param  Team 	$team
	 * @return void      
	 */
	public function store(array $requestData, Team $team)
	{
		$handler = new HandlesEventLogic($requestData, $team, $this);
		$events = $handler->create();

		event(new TeamCreatedAnEvent($team->id, $events));

		return $events;
	}


	/**		
	 * Update the event to match given request data
	 * 
	 * @param  Team    	$team    
	 * @param  array 	$requestData 
	 * @param  int     	$id      
	 * @return Event           
	 */
	public function update(array $requestData, Team $team, $id)
	{
		$event = Event::findOrFail($id);

        // keep a copy of the old event
        $oldEvent = $event;

		$start = $request->start;
        $end = $request->end;
        
       
        $event->title = $request->title;
        $event->type = intval($request->type);
        $tz = $request->session()->get('timezone') ?: 'UTC';

        $event->start = Carbon::createFromTimestamp($start, $tz)->timezone('UTC')->timestamp;
        $event->end = Carbon::createFromTimestamp($end, $tz)->timezone('UTC')->timestamp;

        if($event->end < $event->start) {
            throw new ApiException("The event ends before it starts");
        }

        $event->details = $request->details;
        $event->save();


        // only tell the team and create news feed entry if the event hasn't happened yet
        if(Carbon::createFromTimestampUTC($event->end)->isFuture()) {
            $meta = ['event' => $event, 'oldEvent' => $oldEvent];
            //$feed = (new NewsFeed)->updateTeamEvent($team, $meta);
        }
        else {
            $feed = null;
        }
        
        return $feed;
	}

	public function delete($id)
	{

	}

	/**		
	 * Delete the event and associated stats
	 * 
	 * @param  Team    $team    
	 * @param  int     $id      
	 * @return Event           
	 */
	// public function delete(Team $team, $id)
	// {
	// 	$event = Event::findOrFail($id);

	// 	// only tell the team and create news feed entry if the event hasn't happened yet
 //        if (Carbon::createFromTimestampUTC($event->end)->isFuture()) {
 //            $meta = ['event' => $event];
 //            $feed = (new NewsFeed)->deleteTeamEvent($team, $meta);
 //        }
 //        else {
 //            $feed = null;
 //        }

 //        // delete any stats attached to this event
 //        Stat::deleteByEvent($team, $event);

 //        $event->delete();

 //        return $feed;
	// }
}