<?php
namespace App\Repositories;

use App\Event;
use App\Team;
use App\Stat;
use App\NewsFeed;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\RC\Events\CreatesEvents;
use App\Exceptions\ApiException;
use App\Http\Requests\NewEventRequest;

class EventRepository
{
	/**
	 * Create a new event for this team
	 * 
	 * @param  NewEventRequest $request 
	 * @param  Team   			$team
	 * @return Event      
	 */
	public function create(NewEventRequest $request, Team $team)
	{
		(new CreatesEvents($request, $team))->create();
	}


	/**		
	 * Update the event to match request data
	 * 
	 * @param  Team    			$team    
	 * @param  NewEventRequest $request 
	 * @param  int     			$id      
	 * @return Event           
	 */
	public function update(NewEventRequest $request, Team $team, $id)
	{
		$event = Event::findOrFail($id);

        // keep a copy of the old event
        $oldEvent = $event;

		$start = $request->start;
        $end = $request->end;
        
       
        $event->title = $request->title;
        $event->type = intval($request->type);
        $tz = $request->session()->get('timezone') ?: 'UTC';

        $event->start = Carbon::parse($start, $tz)->timezone('UTC')->timestamp;
        $event->end = Carbon::parse($end, $tz)->timezone('UTC')->timestamp;

        if($event->end < $event->start) {
            throw new ApiException("The event ends before it starts");
        }

        $event->details = $request->details;
        $event->save();


        // only tell the team and create news feed entry if the event hasn't happened yet
        if(Carbon::createFromTimestampUTC($event->end)->isFuture()) {
            $meta = ['event' => $event, 'oldEvent' => $oldEvent];
            $feed = (new NewsFeed)->updateTeamEvent($team, $meta);
        }
        else {
            $feed = null;
        }
        
        return $feed;
	}


	/**		
	 * Delete the event and associated stats
	 * 
	 * @param  Team    $team    
	 * @param  Request $request 
	 * @param  int     $id      
	 * @return Event           
	 */
	public function delete(Request $request, Team $team, $id)
	{
		$event = Event::findOrFail($id);

		// only tell the team and create news feed entry if the event hasn't happened yet
        if (Carbon::createFromTimestampUTC($event->end)->isFuture()) {
            $meta = ['event' => $event];
            $feed = (new NewsFeed)->deleteTeamEvent($team, $meta);
        }
        else {
            $feed = null;
        }

        // delete any stats attached to this event
        Stat::deleteByEvent($team, $event);

        $event->delete();

        return $feed;
	}
}